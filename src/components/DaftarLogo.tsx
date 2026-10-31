import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function DaftarLogo({ className = '', size = 38, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20"
        style={{ width: size, height: size }}
      >
        <span className="font-black font-serif text-xl select-none">د</span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-slate-900 tracking-tight">دَفْتَر</span>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              حسابات المحل
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium -mt-0.5">
            دفتر ديون وسداد الزبائن
          </span>
        </div>
      )}
    </div>
  );
}
