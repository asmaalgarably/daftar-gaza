'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface RealQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function RealQRCode({ value, size = 220, className = '' }: RealQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1.5,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        },
        (error) => {
          if (error) console.error('QR Code render error:', error);
        }
      );
    }
  }, [value, size]);

  return (
    <div className={`p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
