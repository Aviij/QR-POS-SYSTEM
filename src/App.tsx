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
import { ShoppingCart, BarChart3 } from 'lucide-react';

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
      setToastMessage('Unknown Product Code');
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
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-slate-950">
      <div className="flex-1 overflow-hidden pb-[80px]"> 
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

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[80px] w-full items-center justify-around border-t border-white/10 bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60 pb-safe">
        <button 
          onClick={() => setActiveTab('POS')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeTab === 'POS' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="text-xs font-semibold">POS</span>
        </button>
        <button 
          onClick={() => setActiveTab('DASHBOARD')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeTab === 'DASHBOARD' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <BarChart3 className="h-6 w-6" />
          <span className="text-xs font-semibold">Dashboard</span>
        </button>
      </div>
    </div>
  );
}
