'use client';

import React, { useState } from 'react';
import {
  X,
  Store,
  Download,
  Upload,
  Trash2,
  Check,
} from 'lucide-react';
import { StoreConfig } from '@/core/db/types';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  onSaveConfig: (updated: Partial<StoreConfig>) => Promise<any>;
  onExportBackup: () => Promise<string>;
  onImportBackup: (jsonString: string) => Promise<boolean>;
  onClearAllData: () => Promise<void>;
  triggerToast: (msg: string) => void;
}

export function StoreSettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onExportBackup,
  onImportBackup,
  onClearAllData,
  triggerToast,
}: StoreSettingsModalProps) {
  const [tab, setTab] = useState<'profile' | 'backup'>('profile');

  // Form State
  const [storeName, setStoreName] = useState(config.storeName);
  const [ownerName, setOwnerName] = useState(config.ownerName);
  const [phone, setPhone] = useState(config.phone);
  const [location, setLocation] = useState(config.location);
  const [currency, setCurrency] = useState(config.currency);
  const [receiptFooter, setReceiptFooter] = useState(config.receiptFooter);

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
    triggerToast('تم حفظ بيانات المحل بنجاح ✓');
    onClose();
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
        await onImportBackup(text);
        triggerToast('تمت استعادة كافة البيانات والزبائن بنجاح ✅');
        onClose();
      } catch {
        triggerToast('الملف غير صالح أو تالف');
      }
    };
    reader.readAsText(file);
  };

  const handleZeroOutConfirm = async () => {
    if (window.confirm('هل أنت متأكد من تصفير الدفتر ومسح كافة الزبائن والديون نهائياً للبدء من الصفر؟')) {
      await onClearAllData();
      triggerToast('تم تصفير الدفتر بالكامل، السجل أصبح فارغاً تماماً (0 زبائن) ✓');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h2 className="font-black text-sm">إعدادات المحل والبيانات</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Control */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setTab('profile')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'profile' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            بيانات وهوية المحل
          </button>
          <button
            onClick={() => setTab('backup')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'backup' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            النسخ الاحتياطي والتصفير
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">اسم صاحب المحل</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-bold">رمز العملة</label>
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
              <label className="text-slate-400 block mb-1 font-bold">رقم هاتف المحل</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">العنوان والموقع</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">رسالة تذييل الفاتورة</label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/25 active:scale-95"
            >
              حفظ التعديلات
            </button>
          </form>
        )}

        {/* Tab 2: Backup & Reset */}
        {tab === 'backup' && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white block">حفظ نسخة احتياطية:</span>
              <p className="text-[11px] text-slate-400">
                تحميل ملف يحتوي على كافة زبائنك وعمليات السداد والدين لحفظه على هاتفك أو حاسوبك.
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

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white block">استعادة البيانات من ملف:</span>
              <p className="text-[11px] text-slate-400">
                استرجاع بيانات الدفتر السابقة من ملف نسخة احتياطية.
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
                اختيار ملف واستعادة الدفتر
              </button>
            </div>

            {/* Zero Out Ledger Section */}
            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <span className="font-bold text-rose-400 block">تصفير الدفتر بالكامل:</span>
              <p className="text-[11px] text-rose-300/80">
                حذف جميع الزبائن والديون والبدء بسجل فارغ تماماً (0 زبائن).
              </p>
              <button
                type="button"
                onClick={handleZeroOutConfirm}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-600/20 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                تصفير الدفتر الآن (حذف الكل)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
