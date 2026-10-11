import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { VerifiedConnection } from '@/lib/platform-access';

const AccountContext = createContext<{ user: User | null; loading: boolean; connections: VerifiedConnection[]; connectionError: string; refreshConnections: () => Promise<void> }>({ user: null, loading: true, connections: [], connectionError: '', refreshConnections: async () => {} });
export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<VerifiedConnection[]>([]);
  const [connectionError, setConnectionError] = useState('');
  const queryClient = useQueryClient();
  const router = useRouter();
  async function refreshConnections() {
    if (!user) { setConnections([]); return; }
    const { data, error } = await supabase.from('platform_connections').select('platform, verified_at, revoked_at, account_name, provider_account_id').eq('user_id', user.id);
    setConnections(error ? [] : data ?? []);
    setConnectionError(error ? 'تعذر التحقق من الحسابات المرتبطة. حاول مجددًا.' : '');
  }
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setLoading(false); } });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) return;
      setUser(session?.user ?? null); setConnections([]); setLoading(false);
      void router.invalidate();
      if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries();
      else queryClient.clear();
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [router, queryClient]);
  useEffect(() => {
    let active = true;
    if (!user) { setConnections([]); return; }
    setLoading(true);
    supabase.from('platform_connections').select('platform, verified_at, revoked_at, account_name, provider_account_id').eq('user_id', user.id).then(({ data, error }) => {
      if (!active) return;
      setConnections(error ? [] : data ?? []);
      setConnectionError(error ? 'تعذر التحقق من الحسابات المرتبطة.' : ''); setLoading(false);
    });
    return () => { active = false; };
  }, [user]);
  return <AccountContext.Provider value={{ user, loading, connections, connectionError, refreshConnections }}>{children}</AccountContext.Provider>;
}
export const useAccount = () => useContext(AccountContext);