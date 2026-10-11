import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/meta/webhook')({
  server: {
    handlers: {
      // Meta subscription verification handshake
      GET: async ({ request }) => {
        const p = new URL(request.url).searchParams;
        const expected = process.env['META_WEBHOOK_VERIFY_TOKEN'];
        if (expected && p.get('hub.mode') === 'subscribe' && p.get('hub.verify_token') === expected) return new Response(p.get('hub.challenge') ?? '', { status: 200 });
        return new Response('forbidden', { status: 403 });
      },
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { hmacHex, safeEqual, ingestMessage, logEvent } = await import('@/lib/channels.server');
        const secret = process.env['META_APP_SECRET'];
        const raw = await request.text();
        const sig = request.headers.get('x-hub-signature-256') ?? '';
        if (!secret || !sig.startsWith('sha256=') || !safeEqual(sig.slice(7), await hmacHex(secret, raw))) return new Response('invalid signature', { status: 401 });
        let body: any; try { body = JSON.parse(raw); } catch { return new Response('bad request', { status: 400 }); }
        const platform = body.object === 'instagram' ? 'instagram' : body.object === 'page' ? 'facebook' : null;
        if (!platform) return new Response('ignored');
        for (const entry of body.entry ?? []) {
          const accountId = String(entry.id ?? '');
          const col = platform === 'instagram' ? 'provider_account_id' : 'page_id';
          const { data: conn } = await supabaseAdmin.from('platform_connections').select('id, client_id').eq('platform', platform).eq(col, accountId).is('revoked_at', null).maybeSingle();
          if (!conn) { await logEvent({ platform, type: 'unknown_account', externalId: accountId, payload: entry, status: 'ignored' }); continue; }
          try {
            for (const ev of entry.messaging ?? []) {
              if (!ev.message) continue;
              const outbound = String(ev.sender?.id) === accountId || ev.message.is_echo;
              const other = String(outbound ? ev.recipient?.id : ev.sender?.id);
              const att = ev.message.attachments?.[0];
              await ingestMessage({ clientId: conn.client_id, platform, threadId: other, externalId: ev.message.mid, direction: outbound ? 'outbound' : 'inbound', body: ev.message.text ?? null, contentType: att?.type ?? 'text', mediaUrl: att?.payload?.url ?? null, sentAt: new Date(Number(ev.timestamp ?? Date.now())), payload: ev });
            }
            await logEvent({ clientId: conn.client_id, platform, type: entry.messaging ? 'messages' : (entry.changes?.[0]?.field ?? 'event'), externalId: accountId, payload: entry, status: 'processed' });
          } catch (e) {
            await logEvent({ clientId: conn.client_id, platform, type: 'messages', externalId: accountId, payload: entry, status: 'failed', error: (e as Error).message });
          }
        }
        return new Response('EVENT_RECEIVED');
      },
    },
  },
});
