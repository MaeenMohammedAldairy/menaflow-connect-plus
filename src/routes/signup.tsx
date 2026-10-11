import { createFileRoute } from '@tanstack/react-router';
import { AuthScreen } from '@/components/auth-screen';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/signup')({ head: () => pageHead('إنشاء حساب', 'أنشئ حساب MenaFlow وابدأ إدارة حساباتك الاجتماعية.'), component: () => <AuthScreen signup /> });