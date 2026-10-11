import { BookOpen, Laptop, Palette, Shirt } from "lucide-react";
import type { SocialPlatform } from "@/components/social-icon";

export const products = [
  { id: "1", name: "دليل التسويق الرقمي الشامل", type: "منتجات رقمية", price: "29.99", views: "3.2k", sales: 125, icon: BookOpen, rating: 4.8, reviews: 356, tags: ["التسويق الرقمي", "استراتيجيات", "السوق الاحترافية"], desc: "يقدم هذا الدليل الشامل كل ما تحتاجه لبدء رحلتك في عالم التسويق الرقمي، من الأساسيات إلى الاستراتيجيات المتقدمة مع أمثلة عملية وأدوات تساعدك على تحقيق النجاح.", features: ["أكثر من 12 فصلاً متكاملاً", "أمثلة عملية من واقع السوق", "قوالب جاهزة للاستخدام", "دعم وتحديثات مستمرة"], info: [["حجم الملف", "12 MB"], ["نوع الملف", "PDF"], ["اللغة", "العربية"]] },
  { id: "2", name: "تيشيرت MenaFlow", type: "منتجات مادية", price: "19.99", views: "1.8k", sales: 87, icon: Shirt, rating: 4.6, reviews: 120, tags: ["ملابس", "قطن 100%"], desc: "تيشيرت قطني مريح بتصميم MenaFlow الأنيق، مناسب للاستخدام اليومي.", features: ["قطن عالي الجودة", "مقاسات متعددة", "طباعة ثابتة"], info: [["المقاس", "S - XL"], ["الخامة", "قطن"], ["اللون", "أسود"]] },
  { id: "3", name: "قالب موقع إلكتروني احترافي", type: "منتجات رقمية", price: "49.99", views: "2.5k", sales: 142, icon: Laptop, rating: 4.9, reviews: 210, tags: ["مواقع", "تصميم"], desc: "قالب موقع متجاوب وسريع جاهز للتخصيص لأي نشاط تجاري.", features: ["تصميم متجاوب", "سهل التخصيص", "تحديثات مجانية"], info: [["الحجم", "24 MB"], ["النوع", "ZIP"], ["اللغة", "العربية"]] },
  { id: "4", name: "باقة تصميم الهوية البصرية", type: "الخدمات", price: "99.00", views: "1.1k", sales: 64, icon: Palette, rating: 4.7, reviews: 88, tags: ["هوية", "شعار"], desc: "تصميم هوية بصرية متكاملة لعلامتك التجارية تشمل الشعار والألوان والخطوط.", features: ["تصميم الشعار", "دليل الهوية", "3 تعديلات مجانية"], info: [["مدة التنفيذ", "7 أيام"], ["التسليم", "رقمي"], ["اللغة", "العربية"]] },
];

export const posts: { id: string; p: SocialPlatform; text: string; date: string; likes: number; comments: number; views: string; shares: number }[] = [
  { id: "1", p: "instagram", text: "منتجاتنا الجديدة متوفرة الآن بجودة عالية وأسعار مميزة!", date: "2025/05/10", likes: 412, comments: 56, views: "2.8k", shares: 12 },
  { id: "2", p: "facebook", text: "نحن هنا لنساعدك في تحقيق أهدافك التسويقية!", date: "2025/05/08", likes: 298, comments: 34, views: "1.8k", shares: 9 },
  { id: "3", p: "instagram", text: "خصم خاص لفترة محدودة 50% لا تفوت الفرصة!", date: "2025/05/05", likes: 620, comments: 112, views: "112", shares: 30 },
  { id: "4", p: "whatsapp", text: "مرحباً! 👋 هل تحتاج إلى مساعدة؟", date: "2025/05/03", likes: 145, comments: 27, views: "892", shares: 4 },
];

export const postComments = [
  { name: "أحمد محمد", text: "محتوى رائع ومفيد جداً، شكراً لكم.", time: "منذ 5 ساعات" },
  { name: "سارة علي", text: "هل توجد خصم للطلبة؟", time: "منذ 6 ساعات" },
  { name: "محمد عبدالله", text: "ممتاز جداً، استفدت الكثير من هذا المنشور.", time: "منذ 7 ساعات" },
];

export const chats: { id: string; p: SocialPlatform; name: string; msg: string; time: string; unread: number }[] = [
  { id: "1", p: "whatsapp", name: "أحمد محمد", msg: "السلام عليكم، أود الاستفسار عن سعر...", time: "10:24 ص", unread: 2 },
  { id: "2", p: "instagram", name: "سارة علي", msg: "هل ما زال العرض متاح؟", time: "9:50 ص", unread: 1 },
  { id: "3", p: "facebook", name: "محمد عبدالله", msg: "شكراً على الرد السريع", time: "9:12 ص", unread: 3 },
  { id: "4", p: "whatsapp", name: "ليلى فهد", msg: "كم تستغرق عملية التوصيل؟", time: "8:45 ص", unread: 1 },
  { id: "5", p: "instagram", name: "خالد الصيري", msg: "رائع جداً شكراً لكم", time: "8:20 ص", unread: 1 },
  { id: "6", p: "facebook", name: "نور حسن", msg: "هل يمكنني الدفع عند الاستلام؟", time: "7:56 ص", unread: 2 },
];

export const chatMessages = [
  { me: false, text: "السلام عليكم، أريد الاستفسار عن سعر دليل التسويق الرقمي الشامل.", time: "9:12 ص" },
  { me: true, text: "وعليكم السلام، بكل تأكيد. سعر الدليل هو 29.99 دولار", time: "9:13 ص" },
  { me: false, text: "هل يشمل تحديثات مستقبلية؟", time: "9:14 ص" },
  { me: true, text: "نعم، ستحصل على التحديثات مجاناً لمدة سنة كاملة.", time: "9:15 ص" },
  { me: false, text: "رائع، كيف يمكنني الشراء؟", time: "9:16 ص" },
  { me: true, text: "يمكنك الشراء مباشرة من خلال قسم المنتجات أو الرابط المرسل لك.", time: "9:17 ص" },
];

export type OrderStatus = "قيد المعالجة" | "تم الشحن" | "مكتملة" | "ملغاة";
export const orders: { id: string; date: string; total: string; count: number; status: OrderStatus; productId: string }[] = [
  { id: "1024", date: "2025/05/30", total: "59.99", count: 2, status: "قيد المعالجة", productId: "1" },
  { id: "1023", date: "2025/05/15", total: "29.99", count: 1, status: "تم الشحن", productId: "1" },
  { id: "1022", date: "2025/05/07", total: "99.00", count: 3, status: "مكتملة", productId: "4" },
  { id: "1021", date: "2025/05/05", total: "19.99", count: 1, status: "ملغاة", productId: "2" },
];
