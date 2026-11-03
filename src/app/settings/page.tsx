'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Store,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  Check,
  Building2,
  Phone,
  MapPin,
  Coins,
  FileText,
} from 'lucide-react';
import { useDaftarDb } from '@/core/db/useDaftarDb';
import { DaftarLogo } from '@/components/DaftarLogo';

export default function SettingsPage() {
  const {
    isReady,
    storeConfig,
    updateStoreConfig,
    exportBackup,
    importBackup,
    clearAllLedgerData,
  } = useDaftarDb();

  const [tab, setTab] = useState<'profile' | 'backup'>('profile');

  // Form State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [currency, setCurrency] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  // Sync state once DB is ready
  React.useEffect(() => {
    if (isReady && storeConfig && !isInitialized) {
      setStoreName(storeConfig.storeName || '');
      setOwnerName(storeConfig.ownerName || '');
      setPhone(storeConfig.phone || '');
      setLocation(storeConfig.location || '');
      setCurrency(storeConfig.currency || '₪');
      setReceiptFooter(storeConfig.receiptFooter || '');
      setIsInitialized(true);
    }
  }, [isReady, storeConfig, isInitialized]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreConfig({
      storeName,
      ownerName,
      phone,
      location,
      currency,
      receiptFooter,
    });
    triggerToast('تم حفظ بيانات وهوية المحل بنجاح ✓');
  };

  const handleExport = async () => {
    try {
      const dataStr = await exportBackup();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `daftar-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      triggerToast('تم تصدير النسخة الاحتياطية بنجاح 💾');
    } catch {
      triggerToast('فشل تصدير النسخة الاحتياطية');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        await importBackup(text);
        triggerToast('تمت استعادة كافة البيانات والزبائن بنجاح ✅');
      } catch {
        triggerToast('الملف غير صالح أو تالف');
      }
    };
    reader.readAsText(file);
  };

  const handleZeroOutConfirm = async () => {
    if (!isConfirmingReset) {
      setIsConfirmingReset(true);
      setTimeout(() => setIsConfirmingReset(false), 4000);
      return;
    }
    await clearAllLedgerData();
    triggerToast('تم تصفير الدفتر بالكامل، السجل أصبح فارغاً تماماً (0 زبائن) ✓');
    setIsConfirmingReset(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8 flex flex-col items-center">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-xl flex flex-col gap-5">
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <DaftarLogo size={38} showText={true} />
          <Link
            href="/"
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <span>العودة إلى الدفتر</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Page Title & Tabs */}
        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <span>إعدادات المحل والبيانات</span>
          </h1>
          <p className="text-xs text-slate-400">
            تحكم في اسم السوبرماركت، العنوان، رمز العملة، وتصدير واستيراد النسخ الاحتياطية.
          </p>

          {/* Segmented Control */}
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-bold mt-2">
            <button
              onClick={() => setTab('profile')}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                tab === 'profile' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              بيانات وهوية المحل
            </button>
            <button
              onClick={() => setTab('backup')}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                tab === 'backup' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              النسخ الاحتياطي والتصفير
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {tab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1.5 font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  اسم المحل / السوبرماركت
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1.5 font-bold">اسم صاحب المحل / الكاشير</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1.5 font-bold flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    رمز العملة
                  </label>
                  <input
                    type="text"
                    required
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  رقم هاتف المحل للتواصل
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  العنوان والموقع (المدينة والشارع)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  رسالة تذييل الفاتورة الحرارية
                </label>
                <input
                  type="text"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/25 active:scale-95 text-sm"
              >
                حفظ التعديلات
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white block">حفظ نسخة احتياطية من الدفتر:</span>
                <p className="text-[11px] text-slate-400">
                  تحميل ملف كامل يحتوي على كافة زبائنك وعمليات السداد والدين لحفظه على هاتفك أو حاسوبك.
                </p>
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all mt-2"
                >
                  <Download className="w-4 h-4" />
                  تحميل نسخة احتياطية (.json)
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white block">استعادة البيانات من ملف:</span>
                <p className="text-[11px] text-slate-400">
                  استرجاع بيانات الدفتر السابقة من ملف نسخة احتياطية سابق.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all mt-2"
                >
                  <Upload className="w-4 h-4" />
                  اختيار ملف واستعادة الدفتر
                </button>
              </div>

              {/* Zero Out Ledger Section */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <span className="font-bold text-rose-400 block">تصفير الدفتر بالكامل:</span>
                <p className="text-[11px] text-rose-300/80">
                  حذف جميع الزبائن والديون والبدء بسجل فارغ تماماً (0 زبائن).
                </p>
                <button
                  type="button"
                  onClick={handleZeroOutConfirm}
                  className={`w-full font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 mt-2 ${
                    isConfirmingReset
                      ? 'bg-rose-700 text-white animate-pulse'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {isConfirmingReset ? 'اضغط هنا مرة أخرى لتأكيد تصفير الدفتر' : 'تصفير الدفتر الآن (حذف الكل)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
