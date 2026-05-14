import React from 'react';
import { CartItem } from '../types';
import { Camera, Plus, Minus, CreditCard } from 'lucide-react';

interface SalesDashboardProps {
  cart: CartItem[];
  onCartUpdate: (newCart: CartItem[]) => void;
  onOpenScanner: () => void;
  onMarkAsPaid: () => void;
}

export default function SalesDashboard({ cart, onCartUpdate, onOpenScanner, onMarkAsPaid }: SalesDashboardProps) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const updateQuantity = (id: string, delta: number) => {
    onCartUpdate(cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-white relative">
      {/* Header Slot */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900">
        <h2 className="text-2xl font-bold tracking-tight">Current Order</h2>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-400">{totalItems} Items</span>
        </div>
      </div>

      {/* Scrollable Body Slot */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {cart.length > 0 ? (
          <ul className="flex flex-col gap-4 pb-24">
            {cart.map((item) => (
              <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-slate-900 border border-slate-800 p-5 gap-4 shadow-sm">
                <div className="flex flex-col">
                  <span className="font-semibold text-lg text-slate-100">{item.name}</span>
                  <span className="text-slate-400">${item.price.toFixed(2)} each</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 p-1 border border-slate-800">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="flex h-10 w-10 items-center justify-center text-slate-300 active:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-slate-100">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex h-10 w-10 items-center justify-center text-slate-300 active:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="w-20 text-right font-bold text-slate-100 text-lg">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-slate-400 text-lg">Your cart is empty.</p>
          </div>
        )}
      </div>

      {/* Footer Slot */}
      <div className="border-t border-white/10 bg-slate-900 p-6 pb-24">
        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
          <div className="flex justify-between items-end mb-2">
            <span className="text-lg text-slate-400">Grand Total</span>
            <span className="text-3xl font-bold text-green-400">${grandTotal.toFixed(2)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={onMarkAsPaid}
            className="flex h-[60px] min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-green-500 text-lg font-bold text-black active:bg-green-600 disabled:opacity-50 disabled:active:bg-green-500 transition-colors shadow-lg shadow-green-500/20"
          >
            <CreditCard className="h-6 w-6" />
            Mark as Paid (Manual Cash/Card)
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={onOpenScanner}
        className="absolute bottom-36 right-6 flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-4 shadow-xl shadow-blue-900/30 active:bg-blue-700 transition-transform active:scale-95"
      >
        <Camera className="h-6 w-6 text-white" />
        <span className="font-bold text-white text-lg">Scan Item</span>
      </button>
    </div>
  );
}
