'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CameraQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export function CameraQRScanner({ isOpen, onClose, onScanSuccess }: CameraQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedResult(null);
      setErrorMsg(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setErrorMsg('المتصفح لا يدعم الوصول المباشر لكاميرا الجهاز');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setIsScanning(true);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setHasCamera(false);
      setErrorMsg('تعذر فتح الكاميرا (يرجى منح إذن الكاميرا للموقع)');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  // Continuous frame scanner using BarcodeDetector API if available
  useEffect(() => {
    if (!isScanning || !videoRef.current) return;

    let active = true;
    let barcodeDetector: any = null;

    if ('BarcodeDetector' in window) {
      try {
        // @ts-ignore
        barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch (e) {
        console.warn('BarcodeDetector error:', e);
      }
    }

    const interval = setInterval(async () => {
      if (!active || !videoRef.current || videoRef.current.readyState < 2) return;

      if (barcodeDetector) {
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            if (rawValue) {
              active = false;
              setScannedResult(rawValue);
              onScanSuccess(rawValue);
              stopCamera();
            }
          }
        } catch (e) {
          // ignore detection error frame
        }
      }
    }, 400);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isScanning, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 flex flex-col items-center gap-4 shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">ماسح رمز السند الرقمي</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Viewfinder */}
        <div className="relative w-full aspect-square rounded-2xl bg-black overflow-hidden border-2 border-emerald-500/40 flex items-center justify-center">
          {hasCamera ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning Target Overlay */}
              <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-2xl pointer-events-none flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {/* Laser animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center p-4 text-center gap-2">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-xs text-slate-300">{errorMsg || 'الكاميرا غير متوفرة'}</p>
            </div>
          )}

          {scannedResult && (
            <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center gap-2 text-center p-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              <p className="font-bold text-sm text-white">تم مسح السند بنجاح!</p>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          وجّه كاميرا الهاتف نحو رمز الـ QR المطبوع على إيصال الزبون للتحقق الفوري من صحته.
        </p>

        {/* Action Controls */}
        <div className="flex w-full gap-2">
          {hasCamera && (
            <button
              onClick={startCamera}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 font-bold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              إعادة تشغيل الكاميرا
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
