import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/evolution/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { ingestMessage, logEvent, safeEqual } = await import('@/lib/channels.server');
        const token = new URL(request.url).searchParams.get('token') ?? '';
        if (!/^[a-f0-9]{48}$/.test(token)) return new Response('unauthorized', { status: 401 });
        let body: any;
        try { body = await request.json(); } catch { return new Response('bad request', { status: 400 }); }
        const instance = typeof body?.instance === 'string' ? body.instance : '';
        const { data: conn } = await supabaseAdmin.from('platform_connections').select('id, client_id, instance_name').eq('platform', 'whatsapp').eq('instance_name', instance).maybeSingle();
        if (!conn) return new Response('unknown instance', { status: 404 });
        const { data: sec } = await supabaseAdmin.from('connection_secrets').select('webhook_token').eq('connection_id', conn.id).maybeSingle();
        if (!sec?.webhook_token || !safeEqual(sec.webhook_token, token)) return new Response('unauthorized', { status: 401 });

        const event = String(body.event ?? '').toLowerCase().replace(/_/g, '.');
        try {
          if (event === 'qrcode.updated') {
            const qr = body.data?.qrcode?.base64 ?? body.data?.base64 ?? null;
            await supabaseAdmin.from('platform_connections').update({ qr_code: qr, qr_expires_at: new Date(Date.now() + 45_000).toISOString(), status: 'pending' }).eq('id', conn.id);
          } else if (event === 'connection.update') {
            const state = body.data?.state;
            const phone = typeof body.data?.wuid === 'string' ? body.data.wuid.split('@')[0] : undefined;
            if (state === 'open' && (await import('@/lib/channels.server').then(m => m.evolution(`/instance/connectionState/${conn.instance_name}`)).then(r => r?.instance?.state).catch(() => null)) === 'open') await supabaseAdmin.from('platform_connections').update({ status: 'connected', qr_code: null, pairing_code: null, error: null, verified_at: new Date().toISOString(), revoked_at: null, ...(phone ? { phone_number: phone, account_name: `+${phone}` } : {}) }).eq('id', conn.id);
            else if (state === 'close') {
              await supabaseAdmin.from('platform_connections').update({ status: 'disconnected', verified_at: null }).eq('id', conn.id);
              const { notify } = await import('@/lib/whatsapp-bot.server');
              await notify(conn.client_id, 'disconnected', 'انقطع اتصال واتساب', 'أعد الربط من إعدادات واتساب.');
            }
          } else if (event === 'messages.upsert') {
            const items = Array.isArray(body.data) ? body.data : [body.data];
            for (const d of items) {
              const jid: string = d?.key?.remoteJid ?? '';
              if (!jid || jid.endsWith('@g.us') || jid === 'status@broadcast') continue;
              const msg = d.message ?? {};
              const text = msg.conversation ?? msg.extendedTextMessage?.text ?? msg.imageMessage?.caption ?? msg.videoMessage?.caption ?? null;
              const type = msg.imageMessage ? 'image' : msg.audioMessage ? 'audio' : msg.videoMessage ? 'video' : msg.documentMessage ? 'document' : 'text';
              const phone = jid.split('@')[0] ?? null;
              const r = await ingestMessage({ clientId: conn.client_id, platform: 'whatsapp', threadId: jid, externalId: d.key.id, name: d.key.fromMe ? null : d.pushName, phone, direction: d.key.fromMe ? 'outbound' : 'inbound', body: text, contentType: type, sentAt: new Date(Number(d.messageTimestamp ?? Date.now() / 1000) * 1000), payload: d });
              if (!d.key.fromMe && conn.instance_name) {
                const { handleInbound, notify } = await import('@/lib/whatsapp-bot.server');
                if (r.wasRead) await notify(conn.client_id, 'new_message', `رسالة جديدة من ${d.pushName || phone}`, text);
                await handleInbound({ clientId: conn.client_id, instance: conn.instance_name, conversationId: r.conversationId, isNew: r.isNew, jid, text });
              }
            }
          }
          await logEvent({ clientId: conn.client_id, platform: 'whatsapp', type: event || 'unknown', payload: body, status: 'processed' });
        } catch (e) {
          await logEvent({ clientId: conn.client_id, platform: 'whatsapp', type: event || 'unknown', payload: body, status: 'failed', error: (e as Error).message });
          await import('@/lib/whatsapp-bot.server').then(m => m.notify(conn.client_id, 'error', 'خطأ في معالجة رسالة واتساب', (e as Error).message)).catch(() => null);
          return new Response('error', { status: 500 });
        }
        return new Response('ok');
      },
    },
  },
});
