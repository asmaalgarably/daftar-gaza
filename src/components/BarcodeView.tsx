'use client';

import React from 'react';
import { RealQRCode } from './RealQRCode';
import { Share2, Printer, Copy, Check, QrCode, Barcode as BarcodeIcon } from 'lucide-react';

interface BarcodeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  codeId: string;
  amount?: number;
  currency?: string;
  customerName: string;
  customerPhone: string;
  verifyUrl: string;
  whatsappMessage: string;
  onPrint?: () => void;
}

export function BarcodeViewModal({
  isOpen,
  onClose,
  title,
  subtitle,
  codeId,
  amount,
  currency = '₪',
  customerName,
  customerPhone,
  verifyUrl,
  whatsappMessage,
  onPrint,
}: BarcodeViewModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // WhatsApp link format for Palestinian numbers (970 or 972)
  let intlPhone = customerPhone.replace(/\D/g, '');
  if (intlPhone.startsWith('0')) {
    intlPhone = '970' + intlPhone.slice(1);
  }
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 flex flex-col items-center text-center gap-4 shadow-2xl text-white animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-sm text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {subtitle && (
          <p className="text-xs text-slate-400 -mt-1">{subtitle}</p>
        )}

        {/* 2D QR Code Container */}
        <div className="border-2 border-emerald-500/40 rounded-2xl p-2.5 bg-white shadow-xl flex items-center justify-center">
          <RealQRCode value={verifyUrl} size={180} />
        </div>

        {/* 1D Retail Barcode Representation (Code-128 Style) */}
        <div className="w-full bg-white rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 shadow-md">
          <svg
            viewBox="0 0 200 45"
            className="w-full h-10 overflow-hidden"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Barcode bars simulation */}
            <rect x="10" y="2" width="3" height="32" fill="#000" />
            <rect x="15" y="2" width="1" height="32" fill="#000" />
            <rect x="18" y="2" width="4" height="32" fill="#000" />
            <rect x="24" y="2" width="2" height="32" fill="#000" />
            <rect x="28" y="2" width="5" height="32" fill="#000" />
            <rect x="35" y="2" width="2" height="32" fill="#000" />
            <rect x="39" y="2" width="1" height="32" fill="#000" />
            <rect x="42" y="2" width="3" height="32" fill="#000" />
            <rect x="47" y="2" width="4" height="32" fill="#000" />
            <rect x="53" y="2" width="2" height="32" fill="#000" />
            <rect x="57" y="2" width="1" height="32" fill="#000" />
            <rect x="60" y="2" width="5" height="32" fill="#000" />
            <rect x="67" y="2" width="2" height="32" fill="#000" />
            <rect x="71" y="2" width="3" height="32" fill="#000" />
            <rect x="76" y="2" width="1" height="32" fill="#000" />
            <rect x="79" y="2" width="4" height="32" fill="#000" />
            <rect x="85" y="2" width="2" height="32" fill="#000" />
            <rect x="89" y="2" width="3" height="32" fill="#000" />
            <rect x="94" y="2" width="1" height="32" fill="#000" />
            <rect x="97" y="2" width="5" height="32" fill="#000" />
            <rect x="104" y="2" width="2" height="32" fill="#000" />
            <rect x="108" y="2" width="4" height="32" fill="#000" />
            <rect x="114" y="2" width="1" height="32" fill="#000" />
            <rect x="117" y="2" width="3" height="32" fill="#000" />
            <rect x="122" y="2" width="2" height="32" fill="#000" />
            <rect x="126" y="2" width="4" height="32" fill="#000" />
            <rect x="132" y="2" width="1" height="32" fill="#000" />
            <rect x="135" y="2" width="3" height="32" fill="#000" />
            <rect x="140" y="2" width="5" height="32" fill="#000" />
            <rect x="147" y="2" width="2" height="32" fill="#000" />
            <rect x="151" y="2" width="1" height="32" fill="#000" />
            <rect x="154" y="2" width="4" height="32" fill="#000" />
            <rect x="160" y="2" width="2" height="32" fill="#000" />
            <rect x="164" y="2" width="3" height="32" fill="#000" />
            <rect x="169" y="2" width="1" height="32" fill="#000" />
            <rect x="172" y="2" width="5" height="32" fill="#000" />
            <rect x="179" y="2" width="2" height="32" fill="#000" />
            <rect x="183" y="2" width="3" height="32" fill="#000" />
            <rect x="188" y="2" width="1" height="32" fill="#000" />
          </svg>
          <span className="font-mono text-[10px] text-gray-800 tracking-widest font-black">
            {codeId}
          </span>
        </div>

        {/* Customer & Amount Details Card */}
        <div className="w-full bg-slate-950 rounded-2xl p-3 text-xs space-y-1.5 text-right border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">الزبون:</span>
            <span className="font-bold text-white">{customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">رقم الجوال:</span>
            <span className="font-mono text-slate-300">{customerPhone}</span>
          </div>
          {amount !== undefined && (
            <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">المبلغ:</span>
              <span className="text-sm font-black text-amber-400 font-mono">
                {amount} {currency}
              </span>
            </div>
          )}
        </div>

        {/* WhatsApp & Print Actions */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Direct WhatsApp Share */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>إرسال واتساب</span>
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>
        </div>

        {onPrint && (
          <button
            onClick={onPrint}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700/60"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة الإيصال والباركود</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
