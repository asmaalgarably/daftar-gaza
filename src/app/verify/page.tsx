'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Share2, ArrowRight, Store, Calendar, FileText, Lock } from 'lucide-react';
import Link from 'next/link';
import { DaftarLogo } from '@/components/DaftarLogo';

function VerifyReceiptContent() {
  const searchParams = useSearchParams();

  const txId = searchParams.get('tx') || 'TX-89241';
  const type = searchParams.get('type') === 'REPAYMENT' ? 'REPAYMENT' : 'DEBT';
  const amount = searchParams.get('amount') || '50';
  const customer = searchParams.get('customer') || 'أحمد خليل الرنتيسي';
  const phone = searchParams.get('phone') || '0599123456';
  const store = searchParams.get('store') || 'سوبرماركت الأمل - غزة';
  const details = searchParams.get('details') || (type === 'REPAYMENT' ? 'سداد دفعة نقدية باليد' : 'شراء مواد تموينية');
  const date = searchParams.get('date') || 'اليوم، ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  const shareText = `إشعار مالي معتمد من ${store}%0A` +
    `نوع العملية: ${type === 'REPAYMENT' ? 'سداد دفعة' : 'تسجيل دين'}%0A` +
    `المبلغ: ${amount} شيكل%0A` +
    `الزبون: ${customer}%0A` +
    `التاريخ: ${date}%0A` +
    `كود التوثيق: ${txId}%0A` +
    `موثق ومشفر عبر منصة دَفْتَر`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <DaftarLogo size={36} showText={true} />
          <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            معتمد وموثق
          </span>
        </div>

        {/* Success Icon & Status */}
        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-xl font-black text-white">
            {type === 'REPAYMENT' ? 'تم تأكيد سداد الدفعة بنجاح' : 'تم توثيق الدين الجديد بنجاح'}
          </h1>
          <p className="text-xs text-slate-400">
            تم تسجيل هذه المعاملة وتحديث رصيد الدفتر للطرفين فوراً
          </p>
        </div>

        {/* Big Amount Card */}
        <div className={`p-5 rounded-2xl border text-center ${
          type === 'REPAYMENT' 
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' 
            : 'bg-amber-950/30 border-amber-500/30 text-amber-400'
        }`}>
          <span className="text-xs font-semibold block text-slate-400 mb-1">
            {type === 'REPAYMENT' ? 'المبلغ المسدد مخصوم من الرصيد' : 'المبلغ المضاف على الحساب'}
          </span>
          <div className="text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>{type === 'REPAYMENT' ? `-${amount}` : `+${amount}`}</span>
            <span className="text-lg font-bold text-amber-400">₪ شيكل</span>
          </div>
        </div>

        {/* Receipt Line Items */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" /> المحل / التاجر:
            </span>
            <span className="font-bold text-white">{store}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-slate-400">اسم الزبون:</span>
            <span className="font-bold text-white">{customer} ({phone})</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> البيان:
            </span>
            <span className="font-medium text-slate-200">{details}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> الوقت والتاريخ:
            </span>
            <span className="text-slate-300 font-mono">{date}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 font-mono text-[10px]">كود العملية: {txId}</span>
            <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-mono">
              <Lock className="w-3 h-3" /> مشفر بـ Hash
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة الإشعار عبر واتساب</span>
          </a>

          <Link
            href="/"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <span>العودة إلى دفتر المحل</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Footer Guarantee */}
        <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          سند مالي رقمي غير قابل للتعديل أو المسح من طرف واحد
        </p>
      </div>
    </div>
  );
}

export default function VerifyReceiptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">جاري التحقق من الإيصال...</div>}>
      <VerifyReceiptContent />
    </Suspense>
  );
}
