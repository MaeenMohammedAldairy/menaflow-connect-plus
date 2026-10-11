import { useCallback, useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { CircleAlert, CircleCheck, Loader2, RefreshCw, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SocialIcon, type SocialPlatform } from '@/components/social-icon';
import { useAccount } from '@/components/account-provider';
import { WhatsappPairing } from '@/components/whatsapp-pairing';
import { disconnectPlatform, getConnection, metaStartOAuth, whatsappRefresh, type ConnectionView } from '@/lib/channels.functions';

const statusText = { connected: 'متصل', pending: 'بانتظار المسح', disconnected: 'غير متصل', error: 'خطأ في الاتصال' } as const;

export function ConnectionPanel({ platform, label }: { platform: SocialPlatform; label: string }) {
  if (platform === 'whatsapp') return <WhatsappPairing />;
  return <MetaConnectionPanel platform={platform} label={label} />;
}

function MetaConnectionPanel({ platform, label }: { platform: SocialPlatform; label: string }) {
  const { refreshConnections } = useAccount();
  const fetchConn = useServerFn(getConnection);
  const waRefresh = useServerFn(whatsappRefresh);
  const disconnect = useServerFn(disconnectPlatform);
  const metaStart = useServerFn(metaStartOAuth);
  const [conn, setConn] = useState<ConnectionView>(null);
  const [busy, setBusy] = useState<'' | 'connect' | 'disconnect' | 'load'>('load');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setConn(platform === 'whatsapp' ? (await waRefresh()) ?? null : await fetchConn({ data: { platform } })); }
    catch { setError('تعذر تحميل حالة الاتصال.'); }
    finally { setBusy(b => (b === 'load' ? '' : b)); }
  }, [platform, fetchConn, waRefresh]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('result') === 'error') setError(p.get('message') ?? 'تعذر إكمال الربط.');
    void load();
  }, [load]);

  // Poll while waiting for QR scan
  useEffect(() => {
    if (platform !== 'whatsapp' || conn?.status !== 'pending') return;
    const t = setInterval(async () => {
      const next = await waRefresh().catch(() => null);
      if (next) { setConn(next); if (next.status === 'connected') void refreshConnections(); }
    }, 4000);
    return () => clearInterval(t);
  }, [platform, conn?.status, waRefresh, refreshConnections]);

  async function connect() {
    setBusy('connect'); setError('');
    try {
      {
        const { url } = await metaStart({ data: { platform, origin: window.location.origin } });
        const w = window.open(url, '_blank');
        if (!w) window.location.href = url;
      }
    } catch (e) { setError((e as Error).message || 'تعذر بدء الربط.'); }
    finally { setBusy(''); }
  }
  async function unlink() {
    setBusy('disconnect'); setError('');
    try { await disconnect({ data: { platform } }); await load(); await refreshConnections(); }
    catch (e) { setError((e as Error).message || 'تعذر فصل الحساب.'); }
    finally { setBusy(''); }
  }

  const status = conn?.status ?? 'disconnected';
  const connected = status === 'connected';
  return (
    <section className="connection-panel" aria-live="polite">
      <div className={`connection-status connection-status-${status}`}>
        {connected ? <CircleCheck /> : status === 'error' ? <CircleAlert /> : status === 'pending' ? <Loader2 className="animate-spin" /> : <Unplug />}
        <div><strong>{busy === 'load' ? 'جارٍ التحقق…' : statusText[status]}</strong>{connected && conn?.account_name && <span dir="ltr">{conn.account_name}</span>}</div>
      </div>
      {platform === 'whatsapp' && status === 'pending' && conn?.qr_code && (
        <div className="connection-qr">
          <img src={conn.qr_code.startsWith('data:') ? conn.qr_code : `data:image/png;base64,${conn.qr_code}`} alt="رمز QR لربط واتساب" width={240} height={240} />
          <p>افتح واتساب ← الأجهزة المرتبطة ← ربط جهاز، ثم امسح الرمز.</p>
        </div>
      )}
      {(conn?.error || error) && <p role="alert" className="platform-action-notice">{error || conn?.error}</p>}
      <div className="connection-actions">
        {!connected && (
          <Button variant="dashboard" className="platform-continue-button" onClick={connect} disabled={busy !== '' && busy !== 'load'}>
            {busy === 'connect' ? <Loader2 className="animate-spin" /> : <SocialIcon platform={platform} />}
            <span>{status === 'pending' ? 'تحديث رمز QR' : status === 'disconnected' && !conn ? `ربط عبر ${label}` : 'إعادة الربط'}</span>
          </Button>
        )}
        {connected && <Button variant="outline" onClick={connect} disabled={busy !== ''}><RefreshCw />إعادة الربط</Button>}
        {conn && status !== 'disconnected' && <Button variant="outline" onClick={unlink} disabled={busy !== ''}>{busy === 'disconnect' ? <Loader2 className="animate-spin" /> : <Unplug />}فصل الحساب</Button>}
      </div>
    </section>
  );
}
