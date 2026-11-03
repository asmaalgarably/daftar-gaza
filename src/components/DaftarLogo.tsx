import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function DaftarLogo({ className = '', size = 36, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-End Fintech Emblem with Radial Gradient & Border */}
      <div
        className="relative shrink-0 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-2 shadow-lg shadow-emerald-500/20 border border-emerald-400/30 flex items-center justify-center overflow-hidden transition-transform hover:scale-105"
        style={{ width: size, height: size }}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-emerald-400/20 blur-sm pointer-events-none" />

        {/* Clean Geometric Vector Mark: Stylized Bilateral Ledger Pages & Scales */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 text-white"
        >
          {/* Main Book/Ledger Base */}
          <path
            d="M6 7C6 5.89543 6.89543 5 8 5H24C25.1046 5 26 5.89543 26 7V25C26 26.1046 25.1046 27 24 27H8C6.89543 27 6 26.1046 6 25V7Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          {/* Central Ledger Spine */}
          <path
            d="M16 5V27"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="1.5 2.5"
          />
          {/* Credit Inflow Arrow (Green / Up-Right) */}
          <path
            d="M10 13L13 10M13 10H10.5M13 10V12.5"
            stroke="#34D399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Settlement / Outflow Arrow (Gold / Down-Left) */}
          <path
            d="M22 19L19 22M19 22H21.5M19 22V19.5"
            stroke="#FBBF24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Ledger Account Lines */}
          <path
            d="M19 11H23M9 21H13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-tight text-white dark:text-white leading-none">
              دَفْتَر
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              POS
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
            دفتر ديون وسداد الزبائن
          </span>
        </div>
      )}
    </div>
  );
}
