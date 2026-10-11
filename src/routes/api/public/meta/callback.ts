import { createFileRoute } from '@tanstack/react-router';

const GRAPH = 'https://graph.facebook.com/v21.0';

export const Route = createFileRoute('/api/public/meta/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const url = new URL(request.url);
        const state = url.searchParams.get('state') ?? '';
        const code = url.searchParams.get('code');
        const { data: st } = await supabaseAdmin.from('oauth_states').select('*').eq('state', state).maybeSingle();
        if (!st) return new Response('رابط الربط غير صالح أو منتهي.', { status: 400, headers: { 'content-type': 'text/plain; charset=utf-8' } });
        await supabaseAdmin.from('oauth_states').delete().eq('state', state);
        const back = (status: string, msg?: string) => Response.redirect(`${st.return_origin}/connect/${st.platform}?result=${status}${msg ? `&message=${encodeURIComponent(msg)}` : ''}`, 302);
        if (Date.now() - new Date(st.created_at).getTime() > 15 * 60_000) return back('error', 'انتهت مهلة الربط، حاول مجددًا.');
        if (!code) return back('error', url.searchParams.get('error_description') ?? 'تم إلغاء الربط.');
        const appId = process.env['META_APP_ID']!; const secret = process.env['META_APP_SECRET']!;
        const fail = async (msg: string) => {
          await supabaseAdmin.from('platform_connections').upsert({ client_id: st.client_id, user_id: st.user_id, platform: st.platform, account_name: st.platform, provider_account_id: '', status: 'error', error: msg }, { onConflict: 'client_id,platform' });
          return back('error', msg);
        };
        try {
          const short = await (await fetch(`${GRAPH}/oauth/access_token?client_id=${appId}&client_secret=${secret}&redirect_uri=${encodeURIComponent(st.redirect_uri)}&code=${encodeURIComponent(code)}`)).json() as any;
          if (!short.access_token) return fail(short.error?.message ?? 'تعذر الحصول على رمز الدخول');
          const long = await (await fetch(`${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${secret}&fb_exchange_token=${short.access_token}`)).json() as any;
          const userToken = long.access_token ?? short.access_token;
          const pages = await (await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${userToken}`)).json() as any;
          const list: any[] = pages.data ?? [];
          const page = st.platform === 'instagram' ? list.find(p => p.instagram_business_account) : list[0];
          if (!page) return fail(st.platform === 'instagram' ? 'لا يوجد حساب إنستغرام للأعمال مرتبط بأي صفحة فيسبوك لديك.' : 'لم يتم العثور على صفحة فيسبوك تديرها.');
          const sub = await (await fetch(`${GRAPH}/${page.id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_echoes,feed&access_token=${page.access_token}`, { method: 'POST' })).json() as any;
          if (!sub.success) return fail(sub.error?.message ?? 'تعذر تفعيل استقبال الرسائل للصفحة');
          const ig = page.instagram_business_account;
          const { data: conn, error } = await supabaseAdmin.from('platform_connections').upsert({
            client_id: st.client_id, user_id: st.user_id, platform: st.platform,
            account_name: st.platform === 'instagram' ? `@${ig.username}` : page.name,
            provider_account_id: st.platform === 'instagram' ? ig.id : page.id,
            page_id: page.id, status: 'connected', error: null, verified_at: new Date().toISOString(), revoked_at: null,
            metadata: { page_name: page.name },
          }, { onConflict: 'client_id,platform' }).select('id').single();
          if (error || !conn) return fail('تعذر حفظ الاتصال');
          await supabaseAdmin.from('connection_secrets').upsert({ connection_id: conn.id, client_id: st.client_id, access_token: page.access_token, updated_at: new Date().toISOString() });
          return back('connected');
        } catch (e) {
          return fail((e as Error).message);
        }
      },
    },
  },
});
