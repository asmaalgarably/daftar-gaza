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
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
  Percent,
  Calculator,
  Delete,
  UserPlus,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { DaftarLogo } from '@/components/DaftarLogo';
import { RealQRCode } from '@/components/RealQRCode';

interface CustomerTransaction {
  id: string;
  type: 'DEBT' | 'REPAYMENT';
  amount: number;
  details: string;
  date: string;
  receiptNumber: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  debtCeiling: number;
  lastActive: string;
  tag: 'VIP' | 'REGULAR' | 'OVERDUE';
  transactions: CustomerTransaction[];
}

export default function LuxuryStoreLedgerApp() {
  const [themeMode, setThemeMode] = useState<'LUXURY' | 'DAY'>('LUXURY');

  // Store Profile (Customizable & Persisted)
  const [storeName, setStoreName] = useState('سوبرماركت الأمل');
  const [storeOwner, setStoreOwner] = useState('أبو خليل');
  const [storeLocation, setStoreLocation] = useState('غزة - دير البلح');
  const [showStoreSettingsModal, setShowStoreSettingsModal] = useState(false);

  // Customer List (ZEROED OUT / CLEAN SLATE with localStorage support!)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'ALL' | 'DEBTORS' | 'CLEARED' | 'OVERDUE'>('ALL');

  // Load from localStorage on first mount & purge any legacy dummy data
  useEffect(() => {
    try {
      const savedCusts = localStorage.getItem('daftar_gaza_customers');
      if (savedCusts) {
        const parsed: Customer[] = JSON.parse(savedCusts);
        // Clean out any legacy mock data automatically so the ledger starts pure
        const hasLegacyDummy = parsed.some(
          (c) =>
            c.name.includes('الرنتيسي') ||
            c.name.includes('النجار') ||
            c.name.includes('الجار') ||
            c.name.includes('الدحدوح') ||
            c.id === 'c1' ||
            c.id === 'c2' ||
            c.id === 'c3'
        );
        if (hasLegacyDummy) {
          localStorage.removeItem('daftar_gaza_customers');
          setCustomers([]);
          setSelectedCustomerId(null);
        } else {
          setCustomers(parsed);
          if (parsed.length > 0) {
            setSelectedCustomerId(parsed[0].id);
          }
        }
      }

      const savedStore = localStorage.getItem('daftar_gaza_store');
      if (savedStore) {
        const parsedStore = JSON.parse(savedStore);
        if (parsedStore.storeName) setStoreName(parsedStore.storeName);
        if (parsedStore.storeOwner) setStoreOwner(parsedStore.storeOwner);
        if (parsedStore.storeLocation) setStoreLocation(parsedStore.storeLocation);
      }
    } catch {
      // Storage fallback
    }
  }, []);

  // Sync to localStorage
  const saveCustomersState = (updated: Customer[]) => {
    setCustomers(updated);
    try {
      localStorage.setItem('daftar_gaza_customers', JSON.stringify(updated));
    } catch {
      // storage fallback
    }
  };

  // Delete individual customer with confirmation
  const handleDeleteCustomer = (customerId: string, customerName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window !== 'undefined' && window.confirm(`هل أنت متأكد من حذف حساب الزبون (${customerName}) نهائياً من دفتر الديون؟`)) {
      const updated = customers.filter((c) => c.id !== customerId);
      saveCustomersState(updated);
      if (selectedCustomerId === customerId) {
        setSelectedCustomerId(updated.length > 0 ? updated[0].id : null);
      }
      triggerToast(`تم حذف حساب الزبون (${customerName}) بنجاح`);
    }
  };

  // Master wipe / reset all customers
  const handleResetAllData = () => {
    if (typeof window !== 'undefined' && window.confirm('هل أنت متأكد تماماً من تصفير كافة الحسابات ومسح جميع الزبائن من الدفتر للبدء من الصفر؟')) {
      try {
        localStorage.removeItem('daftar_gaza_customers');
      } catch {}
      setCustomers([]);
      setSelectedCustomerId(null);
      triggerToast('تم تصفير الدفتر بالكامل، السجل فارغ الآن');
    }
  };

  // Keypad & POS Action Mode
  const [posMode, setPosMode] = useState<'REPAYMENT' | 'DEBT' | null>(null);
  const [posAmount, setPosAmount] = useState('0');
  const [posDetails, setPosDetails] = useState('');

  // Add Customer Modal
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
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
    details: string;
    receiptId: string;
  } | null>(null);
  const [qrDoneSuccess, setQrDoneSuccess] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || (customers.length > 0 ? customers[0] : null);

  // Store Analytics
  const totalOutstandingBalance = customers.reduce((sum, c) => sum + c.balance, 0);
  const activeDebtorsCount = customers.filter((c) => c.balance > 0).length;
  const overdueCount = customers.filter((c) => c.tag === 'OVERDUE').length;
  const collectionRate = customers.length === 0 ? 100 : Math.round((customers.filter((c) => c.balance === 0).length / customers.length) * 100);

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name.includes(searchTerm) || c.phone.includes(searchTerm);
    if (!matchesSearch) return false;
    if (customerFilter === 'DEBTORS') return c.balance > 0;
    if (customerFilter === 'CLEARED') return c.balance === 0;
    if (customerFilter === 'OVERDUE') return c.tag === 'OVERDUE';
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

  // Execute POS Transaction
  const handleExecutePosTransaction = () => {
    const amountNum = parseFloat(posAmount);
    if (isNaN(amountNum) || amountNum <= 0 || !selectedCustomer || !posMode) return;

    const newTxId = `REC-${Math.floor(100 + Math.random() * 900)}`;
    const txDetails = posDetails || (posMode === 'REPAYMENT' ? 'سداد دفعة نقدية كاش' : 'شراء بضاعة على الحساب');

    const newTx: CustomerTransaction = {
      id: `tx-${Date.now()}`,
      type: posMode,
      amount: amountNum,
      details: txDetails,
      date: 'اليوم، الآن',
      receiptNumber: newTxId,
    };

    const updated = customers.map((c) =>
      c.id === selectedCustomer.id
        ? {
            ...c,
            balance:
              posMode === 'REPAYMENT'
                ? Math.max(0, c.balance - amountNum)
                : c.balance + amountNum,
            lastActive: 'الآن',
            transactions: [newTx, ...c.transactions],
          }
        : c
    );

    saveCustomersState(updated);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const verifyUrl = `${origin}/verify?tx=${newTxId}&type=${posMode}&amount=${amountNum}&customer=${encodeURIComponent(
      selectedCustomer.name
    )}&phone=${selectedCustomer.phone}&store=${encodeURIComponent(storeName)}&details=${encodeURIComponent(
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
      details: txDetails,
      receiptId: newTxId,
    });

    triggerToast(
      currentMode === 'REPAYMENT'
        ? `تم قيد سداد ${amountNum} ₪ لحساب ${selectedCustomer.name}`
        : `تم قيد دين بقيمة ${amountNum} ₪ على ${selectedCustomer.name}`
    );
  };

  // Create new customer with INITIAL DEBT
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const initialDebtNum = parseFloat(newCustInitialDebt) || 0;
    const initialReason = newCustDebtReason || 'رصيد دين افتتاحي';
    const newTxId = `REC-${Math.floor(100 + Math.random() * 900)}`;

    const initialTransactions: CustomerTransaction[] =
      initialDebtNum > 0
        ? [
            {
              id: `tx-${Date.now()}`,
              type: 'DEBT',
              amount: initialDebtNum,
              details: initialReason,
              date: 'اليوم، الآن',
              receiptNumber: newTxId,
            },
          ]
        : [];

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName,
      phone: newCustPhone,
      balance: initialDebtNum,
      debtCeiling: parseFloat(newCustCeiling) || 500,
      lastActive: 'الآن (جديد)',
      tag: initialDebtNum > 0 ? 'REGULAR' : 'VIP',
      transactions: initialTransactions,
    };

    const updated = [newCust, ...customers];
    saveCustomersState(updated);
    setSelectedCustomerId(newCust.id);

    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustInitialDebt('50');
    setNewCustDebtReason('رصيد دين سابق / مشتريات');

    triggerToast(
      initialDebtNum > 0
        ? `تمت إضافة ${newCustName} برصيد دين ${initialDebtNum} ₪`
        : `تمت إضافة الزبون ${newCustName} إلى الدفتر`
    );
  };

  const isDark = themeMode === 'LUXURY';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark ? 'bg-theme-luxury text-slate-100' : 'bg-theme-day text-slate-800'
      }`}
    >
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
          isDark
            ? 'bg-slate-950/85 border-slate-800/80'
            : 'bg-white/95 border-slate-200 shadow-xs'
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
                {storeName}
              </span>
              <span className="text-[11px] text-slate-400">{storeOwner} • {storeLocation}</span>
            </div>
          </div>

          {/* Clean Controls */}
          <div className="flex items-center gap-2">
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

            {/* Store Settings Button */}
            <button
              onClick={() => setShowStoreSettingsModal(true)}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="تخصيص بيانات المحل"
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
              <span className="text-xs font-bold text-slate-400 mr-1.5">₪ شيكل</span>
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
              <span className="text-xs font-bold text-slate-400">ديون متأخرة المتابعة</span>
              <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <span className="text-2xl lg:text-3xl font-black text-red-400 font-mono">{overdueCount}</span>
              <span className="text-xs font-bold text-slate-400 mr-1.5">حالات</span>
            </div>
            <p className="text-[11px] text-red-400/90 font-medium">تجاوزت سقف أو وقت السداد</p>
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
                {customers.length > 0 && (
                  <button
                    onClick={handleResetAllData}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all text-xs"
                    title="تصفير ومسح كافة الزبائن من الدفتر"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowNewCustomerModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  زبون مديون جديد
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
                className={`py-1 rounded-lg transition-all ${customerFilter === 'ALL' ? (isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-xs') : 'text-slate-400'}`}
              >
                الكل ({customers.length})
              </button>
              <button
                onClick={() => setCustomerFilter('DEBTORS')}
                className={`py-1 rounded-lg transition-all ${customerFilter === 'DEBTORS' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'}`}
              >
                مديونين ({activeDebtorsCount})
              </button>
              <button
                onClick={() => setCustomerFilter('OVERDUE')}
                className={`py-1 rounded-lg transition-all ${customerFilter === 'OVERDUE' ? 'bg-red-500 text-white font-black' : 'text-slate-400'}`}
              >
                متأخرين ({overdueCount})
              </button>
              <button
                onClick={() => setCustomerFilter('CLEARED')}
                className={`py-1 rounded-lg transition-all ${customerFilter === 'CLEARED' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400'}`}
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
                  <p className="text-[11px] text-slate-400 mt-0.5">اضغط على «زبون مديون جديد» لتسجيل أول حساب في محلك.</p>
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
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex items-center justify-between ${
                      isSelected
                        ? isDark
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                          : 'bg-emerald-50 border-emerald-500 shadow-xs'
                        : isDark
                        ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                          cust.balance > 0
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {cust.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className={`text-xs font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{cust.name}</h3>
                          {cust.tag === 'VIP' && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">VIP</span>
                          )}
                          {cust.tag === 'OVERDUE' && (
                            <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-bold">متأخر</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {cust.phone}
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <div
                        className={`text-sm font-black font-mono ${
                          cust.balance > 0 ? 'text-amber-500' : 'text-emerald-400'
                        }`}
                      >
                        {cust.balance > 0 ? `${cust.balance} ₪` : 'خالص 0 ₪'}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{cust.lastActive}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column (Customer Statement & History Table) - 8 Columns */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {selectedCustomer ? (
            <>
              {/* Customer Statement Header Card */}
              <div className={`p-5 sm:p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'card-surface-dark' : 'card-surface-light'}`}>
                <div>
                  <span className="text-[11px] font-bold text-emerald-500 block mb-0.5">كشف حساب الزبون المختار:</span>
                  <h2 className={`text-xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedCustomer.name}
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                      {selectedCustomer.phone}
                    </span>
                  </h2>
                  
                  {/* Debt Headroom Progress */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span>سقف الدين المتاح: <strong>{selectedCustomer.debtCeiling} ₪</strong></span>
                    <span>•</span>
                    <span>المتبقي من السقف: <strong className="text-emerald-400">{Math.max(0, selectedCustomer.debtCeiling - selectedCustomer.balance)} ₪</strong></span>
                  </div>
                </div>

                {/* Outstanding Balance Banner & Master Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className={`px-5 py-2.5 rounded-2xl text-center sm:text-right border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[10px] font-bold text-slate-400 block">الرصيد المستحق في ذمته</span>
                    <span className={`text-2xl font-black font-mono ${selectedCustomer.balance > 0 ? 'text-amber-500' : 'text-emerald-400'}`}>
                      {selectedCustomer.balance} ₪
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-1 sm:flex-none">
                    {/* Settle Debt Button */}
                    <button
                      onClick={() => {
                        setPosMode('REPAYMENT');
                        setPosAmount('0');
                      }}
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>سداد دفعة</span>
                    </button>

                    {/* Add Debt Button */}
                    <button
                      onClick={() => {
                        setPosMode('DEBT');
                        setPosAmount('0');
                      }}
                      className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>تسجيل دين</span>
                    </button>

                    {/* Send WhatsApp Statement */}
                    <a
                      href={`https://api.whatsapp.com/send?phone=${selectedCustomer.phone.replace(/^0/, '970')}&text=${encodeURIComponent(
                        `مرحباً ${selectedCustomer.name}، كشف حسابك الحالي لدى ${storeName}:%0Aالرصيد القائم بذمتك: ${selectedCustomer.balance} شيكل.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-xl text-xs border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'}`}
                      title="إرسال كشف الحساب عبر واتساب"
                    >
                      <Share2 className="w-4 h-4" />
                    </a>

                    {/* Delete Customer Button */}
                    <button
                      onClick={() => handleDeleteCustomer(selectedCustomer.id, selectedCustomer.name)}
                      className={`p-2.5 rounded-xl text-xs border transition-all ${
                        isDark
                          ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                          : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                      }`}
                      title={`حذف حساب ${selectedCustomer.name} نهائياً من الدفتر`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Detailed Statement Ledger Table (Always visible and clean!) */}
              <div className={`p-5 rounded-3xl border ${isDark ? 'card-surface-dark' : 'card-surface-light'}`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                  <h3 className={`text-xs font-black flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <FileText className="w-4 h-4 text-emerald-500" />
                    حركات الحساب التفصيلية ({selectedCustomer.transactions.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">سجل زمني موثق لكافة الديون والدفعات</span>
                </div>

                {selectedCustomer.transactions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    لا توجد حركات مسجلة لهذا الزبون حتى الآن.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/40">
                    {selectedCustomer.transactions.map((tx) => (
                      <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                              tx.type === 'REPAYMENT'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}
                          >
                            {tx.type === 'REPAYMENT' ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>

                          <div>
                            <div className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              <span>{tx.details}</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/40 px-1.5 py-0.2 rounded">
                                {tx.receiptNumber}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {tx.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-base font-black font-mono ${
                              tx.type === 'REPAYMENT' ? 'text-emerald-400' : 'text-amber-500'
                            }`}
                          >
                            {tx.type === 'REPAYMENT' ? `-${tx.amount}` : `+${tx.amount}`} ₪
                          </span>

                          {/* Open Scannable QR modal */}
                          <button
                            onClick={() => {
                              const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                              const verifyUrl = `${origin}/verify?tx=${tx.receiptNumber}&type=${tx.type}&amount=${tx.amount}&customer=${encodeURIComponent(
                                selectedCustomer.name
                              )}&phone=${selectedCustomer.phone}&store=${encodeURIComponent(storeName)}&details=${encodeURIComponent(
                                tx.details
                              )}&date=${encodeURIComponent(tx.date)}`;

                              setQrDoneSuccess(false);
                              setQrModalData({
                                url: verifyUrl,
                                type: tx.type,
                                amount: tx.amount,
                                customerName: selectedCustomer.name,
                                details: tx.details,
                                receiptId: tx.receiptNumber,
                              });
                            }}
                            className={`p-2 rounded-lg text-xs border transition-all ${
                              isDark
                                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400'
                                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-emerald-600'
                            }`}
                            title="عرض كود الـ QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Welcome / Zeroed State on Right Panel */
            <div className={`p-12 rounded-3xl border text-center flex flex-col items-center justify-center gap-4 ${isDark ? 'card-surface-dark' : 'card-surface-light'}`}>
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  دفتر حسابات {storeName} جاهز تماماً
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  تم تصفير كافة السجلات بنجاح لتتمكن من إضافة زبائنك الحقيقيين وتسجيل ديونهم ودفعاتهم بدقة وسهولة.
                </p>
              </div>
              <button
                onClick={() => setShowNewCustomerModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة أول زبون مديون الآن</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* POS NUMPAD MODAL (FOCUSED & CLEAN, NOT CLUTTERING SCREEN) */}
      {posMode && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 flex flex-col gap-4 shadow-2xl relative animate-in fade-in zoom-in-95 border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-black flex items-center gap-2 ${posMode === 'REPAYMENT' ? 'text-emerald-500' : 'text-amber-500'}`}>
                {posMode === 'REPAYMENT' ? <CreditCard className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                {posMode === 'REPAYMENT' ? `سداد دفعة نقدية من: ${selectedCustomer.name}` : `تسجيل دين على: ${selectedCustomer.name}`}
              </h3>
              <button onClick={() => setPosMode(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Display Screen */}
            <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[11px] text-slate-400 block mb-0.5">المبلغ المدخل:</span>
              <div className="text-4xl font-black font-mono text-white flex items-center justify-center gap-2">
                <span className={posMode === 'REPAYMENT' ? 'text-emerald-400' : 'text-amber-400'}>{posAmount}</span>
                <span className="text-lg text-slate-400">₪</span>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[10, 20, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setPosAmount(amt.toString())}
                  className={`font-bold px-3 py-1 rounded-xl text-xs transition-all border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-emerald-500' : 'bg-slate-100 border-slate-300 text-slate-800 hover:border-emerald-500'
                  }`}
                >
                  +{amt} ₪
                </button>
              ))}
              {posMode === 'REPAYMENT' && selectedCustomer.balance > 0 && (
                <button
                  onClick={() => setPosAmount(selectedCustomer.balance.toString())}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-xl text-xs"
                >
                  كامل الرصيد ({selectedCustomer.balance} ₪)
                </button>
              )}
            </div>

            {/* Tactile Keypad (LTR standard calculator layout 1,2,3) */}
            <div dir="ltr" className="grid grid-cols-3 gap-2 text-base font-bold font-mono">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeypadPress(key)}
                  className={`py-3.5 rounded-xl border transition-all active:scale-90 flex items-center justify-center font-bold text-lg ${
                    key === 'CLEAR'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 text-xs font-sans'
                      : key === 'BACK'
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 text-xs font-sans'
                      : isDark
                      ? 'bg-slate-950 border-slate-800 text-white hover:bg-slate-800'
                      : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-100 shadow-xs'
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
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none border ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />

            {/* Confirm Button */}
            <button
              onClick={handleExecutePosTransaction}
              className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                posMode === 'REPAYMENT'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>تأكيد واستخراج كود QR المباشر</span>
            </button>
          </div>
        </div>
      )}

      {/* REAL SCANNABLE QR CODE MODAL WITH "DONE & CONFIRMED" IN-MODAL FEEDBACK */}
      {qrModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl relative animate-in fade-in zoom-in-95 border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <button
              onClick={() => setQrModalData(null)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/40"
            >
              <X className="w-5 h-5" />
            </button>

            {!qrDoneSuccess ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>

                <div>
                  <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {qrModalData.type === 'REPAYMENT' ? 'كود إيصال سداد الدفعة' : 'كود إيصال الشراء الآجل'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    امسح الرمز بكاميرا الجوال أو اضغط تأكيد فوري
                  </p>
                </div>

                {/* The Real Canvas Scannable QR Code */}
                <div className="border-2 border-slate-800 rounded-2xl p-2 bg-white shadow-xl">
                  <RealQRCode value={qrModalData.url} size={210} />
                </div>

                {/* Transaction Brief */}
                <div className={`w-full rounded-xl p-3 text-xs flex flex-col gap-1.5 text-right border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-400">المبلغ:</span>
                    <span className="font-extrabold text-white text-sm">{qrModalData.amount} ₪ شيكل</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الزبون:</span>
                    <span className="font-bold text-emerald-400">{qrModalData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">رقم الإيصال:</span>
                    <span className="font-mono text-slate-400">{qrModalData.receiptId}</span>
                  </div>
                </div>

                {/* Instant "تم وخلاص" Confirmation Button */}
                <button
                  onClick={() => setQrDoneSuccess(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تأكيد: تم المسح والانتهاء ✓</span>
                </button>
              </>
            ) : (
              /* INSTANT SUCCESS SCREEN: "تم وخلاص" WITHOUT ANY REDIRECTS */
              <div className="py-6 flex flex-col items-center gap-4 animate-in zoom-in-95">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-emerald-400">تمت العملية بنجاح!</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    تم قيد المبلغ وتحديث رصيد {qrModalData.customerName} بالدفتر فوراً.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl w-full text-center border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block mb-1">المبلغ المعتمد:</span>
                  <span className="text-3xl font-black text-white">{qrModalData.amount} ₪</span>
                </div>

                <button
                  onClick={() => setQrModalData(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm"
                >
                  إغلاق والعودة للدفتر
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Add New Customer (WITH INITIAL DEBT SUPPORT!) */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4 shadow-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <UserPlus className="w-5 h-5 text-emerald-500" />
                إضافة زبون مديون جديد
              </h3>
              <button onClick={() => setShowNewCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">اسم الزبون الكامل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف محمود الدحدوح"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">رقم الجوال (جوال / أوريدو)</label>
                <input
                  type="tel"
                  required
                  placeholder="059xxxxxxx أو 056xxxxxxx"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none font-mono border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Initial Debt Field */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex flex-col gap-2">
                <div>
                  <label className="text-xs font-extrabold text-amber-500 mb-1 block">
                    الدين الحالي المطلوب منه (بالشيكل ₪):
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    placeholder="مثال: 120"
                    value={newCustInitialDebt}
                    onChange={(e) => setNewCustInitialDebt(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2 text-sm outline-none font-mono font-bold border ${
                      isDark ? 'bg-slate-950 border-amber-500/40 text-amber-400' : 'bg-white border-amber-300 text-amber-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">سبب الدين / البيان:</label>
                  <input
                    type="text"
                    placeholder="مثال: طحين، معلبات، حساب قديم..."
                    value={newCustDebtReason}
                    onChange={(e) => setNewCustDebtReason(e.target.value)}
                    className={`w-full rounded-xl px-3 py-1.5 text-xs outline-none border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">سقف الدين الأقصى المسموح (₪)</label>
                <input
                  type="number"
                  placeholder="مثال: 500"
                  value={newCustCeiling}
                  onChange={(e) => setNewCustCeiling(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2 text-sm outline-none font-mono border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
                >
                  حفظ وتسجيل الزبون كمديون
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Store Settings Customization */}
      {showStoreSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4 shadow-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Store className="w-5 h-5 text-emerald-500" />
                تخصيص بيانات المحل
              </h3>
              <button onClick={() => setShowStoreSettingsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">اسم المحل / البقالة</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">اسم صاحب المحل / المسؤول</label>
                <input
                  type="text"
                  value={storeOwner}
                  onChange={(e) => setStoreOwner(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">الموقع / العنوان في غزة</label>
                <input
                  type="text"
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <button
                onClick={() => {
                  try {
                    localStorage.setItem(
                      'daftar_gaza_store',
                      JSON.stringify({ storeName, storeOwner, storeLocation })
                    );
                  } catch {}
                  setShowStoreSettingsModal(false);
                  triggerToast('تم تحديث وحفظ بيانات المحل بنجاح! 🏬');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 mt-2"
              >
                حفظ التعديلات
              </button>

              <div className="pt-3 border-t border-red-500/20 mt-1">
                <span className="text-[11px] font-bold text-red-400 block mb-1.5">إدارة السجلات وتصفير الدفتر:</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowStoreSettingsModal(false);
                    handleResetAllData();
                  }}
                  className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تصفير ومسح كافة الزبائن والديون (البدء بسجل جديد)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
