import { createFileRoute } from '@tanstack/react-router';
import { AuthScreen } from '@/components/auth-screen';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/auth')({ head: () => pageHead('تسجيل الدخول', 'سجل الدخول إلى حساب MenaFlow لإدارة محتواك ومنصاتك الاجتماعية.'), component: () => <AuthScreen /> });