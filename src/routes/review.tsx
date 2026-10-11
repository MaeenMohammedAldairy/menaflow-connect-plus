import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Check, ChevronLeft, Eye, FileText, ImagePlus, Package, Save, Sparkles, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PageHeader } from '@/components/page-header';
import { AppNav } from '@/components/app-nav';
import { SocialIcon } from '@/components/social-icon';
import { useAccount } from '@/components/account-provider';
import { canManagePlatform, platformLabels, type PlatformName } from '@/lib/platform-access';
import { supabase } from '@/integrations/supabase/client';
import { pageHead } from '@/lib/page-head';
import coffeeAsset from '@/assets/yemeni-coffee.jpg.asset.json';
const coffee = coffeeAsset.url;
export const Route = createFileRoute('/review')({ head: () => pageHead('مراجعة المحتوى المستخرج', 'راجع تفاصيل المحتوى وصوره واختر حسابات النشر المرتبطة قبل الاعتماد.'), component: Review });
type Item = { id: string; title: string; description: string; price: number; category: string; currency: string; platforms: string[]; status: 'draft' | 'approved' };
const sample: Item[] = [
  { id: 'sample-1', title: 'قهوة يمنية أصيلة', description: 'استمتع بطعم القهوة اليمنية الفاخرة من جبال اليمن، جودة عالية ونكهة مميزة.', price: 45, category: 'مشروبات', currency: 'SAR', platforms: [], status: 'draft' },
  { id: 'sample-2', title: 'منتج جديد', description: 'وصول دفعة جديدة من البن الحرازي.', price: 60, category: 'مشروبات', currency: 'SAR', platforms: [], status: 'draft' },
  { id: 'sample-3', title: 'عرض خاص', description: 'خصم خاص على جميع أنواع القهوة.', price: 35, category: 'عروض خاصة', currency: 'SAR', platforms: [], status: 'draft' },
  { id: 'sample-4', title: 'صورة ومحتوى', description: 'جودة القهوة تبدأ من اختيارك الأفضل.', price: 0, category: 'محتوى عام', currency: 'SAR', platforms: [], status: 'draft' },
];
function Review() {
  const { user, connections } = useAccount(); const [items, setItems] = useState<Item[]>(sample); const [selected, setSelected] = useState<string[]>(['sample-1']); const [expanded, setExpanded] = useState('sample-1');
  const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false); const [preview, setPreview] = useState(false); const [photo, setPhoto] = useState(coffee);
  const [hasSavedRows, setHasSavedRows] = useState(false);
  useEffect(() => {
    if (!user) return;
    supabase.from('content_reviews').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).then(({ data, error }) => {
      if (error) { setNotice('تعذر تحميل المسودات المحفوظة.'); return; }
      if (data?.length) { setItems(data.map(d => ({ ...d, status: d.status === 'approved' ? 'approved' : 'draft' }))); setSelected([data[0]?.id ?? '']); setExpanded(data[0]?.id ?? ''); setHasSavedRows(true); }
    });
  }, [user]);
  function change(id: string, patch: Partial<Item>) { setItems(items.map(i => i.id === id ? { ...i, ...patch } : i)); }
  async function save(approve = false) {
    if (!user) { setNotice('سجل الدخول لحفظ محتواك.'); return; }
    if (!selected.length) { setNotice('حدد منشورًا واحدًا على الأقل.'); return; }
    if (approve && !connections.some(c => canManagePlatform(c.platform as PlatformName, connections))) { setNotice('لم يتم ربط أي منصة بعد. يمكنك حفظ مسودة، ولا يمكن الاعتماد للنشر الآن.'); return; }
    const chosen = items.filter(i => selected.includes(i.id));
    if (approve && chosen.some(i => !i.platforms.length || i.platforms.some(p => !canManagePlatform(p as PlatformName, connections)))) { setNotice('اختر منصة مرتبطة لكل منشور قبل الاعتماد.'); return; }
    setBusy(true); setNotice('');
    const rows = chosen.map(i => ({ ...i, id: i.id.startsWith('sample-') ? crypto.randomUUID() : i.id, user_id: user.id, status: approve ? ('approved' as const) : ('draft' as const), updated_at: new Date().toISOString() }));
    const { data, error } = await supabase.from('content_reviews').upsert(rows).select();
    if (error) setNotice('تعذر حفظ المحتوى. حاول مجددًا.');
    else if (data) {
      const mapping = new Map(chosen.map((i, idx) => [i.id, data[idx]]));
      setItems(items.map(i => { const row = mapping.get(i.id); return row ? { ...i, id: row.id, status: row.status === 'approved' ? 'approved' : 'draft' } : i; }));
      setSelected(data.map(d => d.id)); setExpanded(data[0]?.id ?? ''); setHasSavedRows(true);
      setNotice(approve ? 'تم اعتماد المحتوى. النشر المباشر ينتظر تفعيل خدمة النشر.' : 'تم حفظ المسودات في حسابك.');
    } setBusy(false);
  }
  const activeItem = items.find(i => i.id === expanded) ?? items[0];
  return <main className="dashboard-shell review-shell"><PageHeader /><section className="review-title"><span className="eyebrow">المحتوى / المراجعة</span><h1>مراجعة المحتوى المستخرج <Sparkles /></h1><p>{hasSavedRows ? 'مسوداتك المحفوظة، جاهزة للمراجعة.' : 'معاينة تجريبية للمحتوى — لا توجد منشورات مستخرجة من حساباتك بعد.'}</p></section><ol className="review-steps">{['استخراج المحتوى', 'تحليل وتصنيف', 'المراجعة', 'النشر'].map((s, i) => <li key={s} className={i === 2 ? 'current' : ''}><span>{i === 2 ? <Check /> : i + 1}</span>{s}</li>)}</ol>
    <div className="review-layout"><section className="review-main"><div className="review-list-heading"><h2><Sparkles />{items.length} منشورات للمراجعة</h2><label className="flex items-center gap-2 text-sm"><Checkbox checked={selected.length === items.length} onCheckedChange={v => setSelected(v ? items.map(i => i.id) : [])} />تحديد الكل</label></div>
      {items.map((item, index) => <article key={item.id} className={expanded === item.id ? 'review-item expanded' : 'review-item'}><div className="review-item-heading"><label className="flex items-center gap-3"><Checkbox checked={selected.includes(item.id)} onCheckedChange={v => setSelected(v ? [...selected, item.id] : selected.filter(id => id !== item.id))} /><span className="step-number">{index + 1}</span></label><Button variant="ghost" className="review-expand" onClick={() => setExpanded(expanded === item.id ? '' : item.id)}><span><strong>{item.title}</strong><small>{item.status === 'approved' ? 'معتمد' : 'مسودة للمراجعة'}</small></span><ChevronLeft /></Button>{expanded !== item.id && <img src={photo} alt="قهوة يمنية" width={80} height={80} />}</div>
        {expanded === item.id && <><div className="review-editor"><div className="form-stack"><label className="field-label">اسم المنتج<input className="plain-input" value={item.title} onChange={e => change(item.id, { title: e.target.value })} /></label><label className="field-label">الوصف<textarea className="plain-input" rows={4} value={item.description} onChange={e => change(item.id, { description: e.target.value })} /></label><div className="form-pair"><label className="field-label">السعر<input className="plain-input" type="number" min="0" value={item.price} onChange={e => change(item.id, { price: Number(e.target.value) })} /></label><label className="field-label">العملة<select className="plain-input" value={item.currency} onChange={e => change(item.id, { currency: e.target.value })}><option value="SAR">ريال سعودي</option><option value="YER">ريال يمني</option><option value="USD">دولار أمريكي</option></select></label></div><label className="field-label">التصنيف<select className="plain-input" value={item.category} onChange={e => change(item.id, { category: e.target.value })}>{['مشروبات', 'منتجات', 'عروض خاصة', 'محتوى عام'].map(c => <option key={c}>{c}</option>)}</select></label></div><div className="review-media"><img className="review-product-image" src={photo} alt="صورة قهوة يمنية أصيلة" width={1024} height={1024} /><label className="image-upload"><ImagePlus />تعديل الصور<input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === 'string') { setPhoto(reader.result); setNotice('تم تحديث المعاينة. حفظ الصور الدائم ينتظر تفعيل تخزين المرفقات.'); } }; reader.readAsDataURL(file); }} /></label><div className="review-thumbnails">{[0,1,2].map(n => <img key={n} src={photo} alt="معاينة صورة المنتج" width={70} height={70} />)}</div></div></div><div className="review-platforms"><h3>المنصات المستهدفة</h3><div>{(Object.keys(platformLabels) as PlatformName[]).map(p => <label key={p}><SocialIcon platform={p} /><span>{platformLabels[p]}</span><Switch checked={item.platforms.includes(p)} disabled={!canManagePlatform(p, connections)} onCheckedChange={v => change(item.id, { platforms: v ? [...item.platforms, p] : item.platforms.filter(x => x !== p) })} aria-label={`النشر على ${platformLabels[p]}`} /></label>)}</div></div></>}
      </article>)}
    </section><aside className="review-summary"><h2><SocialIcon platform="whatsapp" />ملخص المراجعة</h2><div className="review-count"><strong>{items.length}</strong><span>منشورات للمراجعة</span></div><dl className="summary-details"><div><dt><Package />منتجات</dt><dd>{items.filter(i => i.category === 'مشروبات' || i.category === 'منتجات').length}</dd></div><div><dt><Tag />عروض خاصة</dt><dd>{items.filter(i => i.category === 'عروض خاصة').length}</dd></div><div><dt><FileText />محتوى عام</dt><dd>{items.filter(i => i.category === 'محتوى عام').length}</dd></div></dl><h3>المصدر</h3><p className="notice">{canManagePlatform('whatsapp', connections) ? 'واتساب مرتبط' : 'واتساب غير مرتبط'}</p><Button asChild variant="outline" className="w-full"><Link to="/connect/whatsapp">ربط مصدر واتساب <ChevronLeft /></Link></Button><h3>حسابات التواصل المرتبطة</h3>{(Object.keys(platformLabels) as PlatformName[]).map(p => <div className="summary-account" key={p}><SocialIcon platform={p} /><span>{platformLabels[p]}</span><small>{canManagePlatform(p, connections) ? 'متصل' : 'غير مرتبط'}</small></div>)}<p className="notice">لا يتم اعتماد أو نشر محتوى على حساب غير مرتبط.</p></aside></div>
    {notice && <p className="notice" role="status">{notice}</p>}<footer className="review-actions"><Button variant="dashboard" className="primary-action" disabled={busy} onClick={() => save(true)}><Check />اعتماد المحتوى ونشره تلقائيًا</Button><Button variant="outline" disabled={busy} onClick={() => save()}><Save />حفظ مسودة</Button><Button variant="outline" onClick={() => setPreview(true)}><Eye />معاينة المنشورات</Button>{!user && <Button asChild variant="link"><Link to="/auth">تسجيل الدخول للحفظ</Link></Button>}</footer><AppNav active="المحتوى" /><Dialog open={preview} onOpenChange={setPreview}><DialogContent aria-describedby={undefined}><DialogTitle>معاينة المنشور</DialogTitle>{activeItem && <div className="post-preview"><img src={photo} alt="صورة المنشور" width={1024} height={1024} /><h2>{activeItem.title}</h2><p>{activeItem.description}</p>{activeItem.price > 0 && <strong>{activeItem.price} {activeItem.currency}</strong>}</div>}</DialogContent></Dialog></main>;
}