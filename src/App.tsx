/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import SalesDashboard from './components/SalesDashboard';
import ScannerModal from './components/ScannerModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { CartItem, Product, Transaction } from './types';
import { seedMockDatabase } from './utils/seeder';
import { v4 as uuidv4 } from 'uuid';
import { Camera } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'POS' | 'DASHBOARD'>('POS');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [completedSales, setCompletedSales] = useState<Transaction[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Run seeder once on mount
  useEffect(() => {
    const data = seedMockDatabase();
    setInventory(data.inventory);
    setCompletedSales(data.completedSales);
  }, []);

  const handleScanSuccess = (decodedText: string): boolean => {
    const product = inventory.find(p => p.qrCode === decodedText);
    
    if (product) {
      if (navigator.vibrate) navigator.vibrate(200);
      
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return [...prevCart, { ...product, quantity: 1 }];
        }
      });
      setIsScannerOpen(false);
      return true;
    } else {
      setToastMessage(`QR Code [${decodedText}] not found in Inventory!`);
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        }
      } catch (e) {}
      setTimeout(() => setToastMessage(null), 3000);
      return false;
    }
  };

  const handleMarkAsPaid = () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create new transaction
    const transaction: Transaction = {
      id: uuidv4(),
      date: new Date().toISOString(),
      items: cart,
      total,
    };

    // Update completed sales
    setCompletedSales(prev => [...prev, transaction]);

    // Update inventory quantity based on purchased items
    setInventory(prev => prev.map(invItem => {
      const cartItem = cart.find(ci => ci.id === invItem.id);
      if (cartItem) {
         return { ...invItem, stock: Math.max(0, invItem.stock - cartItem.quantity) };
      }
      return invItem;
    }));

    // Clear cart and show toast
    setCart([]);
    setToastMessage('Payment Successful!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-br from-black via-[#0a0514] to-black text-white">
      {/* Top Navbar */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-transparent shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-white">Sungmo Eyeware</h1>
        
        {/* iOS Segmented Control */}
        <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10">
          <button 
            onClick={() => setActiveTab('POS')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'POS' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            POS
          </button>
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'DASHBOARD' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden"> 
        {activeTab === 'POS' ? (
          <SalesDashboard 
            cart={cart}
            onCartUpdate={setCart}
            onOpenScanner={() => setIsScannerOpen(true)} 
            onMarkAsPaid={handleMarkAsPaid}
          />
        ) : (
          <AnalyticsDashboard 
            inventory={inventory} 
            completedSales={completedSales} 
          />
        )}
      </div>

      {isScannerOpen && (
        <ScannerModal 
          onClose={() => setIsScannerOpen(false)} 
          onScanSuccess={handleScanSuccess} 
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`absolute top-8 left-1/2 -translate-x-1/2 z-[200] rounded-full px-6 py-3 shadow-lg ${toastMessage === 'Payment Successful!' ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
          <p className="text-white font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Fixed Bottom Scan Area */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-5 pb-safe">
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="flex h-[72px] w-full items-center justify-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-3xl text-white text-xl font-bold tracking-wide transition-transform active:scale-95"
        >
          <Camera className="h-7 w-7 text-white" />
          <span>Scan Item</span>
        </button>
      </div>
    </div>
  );
}
