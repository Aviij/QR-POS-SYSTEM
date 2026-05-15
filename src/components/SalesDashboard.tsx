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
    <div className="flex h-full w-full flex-col bg-transparent text-white relative z-[1] pb-[120px]">
      {/* Header Slot */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-transparent">
        <h2 className="text-2xl font-bold tracking-tight">Current Order</h2>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-400">{totalItems} Items</span>
        </div>
      </div>

      {/* Scrollable Body Slot */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-2">
        {cart.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {cart.map((item) => (
              <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl bg-white/5 border border-white/10 p-5 gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md">
                <div className="flex flex-col">
                  <span className="font-semibold text-lg text-slate-100">{item.name}</span>
                  <span className="text-slate-400">${item.price.toFixed(2)} each</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 p-1 border border-white/10 backdrop-blur-md">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="flex h-10 w-10 items-center justify-center text-white active:bg-white/20 rounded-xl transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex h-10 w-10 items-center justify-center text-white active:bg-white/20 rounded-xl transition-colors"
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
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-md p-4 sm:p-6 shrink-0 z-10 w-full relative">
        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
          <div className="flex justify-between items-end mb-1">
            <span className="text-lg text-slate-400">Grand Total</span>
            <span className="text-3xl font-bold text-green-400">${grandTotal.toFixed(2)}</span>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={onMarkAsPaid}
            className="flex h-[60px] min-h-[44px] w-full items-center justify-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-3xl text-white font-semibold tracking-wide disabled:opacity-50 transition-colors active:scale-95"
          >
            <CreditCard className="h-6 w-6" />
            Mark as Paid (Manual Cash/Card)
          </button>
        </div>
      </div>
    </div>
  );
}
