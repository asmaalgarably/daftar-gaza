'use client';

import React, { useState } from 'react';
import {
  X,
  Store,
  Lock,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { StoreConfig } from '@/core/db/types';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  onSaveConfig: (updated: Partial<StoreConfig>) => Promise<any>;
  onExportBackup: () => Promise<string>;
  onImportBackup: (jsonString: string) => Promise<boolean>;
  onResetFactory: () => Promise<void>;
  triggerToast: (msg: string) => void;
}

export function StoreSettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onExportBackup,
  onImportBackup,
  onResetFactory,
  triggerToast,
}: StoreSettingsModalProps) {
  const [tab, setTab] = useState<'profile' | 'security' | 'backup'>('profile');

  // Form State
  const [storeName, setStoreName] = useState(config.storeName);
  const [ownerName, setOwnerName] = useState(config.ownerName);
  const [phone, setPhone] = useState(config.phone);
  const [location, setLocation] = useState(config.location);
  const [currency, setCurrency] = useState(config.currency);
  const [receiptFooter, setReceiptFooter] = useState(config.receiptFooter);

  // PIN Security
  const [pinCode, setPinCode] = useState(config.pinCode || '0000');
  const [isPinLocked, setIsPinLocked] = useState(config.isPinLocked || false);

  // Backup file input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveConfig({
      storeName,
      ownerName,
      phone,
      location,
      currency,
      receiptFooter,
    });
    triggerToast('تم حفظ إعدادات المحل بنجاح');
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length < 4) {
      triggerToast('يجب أن يتكون رمز الـ PIN من 4 أرقام على الأقل');
      return;
    }
    await onSaveConfig({
      pinCode,
      isPinLocked,
    });
    triggerToast('تم تحديث إعدادات الأمان وقفل الدفتر');
  };

  const handleExport = async () => {
    try {
      const dataStr = await onExportBackup();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `daftar-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      triggerToast('تم تصدير وحفظ النسخة الاحتياطية بنجاح 💾');
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
        await onImportBackup(text);
        triggerToast('تمت استعادة كافة البيانات والزبائن بنجاح ✅');
        onClose();
      } catch {
        triggerToast('الملف غير صالح أو تالف');
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryResetConfirm = async () => {
    const confirmText = prompt('لتأكيد تصفير الدفتر بالكامل، اكتب كلمة "تصفير":');
    if (confirmText === 'تصفير') {
      await onResetFactory();
      triggerToast('تم تصفير الدفتر وإعادته للحالة الافتراضية');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h2 className="font-black text-sm">إعدادات المحل والنسخ الاحتياطي</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setTab('profile')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'profile' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            بيانات المحل
          </button>
          <button
            onClick={() => setTab('security')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'security' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            أمان الـ PIN
          </button>
          <button
            onClick={() => setTab('backup')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'backup' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            النسخ الاحتياطي
          </button>
        </div>

        {/* Tab 1: Profile */}
        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">اسم المحل / المتجر</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">صاحب المحل</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-bold">رمز العملة</label>
                <input
                  type="text"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">رقم جوال المحل</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">العنوان والموقع</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">عبارة تذييل الفاتورة</label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
            >
              حفظ بيانات المحل
            </button>
          </form>
        )}

        {/* Tab 2: Security & PIN */}
        {tab === 'security' && (
          <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold block text-white">تفعيل قفل الـ PIN</span>
                  <span className="text-[10px] text-slate-400">طلب الرمز السري عند مسح الديون أو تعديل الإعدادات</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPinLocked}
                onChange={(e) => setIsPinLocked(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">الرمز السري (PIN Code)</label>
              <input
                type="password"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono tracking-widest text-center text-base"
              />
              <span className="text-[10px] text-slate-500 block mt-1 text-center">الرمز الافتراضي هو 0000</span>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
            >
              حفظ إعدادات الأمان
            </button>
          </form>
        )}

        {/* Tab 3: Backup & Restore */}
        {tab === 'backup' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white block">حفظ نسخة احتياطية محلية:</span>
              <p className="text-[11px] text-slate-400">
                يقوم بتحميل ملف يحتوي على كافة زبائنك وعمليات السداد والدين لحفظه على الفلاشة أو الهاتف.
              </p>
              <button
                type="button"
                onClick={handleExport}
                className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" />
                تحميل نسخة احتياطية (.json)
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white block">استعادة البيانات من ملف:</span>
              <p className="text-[11px] text-slate-400">
                استرجاع بيانات المحل والديون من ملف نسخة احتياطية سابق تم حفظه.
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
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Upload className="w-4 h-4" />
                اختيار ملف النسخة الاحتياطية
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleFactoryResetConfirm}
                className="w-full bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-500/30 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                تصفير الدفتر وإعادة ضبط المصنع
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
