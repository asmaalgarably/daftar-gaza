'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Users,
  CreditCard,
  PlusCircle,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  Share2,
  Phone,
  FileText,
  Settings,
  X,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Wallet,
  TrendingUp,
  AlertCircle,
  Printer,
  Sun,
  Moon,
  Calculator,
  UserPlus,
  BookOpen,
  Trash2,
  Camera,
  ShieldCheck,
  Download,
  Upload,
  Lock,
  MessageCircle,
} from 'lucide-react';
import { DaftarLogo } from '@/components/DaftarLogo';
import { RealQRCode } from '@/components/RealQRCode';
import { validatePalestinianPhone } from '@/core/validators/phone';
import { useDaftarDb } from '@/core/db/useDaftarDb';
import { ThermalReceipt } from '@/components/ThermalReceipt';
import { CameraQRScanner } from '@/components/CameraQRScanner';
import { StoreSettingsModal } from '@/components/StoreSettingsModal';
import { BarcodeViewModal } from '@/components/BarcodeView';
import { Transaction } from '@/core/db/types';

export default function LuxuryStoreLedgerApp() {
  const [themeMode, setThemeMode] = useState<'LUXURY' | 'DAY'>('LUXURY');

  // Connect to Offline-First Persistent IndexedDB
  const {
    isReady,
    storeConfig,
    customers,
    transactions,
    recordTransaction,
    createCustomer,
    deleteCustomer,
    updateStoreConfig,
    exportBackup,
    importBackup,
    resetFactory,
  } = useDaftarDb();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'ALL' | 'DEBTORS' | 'CLEARED' | 'OVERDUE'>('ALL');

  // Modals & Features
  const [showStoreSettingsModal, setShowStoreSettingsModal] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showCustomerBarcodeModal, setShowCustomerBarcodeModal] = useState(false);
  const [viewingTxBarcode, setViewingTxBarcode] = useState<Transaction | null>(null);

  // Selected Transaction for Thermal Printing
  const [activePrintTx, setActivePrintTx] = useState<Transaction | null>(null);

  // Keypad & POS Action Mode
  const [posMode, setPosMode] = useState<'REPAYMENT' | 'DEBT' | null>(null);
  const [posAmount, setPosAmount] = useState('0');
  const [posDetails, setPosDetails] = useState('');

  // Add Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustInitialDebt, setNewCustInitialDebt] = useState('50');
  const [newCustDebtReason, setNewCustDebtReason] = useState('رصيد دين سابق / مشتريات');
  const [newCustCeiling, setNewCustCeiling] = useState('500');

  // QR Modal State
  const [qrModalData, setQrModalData] = useState<{
    url: string;
    type: 'DEBT' | 'REPAYMENT';
    amount: number;
    customerName: string;
    customerPhone: string;
    details: string;
    receiptId: string;
    previousBalance: number;
    newBalance: number;
  } | null>(null);
  const [qrDoneSuccess, setQrDoneSuccess] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Determine Selected Customer
  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || (customers.length > 0 ? customers[0] : null);

  // Active Customer Transactions
  const customerTransactions = transactions.filter((t) => t.customerId === selectedCustomer?.id);

  // Set default selection when customers change
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // Store Analytics
  const totalOutstandingBalance = customers.reduce((sum, c) => sum + c.balance, 0);
  const activeDebtorsCount = customers.filter((c) => c.balance > 0).length;
  const overdueCount = customers.filter((c) => c.balance > c.debtCeiling).length;

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name.includes(searchTerm) || c.phone.includes(searchTerm);
    if (!matchesSearch) return false;
    if (customerFilter === 'DEBTORS') return c.balance > 0;
    if (customerFilter === 'CLEARED') return c.balance === 0;
    if (customerFilter === 'OVERDUE') return c.balance > c.debtCeiling;
    return true;
  });

  // Numeric Numpad Handler
  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setPosAmount('0');
      return;
    }
    if (val === 'BACK') {
      setPosAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    setPosAmount((prev) => (prev === '0' ? val : prev + val));
  };

  // WhatsApp Helper Functions
  const getWhatsAppUrl = (phone: string, text: string) => {
    let intlPhone = phone.replace(/\D/g, '');
    if (intlPhone.startsWith('0')) {
      intlPhone = '970' + intlPhone.slice(1);
    }
    return `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(text)}`;
  };

  const getCustomerStatementWhatsAppUrl = () => {
    if (!selectedCustomer) return '#';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const verifyUrl = `${origin}/verify?tx=STATEMENT-${selectedCustomer.id}&type=DEBT&amount=${selectedCustomer.balance}&customer=${encodeURIComponent(
      selectedCustomer.name
    )}&phone=${selectedCustomer.phone}&store=${encodeURIComponent(storeConfig.storeName)}&details=${encodeURIComponent(
      'كشف حساب إجمالي الرصيد المستحق'
    )}`;

    const text =
      `السلام عليكم أخي/أختي ${selectedCustomer.name}\n` +
      `إشعار كشف حساب معتمد من ${storeConfig.storeName}:\n` +
      `• الرصيد المستحق بذمتكم: ${selectedCustomer.balance} ${storeConfig.currency}\n` +
      `• سقف الدين المعتمد: ${selectedCustomer.debtCeiling} ${storeConfig.currency}\n` +
      `• عدد الحركات المسجلة: ${customerTransactions.length}\n` +
      `رابط التحقق المشفر والباركود:\n${verifyUrl}\n` +
      `شكراً لتعاملكم الراقي معنا!`;

    return getWhatsAppUrl(selectedCustomer.phone, text);
  };

  const getTxWhatsAppUrl = (tx: Transaction) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const verifyUrl = `${origin}/verify?tx=${tx.id}&type=${tx.type}&amount=${tx.amount}&customer=${encodeURIComponent(
      tx.customerName
    )}&phone=${tx.customerPhone}&store=${encodeURIComponent(storeConfig.storeName)}&details=${encodeURIComponent(
      tx.details
    )}`;

    const text =
      `سند مالي معتمد من ${storeConfig.storeName}\n` +
      `الزبون: ${tx.customerName}\n` +
      `نوع العملية: ${tx.type === 'REPAYMENT' ? 'سداد دفعة نقدية كاش' : 'تسجيل دين بضاعة'}\n` +
      `المبلغ: ${tx.amount} ${storeConfig.currency}\n` +
      `الرصيد المتبقي بعدها: ${tx.newBalance} ${storeConfig.currency}\n` +
      `البيان: ${tx.details}\n` +
      `رقم السند: ${tx.id}\n` +
      `رابط السند والباركود:\n${verifyUrl}`;

    return getWhatsAppUrl(tx.customerPhone, text);
  };

  // Execute POS Transaction
  const handleExecutePosTransaction = async () => {
    const amountNum = parseFloat(posAmount);
    if (isNaN(amountNum) || amountNum <= 0 || !selectedCustomer || !posMode) return;

    // Strict Repayment constraint
    if (posMode === 'REPAYMENT') {
      if (selectedCustomer.balance <= 0) {
        triggerToast('حساب الزبون خالص بالفعل ولا توجد ديون مستحقة');
        return;
      }
      if (amountNum > selectedCustomer.balance) {
        triggerToast(`مبلغ السداد (${amountNum} ₪) أكبر من الدين المستحق (${selectedCustomer.balance} ₪)!`);
        return;
      }
    }

    const txDetails = posDetails || (posMode === 'REPAYMENT' ? 'سداد دفعة نقدية كاش' : 'شراء بضاعة على الحساب');

    try {
      const recordedTx = await recordTransaction({
        customerId: selectedCustomer.id,
        amount: amountNum,
        type: posMode,
        details: txDetails,
      });

      setActivePrintTx(recordedTx);

      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const verifyUrl = `${origin}/verify?tx=${recordedTx.id}&type=${posMode}&amount=${amountNum}&customer=${encodeURIComponent(
        selectedCustomer.name
      )}&phone=${selectedCustomer.phone}&store=${encodeURIComponent(storeConfig.storeName)}&details=${encodeURIComponent(
        txDetails
      )}`;

      const currentMode = posMode;
      setPosMode(null);
      setPosAmount('0');
      setPosDetails('');
      setQrDoneSuccess(false);

      setQrModalData({
        url: verifyUrl,
        type: currentMode,
        amount: amountNum,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        details: txDetails,
        receiptId: recordedTx.id,
        previousBalance: recordedTx.previousBalance,
        newBalance: recordedTx.newBalance,
      });

      triggerToast(
        currentMode === 'REPAYMENT'
          ? `تم حفظ سداد ${amountNum} ${storeConfig.currency} لحساب ${selectedCustomer.name}`
          : `تم قيد دين بقيمة ${amountNum} ${storeConfig.currency} على ${selectedCustomer.name}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تنفيذ العملية';
      triggerToast(`خطأ: ${msg}`);
    }
  };

  // Create new customer with INITIAL DEBT & STRICT PALESTINIAN PHONE VALIDATION
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCustName.trim();
    if (!trimmedName || !newCustPhone) {
      triggerToast('يرجى كتابة اسم الزبون ورقم الجوال');
      return;
    }

    // Strict Palestinian phone validation
    const phoneCheck = validatePalestinianPhone(newCustPhone);
    if (!phoneCheck.isValid || !phoneCheck.normalized) {
      triggerToast(phoneCheck.error || 'رقم جوال غير صالح، يجب أن يبدأ بـ 059 أو 056 ويتكون من 10 أرقام');
      return;
    }

    const validatedPhone = phoneCheck.normalized;

    // Check duplicate phone
    const existing = customers.find((c) => c.phone === validatedPhone);
    if (existing) {
      triggerToast(`رقم الجوال مسجل مسبقاً باسم الزبون: ${existing.name}`);
      return;
    }

    const initialDebtNum = parseFloat(newCustInitialDebt) || 0;
    const initialReason = newCustDebtReason || 'رصيد دين افتتاحي';

    try {
      const newCust = await createCustomer({
        name: trimmedName,
        phone: validatedPhone,
        balance: 0,
        debtCeiling: parseFloat(newCustCeiling) || 500,
        notes: 'زبون مسجل حديثاً',
      });

      // If there was an initial debt, record it in the ledger
      if (initialDebtNum > 0) {
        await recordTransaction({
          customerId: newCust.id,
          amount: initialDebtNum,
          type: 'DEBT',
          details: initialReason,
        });
      }

      setSelectedCustomerId(newCust.id);
      setShowNewCustomerModal(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustInitialDebt('50');
      setNewCustDebtReason('رصيد دين سابق / مشتريات');

      triggerToast(
        initialDebtNum > 0
          ? `تمت إضافة ${trimmedName} برصيد دين ${initialDebtNum} ${storeConfig.currency}`
          : `تمت إضافة الزبون ${trimmedName} إلى الدفتر بنجاح`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل إضافة الزبون';
      triggerToast(`خطأ: ${msg}`);
    }
  };

  // Delete individual customer
  const handleDeleteCustomer = async (customerId: string, customerName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (
      typeof window !== 'undefined' &&
      window.confirm(`هل أنت متأكد من حذف حساب الزبون (${customerName}) نهائياً من دفتر الديون؟`)
    ) {
      await deleteCustomer(customerId);
      if (selectedCustomerId === customerId) {
        const remaining = customers.filter((c) => c.id !== customerId);
        setSelectedCustomerId(remaining.length > 0 ? remaining[0].id : null);
      }
      triggerToast(`تم حذف حساب الزبون (${customerName}) نهائياً`);
    }
  };

  const isDark = themeMode === 'LUXURY';

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <DaftarLogo size={48} showText={true} />
        <p className="text-xs text-slate-400 mt-4 animate-pulse">جاري تحميل دفتر المحل وقاعدة البيانات المحلية...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark ? 'bg-theme-luxury text-slate-100' : 'bg-theme-day text-slate-800'
      }`}
    >
      {/* Thermal Receipt Hidden Component (Revealed during window.print()) */}
      <ThermalReceipt transaction={activePrintTx} storeConfig={storeConfig} />

      {/* Camera QR Scanner Modal */}
      <CameraQRScanner
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onScanSuccess={(decodedText) => {
          setShowCameraScanner(false);
          triggerToast('تم فحص السند بنجاح! جاري فتح كشف التوثيق...');
          if (decodedText.startsWith('http')) {
            window.open(decodedText, '_blank');
          } else {
            alert(`بيانات السند الممسوح: ${decodedText}`);
          }
        }}
      />

      {/* Store Settings & Backup Modal */}
      <StoreSettingsModal
        isOpen={showStoreSettingsModal}
        onClose={() => setShowStoreSettingsModal(false)}
        config={storeConfig}
        onSaveConfig={updateStoreConfig}
        onExportBackup={exportBackup}
        onImportBackup={importBackup}
        onResetFactory={resetFactory}
        triggerToast={triggerToast}
      />

      {/* Dedicated Customer Statement Barcode & QR Code Modal */}
      {showCustomerBarcodeModal && selectedCustomer && (
        <BarcodeViewModal
          isOpen={showCustomerBarcodeModal}
          onClose={() => setShowCustomerBarcodeModal(false)}
          title={`باركود وكود كشف حساب: ${selectedCustomer.name}`}
          subtitle={`إجمالي الرصيد المستحق بذمته: ${selectedCustomer.balance} ${storeConfig.currency}`}
          codeId={`CUST-${selectedCustomer.phone}`}
          amount={selectedCustomer.balance}
          currency={storeConfig.currency}
          customerName={selectedCustomer.name}
          customerPhone={selectedCustomer.phone}
          verifyUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify?tx=STATEMENT-${selectedCustomer.id}&type=DEBT&amount=${selectedCustomer.balance}&customer=${encodeURIComponent(selectedCustomer.name)}&phone=${selectedCustomer.phone}&store=${encodeURIComponent(storeConfig.storeName)}`}
          whatsappMessage={`إشعار كشف حساب من ${storeConfig.storeName}\nالزبون: ${selectedCustomer.name}\nالرصيد المستحق: ${selectedCustomer.balance} ${storeConfig.currency}\nسقف الدين: ${selectedCustomer.debtCeiling} ${storeConfig.currency}\nرابط التحقق والباركود: ${typeof window !== 'undefined' ? window.location.origin : ''}/verify?tx=STATEMENT-${selectedCustomer.id}&type=DEBT&amount=${selectedCustomer.balance}&customer=${encodeURIComponent(selectedCustomer.name)}&phone=${selectedCustomer.phone}&store=${encodeURIComponent(storeConfig.storeName)}`}
          onPrint={() => {
            if (customerTransactions.length > 0) {
              setActivePrintTx(customerTransactions[0]);
              setTimeout(() => window.print(), 100);
            } else {
              triggerToast('لا توجد حركات لطباعتها');
            }
          }}
        />
      )}

      {/* Dedicated Transaction Barcode & QR Code Modal */}
      {viewingTxBarcode && (
        <BarcodeViewModal
          isOpen={!!viewingTxBarcode}
          onClose={() => setViewingTxBarcode(null)}
          title={viewingTxBarcode.type === 'REPAYMENT' ? 'باركود إيصال سداد الدفعة' : 'باركود إيصال تسجيل الدين'}
          subtitle={`سند رقم: ${viewingTxBarcode.id} • ${viewingTxBarcode.details}`}
          codeId={viewingTxBarcode.id}
          amount={viewingTxBarcode.amount}
          currency={storeConfig.currency}
          customerName={viewingTxBarcode.customerName}
          customerPhone={viewingTxBarcode.customerPhone}
          verifyUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify?tx=${viewingTxBarcode.id}&type=${viewingTxBarcode.type}&amount=${viewingTxBarcode.amount}&customer=${encodeURIComponent(viewingTxBarcode.customerName)}&phone=${viewingTxBarcode.customerPhone}&store=${encodeURIComponent(storeConfig.storeName)}&details=${encodeURIComponent(viewingTxBarcode.details)}`}
          whatsappMessage={`سند مالي معتمد من ${storeConfig.storeName}\nالزبون: ${viewingTxBarcode.customerName}\nالعملية: ${viewingTxBarcode.type === 'REPAYMENT' ? 'سداد دفعة' : 'تسجيل دين'}\nالمبلغ: ${viewingTxBarcode.amount} ${storeConfig.currency}\nالرصيد المتبقي: ${viewingTxBarcode.newBalance} ${storeConfig.currency}\nرقم السند: ${viewingTxBarcode.id}\nرابط السند: ${typeof window !== 'undefined' ? window.location.origin : ''}/verify?tx=${viewingTxBarcode.id}&type=${viewingTxBarcode.type}&amount=${viewingTxBarcode.amount}&customer=${encodeURIComponent(viewingTxBarcode.customerName)}&phone=${viewingTxBarcode.customerPhone}&store=${encodeURIComponent(storeConfig.storeName)}&details=${encodeURIComponent(viewingTxBarcode.details)}`}
          onPrint={() => {
            setActivePrintTx(viewingTxBarcode);
            setTimeout(() => window.print(), 100);
          }}
        />
      )}

      {/* Floating Modern Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-slate-900/95 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 border border-emerald-500/40 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Header - Spacious & Clean */}
      <header
        className={`border-b sticky top-0 z-30 px-4 lg:px-8 py-3 backdrop-blur-md transition-colors ${
          isDark ? 'bg-slate-950/85 border-slate-800/80' : 'bg-white/95 border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Store Profile */}
          <div className="flex items-center gap-3">
            <DaftarLogo size={36} showText={true} />
            <div className={`h-5 w-px hidden sm:block ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="hidden sm:flex flex-col">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Store className="w-3.5 h-3.5 text-emerald-500" />
                {storeConfig.storeName}
              </span>
              <span className="text-[11px] text-slate-400">
                {storeConfig.ownerName} • {storeConfig.location}
              </span>
            </div>
          </div>

          {/* Clean Controls & Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Camera QR Scanner */}
            <button
              onClick={() => setShowCameraScanner(true)}
              className="flex items-center gap-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              title="مسح رمز السند المطبوع بكاميرا الهاتف"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مسح الباركود بالكاميرا</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={() => setThemeMode(isDark ? 'DAY' : 'LUXURY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="تغيير الثيم (ليلي / نهاري)"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
              <span className="hidden sm:inline">{isDark ? 'نهاري' : 'ليلي'}</span>
            </button>

            {/* Store Settings & Backup Button */}
            <button
              onClick={() => setShowStoreSettingsModal(true)}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="تخصيص بيانات المحل والنسخ الاحتياطي"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Focused Store Metrics Overview */}
      <section className="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Outstanding Debt */}
          <div className={`p-4 rounded-3xl border transition-all ${isDark ? 'card-surface-dark' : 'card-surface-light'}`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400">إجمالي ديون المحل</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <span className="text-2xl lg:text-3xl font-black text-amber-500 font-mono">{totalOutstandingBalance}</span>
              <span className="text-xs font-bold text-slate-400 mr-1.5">{storeConfig.currency}</span>
            </div>
            <p className="text-[11px] text-slate-400">في ذمة {activeDebtorsCount} زبائن حتى اللحظة</p>
          </div>

          {/* Card 2: Debtors Count */}
          <div className={`p-4 rounded-3xl border transition-all ${isDark ? 'card-surface-dark' : 'card-surface-light'}`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400">زبائن عليهم ديون حالية</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <span className="text-2xl lg:text-3xl font-black text-emerald-400 font-mono">{activeDebtorsCount}</span>
              <span className="text-xs font-bold text-slate-400 mr-1.5">زبون</span>
            </div>
            <p className="text-[11px] text-slate-400">من إجمالي {customers.length} مسجلين بالدفتر</p>
          </div>

          {/* Card 3: Overdue Alert Count */}
          <div className={`p-4 rounded-3xl border transition-all ${isDark ? 'card-surface-dark' : 'card-surface-light'}`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400">ديون متجاوزة للسقف</span>
              <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <span className="text-2xl lg:text-3xl font-black text-red-400 font-mono">{overdueCount}</span>
              <span className="text-xs font-bold text-slate-400 mr-1.5">حالات</span>
            </div>
            <p className="text-[11px] text-red-400/90 font-medium">تجاوزت سقف الدين المحدد</p>
          </div>
        </div>
      </section>

      {/* Main Dual-Column Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (Customer Directory List) - 4 Columns */}
        <section className="lg:col-span-4 flex flex-col gap-3">
          {/* Search & Actions Header */}
          <div className={`p-4 rounded-3xl border ${isDark ? 'card-surface-dark' : 'card-surface-light'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-black flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Users className="w-4 h-4 text-emerald-500" />
                دفتر الزبائن ({customers.length})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowNewCustomerModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  زبون جديد
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-2.5">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو رقم الجوال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full rounded-xl pr-9 pl-3 py-2 text-xs outline-none transition-all border ${
                  isDark
                    ? 'bg-slate-950/70 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
            </div>

            {/* Filter Tabs */}
            <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl text-[10px] font-bold ${isDark ? 'bg-slate-950/80' : 'bg-slate-100'}`}>
              <button
                onClick={() => setCustomerFilter('ALL')}
                className={`py-1 rounded-lg transition-all ${
                  customerFilter === 'ALL'
                    ? isDark
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400'
                }`}
              >
                الكل ({customers.length})
              </button>
              <button
                onClick={() => setCustomerFilter('DEBTORS')}
                className={`py-1 rounded-lg transition-all ${
                  customerFilter === 'DEBTORS' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
                }`}
              >
                مديونين ({activeDebtorsCount})
              </button>
              <button
                onClick={() => setCustomerFilter('OVERDUE')}
                className={`py-1 rounded-lg transition-all ${
                  customerFilter === 'OVERDUE' ? 'bg-red-500 text-white font-black' : 'text-slate-400'
                }`}
              >
                تجاوز ({overdueCount})
              </button>
              <button
                onClick={() => setCustomerFilter('CLEARED')}
                className={`py-1 rounded-lg transition-all ${
                  customerFilter === 'CLEARED' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400'
                }`}
              >
                خالصين
              </button>
            </div>
          </div>

          {/* Customers Scrollable List */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-270px)] pr-0.5">
            {customers.length === 0 ? (
              <div className={`p-8 rounded-3xl border text-center flex flex-col items-center gap-3 ${isDark ? 'card-surface-dark' : 'card-surface-light'}`}>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>الدفتر فارغ تماماً</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">اضغط على «زبون جديد» لتسجيل أول حساب في محلك.</p>
                </div>
                <button
                  onClick={() => setShowNewCustomerModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md transition-all mt-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  إضافة أول زبون
                </button>
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = cust.id === selectedCustomer?.id;
                const isCleared = cust.balance === 0;
                const isOverdue = cust.balance > cust.debtCeiling;

                // Quick WhatsApp Link
                const quickWhatsAppLink = getWhatsAppUrl(
                  cust.phone,
                  `السلام عليكم ${cust.name}، تحياتنا من ${storeConfig.storeName}.\nرصيدكم الحالي: ${cust.balance} ${storeConfig.currency}.`
                );

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-center justify-between group ${
                      isSelected
                        ? isDark
                          ? 'bg-slate-850 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-emerald-50/60 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                        : isDark
                        ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCleared
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isOverdue
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {cust.name.slice(0, 1)}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {cust.name}
                          </span>
                          {isOverdue && (
                            <span className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-bold">
                              متجاوز السقف
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono tracking-tight">{cust.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-sm font-black font-mono ${
                            isCleared ? 'text-emerald-400' : isOverdue ? 'text-red-400' : 'text-amber-400'
                          }`}
                        >
                          {isCleared ? 'خالص' : `${cust.balance} ${storeConfig.currency}`}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          سقف: {cust.debtCeiling} {storeConfig.currency}
                        </span>
                      </div>

                      {/* Fast WhatsApp Chat Button */}
                      <a
                        href={quickWhatsAppLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all opacity-80 hover:opacity-100"
                        title="محادثة واتساب سريعة"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      {/* Delete Customer Button */}
                      <button
                        onClick={(e) => handleDeleteCustomer(cust.id, cust.name, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="حذف الزبون"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column (Customer Statement & POS Controls) - 8 Columns */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {selectedCustomer ? (
            <>
              {/* Customer Statement Header Card */}
              <div className={`p-5 rounded-3xl border ${isDark ? 'card-surface-dark' : 'card-surface-light'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-lg shadow-lg">
                      {selectedCustomer.name.slice(0, 1)}
                    </div>
                    <div>
                      <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        كشف حساب: {selectedCustomer.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {selectedCustomer.phone}
                        </span>
                        <span>•</span>
                        <span>سقف الدين: {selectedCustomer.debtCeiling} {storeConfig.currency}</span>
                        <span>•</span>
                        {/* WhatsApp Instant Chat Pill */}
                        <a
                          href={getCustomerStatementWhatsAppUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 transition-all shadow-xs"
                          title="فتح محادثة واتساب فورية"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>واتساب</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Financial Status Pill */}
                  <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">الرصيد المستحق بذمته:</span>
                      <span
                        className={`text-xl font-black font-mono ${
                          selectedCustomer.balance === 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {selectedCustomer.balance === 0 ? 'خالص (0 ₪)' : `${selectedCustomer.balance} ${storeConfig.currency}`}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-slate-800" />

                    <div className="flex flex-col text-[10px] text-slate-400">
                      <span>المتبقي من السقف:</span>
                      <span className="font-bold text-white font-mono">
                        {Math.max(0, selectedCustomer.debtCeiling - selectedCustomer.balance)} {storeConfig.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons: Settle Debt, Add Debt, Barcode/QR, WhatsApp */}
                <div className="flex flex-wrap items-center gap-2.5 pt-4">
                  {/* Settle Debt Button */}
                  <button
                    onClick={() => {
                      if (selectedCustomer.balance <= 0) {
                        triggerToast(`حساب الزبون (${selectedCustomer.name}) خالص ولا توجد ديون مستحقة`);
                        return;
                      }
                      setPosMode('REPAYMENT');
                      setPosAmount('0');
                    }}
                    className={`flex-1 sm:flex-none font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all ${
                      selectedCustomer.balance <= 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50 shadow-none'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{selectedCustomer.balance <= 0 ? 'خالص (لا يوجد دين)' : 'سداد دفعة نقدية'}</span>
                  </button>

                  {/* Add Debt Button */}
                  <button
                    onClick={() => {
                      setPosMode('DEBT');
                      setPosAmount('0');
                    }}
                    className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>تسجيل دين بضاعة</span>
                  </button>

                  {/* PROMINENT BARCODE / QR MODAL TRIGGER */}
                  <button
                    onClick={() => setShowCustomerBarcodeModal(true)}
                    className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                    title="عرض كود QR والباركود لكشف حساب الزبون"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>عرض الباركود و QR</span>
                  </button>

                  {/* PROMINENT WHATSAPP DISPATCH BUTTON */}
                  <a
                    href={getCustomerStatementWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
                    title="إرسال كشف الحساب والرصيد المستحق للزبون عبر واتساب"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>إرسال كشف الحساب واتساب</span>
                  </a>

                  {/* Print Statement Button */}
                  <button
                    onClick={() => {
                      if (customerTransactions.length > 0) {
                        setActivePrintTx(customerTransactions[0]);
                        setTimeout(() => window.print(), 100);
                      } else {
                        triggerToast('لا توجد حركات لطباعة سند');
                      }
                    }}
                    className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                    title="طباعة آخر إيصال حراري"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة آخر سند</span>
                  </button>
                </div>
              </div>

              {/* Transactions Ledger Log */}
              <div className={`p-5 rounded-3xl border flex-1 ${isDark ? 'card-surface-dark' : 'card-surface-light'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-black flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <FileText className="w-4 h-4 text-emerald-500" />
                    سجل المعاملات والتوثيق ({customerTransactions.length})
                  </span>
                  <span className="text-[10px] text-slate-400">سجل مشفر غير قابل للتعديل</span>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {customerTransactions.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      لا توجد حركات مسجلة لهذا الزبون حتى الآن.
                    </div>
                  ) : (
                    customerTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                          tx.type === 'REPAYMENT'
                            ? isDark
                              ? 'bg-emerald-950/20 border-emerald-500/20'
                              : 'bg-emerald-50/50 border-emerald-200'
                            : isDark
                            ? 'bg-amber-950/20 border-amber-500/20'
                            : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              tx.type === 'REPAYMENT'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {tx.type === 'REPAYMENT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>

                          <div className="flex flex-col">
                            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {tx.type === 'REPAYMENT' ? 'سداد دفعة' : 'تسجيل دين'}: {tx.details}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>{new Date(tx.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
                              <span>•</span>
                              <span className="font-mono text-[9px]">كود: {tx.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Financial Amounts & Action Icons */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex flex-col items-end">
                            <span
                              className={`text-sm font-black font-mono ${
                                tx.type === 'REPAYMENT' ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {tx.type === 'REPAYMENT' ? `-${tx.amount}` : `+${tx.amount}`} {storeConfig.currency}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              الرصيد بعدها: {tx.newBalance} {storeConfig.currency}
                            </span>
                          </div>

                          {/* ACTION 1: View Barcode & QR code for this specific transaction */}
                          <button
                            onClick={() => setViewingTxBarcode(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/30"
                            title="عرض باركود ورمز QR لهذه الحركة"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* ACTION 2: Direct WhatsApp Send for this specific transaction */}
                          <a
                            href={getTxWhatsAppUrl(tx)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/30"
                            title="إرسال سند هذه الحركة للزبون عبر واتساب"
                          >
                            <Share2 className="w-4 h-4" />
                          </a>

                          {/* ACTION 3: Print single thermal receipt button */}
                          <button
                            onClick={() => {
                              setActivePrintTx(tx);
                              setTimeout(() => window.print(), 100);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                            title="طباعة إيصال حراري"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={`p-12 rounded-3xl border text-center flex flex-col items-center justify-center gap-3 ${isDark ? 'card-surface-dark' : 'card-surface-light'}`}>
              <Users className="w-12 h-12 text-slate-600" />
              <h3 className="font-bold text-sm">اختر زبوناً من القائمة لعرض كشف الحساب</h3>
            </div>
          )}
        </section>
      </main>

      {/* POS Keypad Modal (Smart Numpad with Strict Boundary Constraints) */}
      {posMode && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 flex flex-col gap-4 shadow-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm">
                  {posMode === 'REPAYMENT' ? `سداد دفعة من: ${selectedCustomer.name}` : `تسجيل دين على: ${selectedCustomer.name}`}
                </h3>
              </div>
              <button
                onClick={() => setPosMode(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const enteredAmount = parseFloat(posAmount) || 0;
              const isOverpaying = posMode === 'REPAYMENT' && enteredAmount > selectedCustomer.balance;
              const remainingAfterRepay = Math.max(0, selectedCustomer.balance - enteredAmount);

              return (
                <>
                  {/* Amount Display */}
                  <div className={`p-4 rounded-2xl text-center border transition-all ${
                    isOverpaying
                      ? 'bg-red-500/10 border-red-500/50'
                      : isDark
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] text-slate-400 block mb-1">المبلغ المراد تسجيله:</span>
                    <div className="text-3xl font-black font-mono flex items-center justify-center gap-1.5">
                      <span className={isOverpaying ? 'text-red-400' : isDark ? 'text-white' : 'text-slate-900'}>
                        {posAmount}
                      </span>
                      <span className="text-sm font-bold text-amber-400">{storeConfig.currency}</span>
                    </div>

                    {posMode === 'REPAYMENT' && (
                      <div className="mt-2 text-[11px] flex justify-between px-2 pt-2 border-t border-slate-800/60">
                        <span className="text-slate-400">الدين الحالي: {selectedCustomer.balance} {storeConfig.currency}</span>
                        <span className={`font-bold ${isOverpaying ? 'text-red-400' : 'text-emerald-400'}`}>
                          المتبقي بعد السداد: {remainingAfterRepay} {storeConfig.currency}
                        </span>
                      </div>
                    )}
                  </div>

                  {isOverpaying && (
                    <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>مبلغ السداد يتجاوز إجمالي الدين المستحق ({selectedCustomer.balance} {storeConfig.currency})!</span>
                    </div>
                  )}

                  {/* Quick Preset Chips */}
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {[10, 20, 50, 100]
                      .filter((amt) => posMode !== 'REPAYMENT' || amt <= selectedCustomer.balance)
                      .map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setPosAmount(amt.toString())}
                          className="font-bold px-3 py-1 rounded-xl text-xs bg-slate-800 border border-slate-700 text-slate-200 hover:border-emerald-500 transition-all"
                        >
                          +{amt} {storeConfig.currency}
                        </button>
                      ))}
                    {posMode === 'REPAYMENT' && selectedCustomer.balance > 0 && (
                      <button
                        onClick={() => setPosAmount(selectedCustomer.balance.toString())}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-xl text-xs"
                      >
                        سداد كامل الدين ({selectedCustomer.balance} {storeConfig.currency})
                      </button>
                    )}
                  </div>

                  {/* Numpad */}
                  <div dir="ltr" className="grid grid-cols-3 gap-2 text-base font-bold font-mono">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeypadPress(key)}
                        className={`py-3 rounded-xl border transition-all active:scale-90 flex items-center justify-center font-bold text-base ${
                          key === 'CLEAR'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 text-xs font-sans'
                            : key === 'BACK'
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 text-xs font-sans'
                            : isDark
                            ? 'bg-slate-950 border-slate-800 text-white hover:bg-slate-800'
                            : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {key === 'CLEAR' ? 'مسح' : key === 'BACK' ? '⌫ رجوع' : key}
                      </button>
                    ))}
                  </div>

                  {/* Note Input */}
                  <input
                    type="text"
                    placeholder="بيان العملية (مثال: طحين، معلبات، كاش...)"
                    value={posDetails}
                    onChange={(e) => setPosDetails(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />

                  {/* Confirm Button */}
                  <button
                    onClick={handleExecutePosTransaction}
                    disabled={enteredAmount <= 0 || isOverpaying}
                    className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                      enteredAmount <= 0 || isOverpaying
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50 shadow-none'
                        : posMode === 'REPAYMENT'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 active:scale-95'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 active:scale-95'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {isOverpaying ? `غير مسموح بسداد أكثر من الدين` : 'تأكيد واستخراج كود السند والباركود'}
                    </span>
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Real QR Verification Modal with Thermal Print & WhatsApp Dispatch */}
      {qrModalData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 flex flex-col items-center text-center gap-4 shadow-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400">سند رقمي موثق مع الباركود</span>
              <button onClick={() => setQrModalData(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!qrDoneSuccess ? (
              <>
                <div className="border-2 border-emerald-500/40 rounded-2xl p-2.5 bg-white shadow-xl">
                  <RealQRCode value={qrModalData.url} size={180} />
                </div>

                <div className="w-full bg-slate-950 rounded-xl p-3 text-xs space-y-1 text-right border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">المبلغ:</span>
                    <span className="font-extrabold text-white">{qrModalData.amount} {storeConfig.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الزبون:</span>
                    <span className="font-bold text-emerald-400">{qrModalData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">رقم السند:</span>
                    <span className="font-mono text-slate-400">{qrModalData.receiptId}</span>
                  </div>
                </div>

                {/* Thermal Print & WhatsApp Dispatch Actions */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    onClick={() => window.print()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    طباعة إيصال حراري
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?phone=${qrModalData.customerPhone.startsWith('0') ? '970' + qrModalData.customerPhone.slice(1) : qrModalData.customerPhone}&text=${encodeURIComponent(
                      `سند مالي من ${storeConfig.storeName}\nالزبون: ${qrModalData.customerName}\nالعملية: ${
                        qrModalData.type === 'REPAYMENT' ? 'سداد دفعة نقدية' : 'تسجيل دين بضاعة'
                      }\nالمبلغ: ${qrModalData.amount} ${storeConfig.currency}\nالرصيد المتبقي: ${
                        qrModalData.newBalance
                      } ${storeConfig.currency}\nرقم السند: ${qrModalData.receiptId}\nرابط السند والباركود:\n${qrModalData.url}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    إرسال واتساب
                  </a>
                </div>

                {/* Instant Done Button */}
                <button
                  onClick={() => setQrDoneSuccess(true)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
                >
                  تأكيد: تم المسح والانتهاء ✓
                </button>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center gap-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
                <h3 className="text-lg font-black text-white">تمت العملية بنجاح!</h3>
                <p className="text-xs text-slate-400">تم حفظ وتحديث رصيد الزبون في قاعدة البيانات المحلية.</p>
                <button
                  onClick={() => setQrModalData(null)}
                  className="w-full mt-2 bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  إغلاق والعودة للدفتر
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add New Customer */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 flex flex-col gap-4 shadow-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black flex items-center gap-2 text-white">
                <UserPlus className="w-4 h-4 text-emerald-500" />
                إضافة زبون جديد للدفتر
              </h3>
              <button onClick={() => setShowNewCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block font-bold">اسم الزبون الكامل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف محمود الدحدوح"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-bold">رقم الجوال (جوال 059 / أوريدو 056)</label>
                  {(() => {
                    if (!newCustPhone) return null;
                    const check = validatePalestinianPhone(newCustPhone);
                    if (check.isValid) {
                      return (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                          <Check className="w-3 h-3" />
                          {check.network}
                        </span>
                      );
                    }
                    return (
                      <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        رقم غير مكتمل
                      </span>
                    );
                  })()}
                </div>
                <input
                  type="tel"
                  required
                  placeholder="مثال: 0599123456 أو 0568123456"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs outline-none font-mono border transition-all ${
                    newCustPhone.length > 0 && !validatePalestinianPhone(newCustPhone).isValid
                      ? 'border-red-500/60 bg-red-500/5 text-red-200'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Initial Debt */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 block">رصيد دين افتتاحي (اختياري)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">المبلغ ({storeConfig.currency})</label>
                    <input
                      type="number"
                      value={newCustInitialDebt}
                      onChange={(e) => setNewCustInitialDebt(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">سقف الدين المسموح</label>
                    <input
                      type="number"
                      value={newCustCeiling}
                      onChange={(e) => setNewCustCeiling(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={
                    !newCustName.trim() ||
                    !validatePalestinianPhone(newCustPhone).isValid ||
                    !!customers.find((c) => c.phone === validatePalestinianPhone(newCustPhone).normalized)
                  }
                  className={`flex-1 font-black py-2.5 rounded-xl text-xs transition-all shadow-md ${
                    !newCustName.trim() ||
                    !validatePalestinianPhone(newCustPhone).isValid ||
                    !!customers.find((c) => c.phone === validatePalestinianPhone(newCustPhone).normalized)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50 shadow-none'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95'
                  }`}
                >
                  حفظ وتسجيل الزبون
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
