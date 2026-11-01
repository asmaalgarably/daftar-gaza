import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function DaftarLogo({ className = '', size = 38, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Modern Fintech Bilateral Ledger Mark (Not a generic notebook) */}
      <div
        className="relative shrink-0 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 p-1.5 shadow-lg border border-emerald-500/30 flex items-center justify-center group overflow-hidden"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 bg-emerald-500/10 blur-sm pointer-events-none" />
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          {/* Subtle grid base */}
          <rect x="4" y="4" width="32" height="32" rx="8" fill="url(#ledgerGrad)" />
          
          {/* Bilateral account balance bars / dynamic ledger arrows */}
          <path
            d="M12 24L18 18M18 18H13M18 18V23"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M28 16L22 22M22 22H27M22 22V17"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Core transaction nexus */}
          <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" />

          <defs>
            <linearGradient id="ledgerGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#064E3B" stopOpacity="0.85" />
              <stop offset="1" stopColor="#0F172A" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-white dark:text-white select-none">
            دَفْتَر
          </span>
        </div>
      )}
    </div>
  );
}
