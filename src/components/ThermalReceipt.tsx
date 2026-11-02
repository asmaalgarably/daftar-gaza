'use client';

import React from 'react';
import { RealQRCode } from './RealQRCode';
import { Transaction, StoreConfig } from '@/core/db/types';

interface ThermalReceiptProps {
  transaction: Transaction | null;
  storeConfig: StoreConfig;
}

export function ThermalReceipt({ transaction, storeConfig }: ThermalReceiptProps) {
  if (!transaction) return null;

  const dateStr = new Date(transaction.timestamp).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify?tx=${transaction.id}&type=${transaction.type}&amount=${transaction.amount}&customer=${encodeURIComponent(transaction.customerName)}&phone=${transaction.customerPhone}&store=${encodeURIComponent(storeConfig.storeName)}`
    : '';

  return (
    <div id="thermal-receipt" className="hidden print:block text-black bg-white p-4 font-mono text-xs max-w-[80mm] mx-auto text-center leading-relaxed">
      {/* Header */}
      <div className="border-b-2 border-dashed border-black pb-2 mb-2">
        <h1 className="text-base font-black uppercase tracking-wider">{storeConfig.storeName}</h1>
        <p className="text-[10px] text-gray-700">{storeConfig.ownerName} - {storeConfig.location}</p>
        <p className="text-[10px] text-gray-700 font-sans">هاتف: {storeConfig.phone}</p>
      </div>

      {/* Transaction Details */}
      <div className="text-right border-b border-dashed border-gray-400 pb-2 mb-2 space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">رقم السند:</span>
          <span className="font-bold">{transaction.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">التاريخ:</span>
          <span>{dateStr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">الزبون:</span>
          <span className="font-bold">{transaction.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">الجوال:</span>
          <span className="font-sans">{transaction.customerPhone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">البيان:</span>
          <span className="font-sans truncate max-w-[150px]">{transaction.details}</span>
        </div>
      </div>

      {/* Financial Highlight */}
      <div className="py-2.5 my-2 border-y-2 border-black bg-gray-50">
        <div className="text-[11px] font-bold text-gray-700 mb-0.5">
          {transaction.type === 'REPAYMENT' ? 'دفعة مسددة نقداً' : 'دين جديد مسجل'}
        </div>
        <div className="text-2xl font-black">
          {transaction.type === 'REPAYMENT' ? `-${transaction.amount}` : `+${transaction.amount}`} {storeConfig.currency}
        </div>
      </div>

      {/* Balances */}
      <div className="text-right border-b border-dashed border-gray-400 pb-2 mb-2 space-y-1 text-[11px]">
        <div className="flex justify-between text-gray-600">
          <span>الرصيد السابق:</span>
          <span>{transaction.previousBalance} {storeConfig.currency}</span>
        </div>
        <div className="flex justify-between font-black text-sm">
          <span>الرصيد المتبقي:</span>
          <span>{transaction.newBalance} {storeConfig.currency}</span>
        </div>
      </div>

      {/* QR Code Verification */}
      <div className="flex flex-col items-center justify-center my-3">
        <div className="p-1 border border-black rounded inline-block bg-white">
          <RealQRCode value={verifyUrl} size={110} />
        </div>
        <span className="text-[9px] text-gray-500 mt-1">امسح للتحقق الرقمي من السند</span>
        <span className="text-[8px] text-gray-400 font-mono mt-0.5 truncate max-w-[200px]">
          Hash: {transaction.hash.slice(0, 18)}...
        </span>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-dashed border-black text-[9px] text-gray-600">
        <p>{storeConfig.receiptFooter}</p>
        <p className="mt-1 font-bold">منظومة «دَفْتَر» - سجل مالي مشفر</p>
      </div>
    </div>
  );
}
