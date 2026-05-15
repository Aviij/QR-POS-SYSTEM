import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

interface ScannerModalProps {
  onClose: () => void;
  onScanSuccess: (decodedText: string) => boolean;
}

export default function ScannerModal({ onClose, onScanSuccess }: ScannerModalProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    let isScanning = false;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { 
            facingMode: "environment"
          },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isScanning) return; 
            isScanning = true;
            html5QrCode.pause(); 
            
            const success = onScanSuccess(decodedText);
            if (!success) {
              // Give user a brief moment to see the error toast, then resume scanning.
              setTimeout(() => {
                if (html5QrCode.getState() === 2) { // 2 = PAUSED state in html5-qrcode
                  html5QrCode.resume();
                  isScanning = false;
                }
              }, 1500);
            }
          },
          () => {
            // standard scan failures ignored
          }
        );
      } catch (err) {
        console.error("Scanner Error:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError("Failed to start scanner: " + errorMessage);
        alert("Camera Error: " + errorMessage);
      }
    };

    startScanner();

    return () => {
      // Must stop and clear to release the camera immediately
      try {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().then(() => {
            html5QrCode.clear();
          }).catch(console.error);
        } else {
            // If it was paused, we still need to clear
            html5QrCode.clear();
        }
      } catch (e) {
          console.error("Error during cleanup", e);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col bg-black h-[100dvh]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-end p-6">
        <button 
          onClick={onClose} 
          className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md active:bg-white/40"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Video area */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-white z-20">
            <p className="mb-2 text-xl font-semibold text-red-500">Camera Error</p>
            <p className="text-gray-300">{error}</p>
          </div>
        ) : (
          <>
            <div 
              id="qr-reader" 
              className="absolute inset-0 w-full h-full [&>video]:!h-full [&>video]:!w-full [&>video]:!object-cover [&>canvas]:hidden"
            />
            {/* Targeting Square Overlay */}
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
              <div className="pointer-events-none relative h-[250px] w-[250px] shadow-[0_0_0_4000px_rgba(0,0,0,0.6)] rounded-2xl">
                <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl -translate-x-[2px] -translate-y-[2px]"></div>
                <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl translate-x-[2px] -translate-y-[2px]"></div>
                <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl -translate-x-[2px] translate-y-[2px]"></div>
                <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-green-400 rounded-br-xl translate-x-[2px] translate-y-[2px]"></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
