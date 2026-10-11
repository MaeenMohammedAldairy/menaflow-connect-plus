import { Link } from '@tanstack/react-router';
import { ArrowRight, Bell, CircleUserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenaFlowMark } from '@/components/menaflow-brand';
import { useAccount } from '@/components/account-provider';

export function PageHeader() {
  const { user } = useAccount();
  return <header className="page-header">
    <div className="header-identity"><Button variant="dashboardIcon" size="icon" asChild><Link to="/" aria-label="العودة إلى الرئيسية"><ArrowRight /></Link></Button><Link to="/" className="brand-wordmark" dir="ltr"><MenaFlowMark /><span>MenaFlow</span></Link></div>
    <div className="header-account"><Button variant="dashboardIcon" size="icon" asChild><Link to="/settings" aria-label="إعدادات الإشعارات"><Bell /></Link></Button><Button variant="ghost" asChild><Link to={user ? '/settings' : '/auth'}><CircleUserRound /><span>{user?.user_metadata?.['display_name'] || (user ? 'حسابي' : 'تسجيل الدخول')}</span></Link></Button></div>
  </header>;
}