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
          { facingMode: "environment" },
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
        setError("Failed to start scanner. Please ensure camera permissions are granted in settings.");
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-end p-6">
        <button 
          onClick={onClose} 
          className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md active:bg-white/40"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Video area */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        {error ? (
          <div className="p-6 text-center text-white">
            <p className="mb-2 text-xl font-semibold text-red-500">Camera Error</p>
            <p className="text-gray-300">{error}</p>
          </div>
        ) : (
          <div 
            id="qr-reader" 
            className="w-full h-full [&>video]:object-cover"
          />
        )}
      </div>
    </div>
  );
}
