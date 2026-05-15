import React, { useMemo, useState } from 'react';
import { Product, Transaction } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Glasses, CircleDashed, X } from 'lucide-react';
import { Language } from '../App';

interface AnalyticsDashboardProps {
  inventory: Product[];
  completedSales: Transaction[];
  language: Language;
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#3b82f6', '#0ea5e9', '#64748b'];

export default function AnalyticsDashboard({ inventory, completedSales, language }: AnalyticsDashboardProps) {
  const [activeModal, setActiveModal] = useState<'FRAMES' | 'LENSES' | null>(null);

  // Process KPIs
  const { todaySalesTotal, todayFramesSold, todayLensesSold, todaySalesItems, dailySalesTrend, salesByBrand, inventoryByBrand } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    let todayTotal = 0;
    let framesSold = 0;
    let lensesSold = 0;
    const salesItems: { id: string; name: string; time: string; price: number; category: string }[] = [];
    
    // For last 7 days trend
    const last7Days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      last7Days[d.toISOString().split('T')[0]] = 0;
    }

    // Brand sales tracking
    const brandSales: Record<string, number> = {};

    completedSales.forEach(sale => {
      const saleDateStr = sale.date.split('T')[0];
      
      // Keep track of today
      if (saleDateStr === todayStr) {
        todayTotal += sale.total;
        const timeStr = new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        sale.items.forEach(item => {
          if (item.category === 'FRAME') framesSold += item.quantity;
          if (item.category === 'LENS') lensesSold += item.quantity;
          
          for(let i=0; i<item.quantity; i++) {
             salesItems.push({
                id: `${sale.id}-${item.id}-${i}`,
                name: item.name,
                time: timeStr,
                price: item.price,
                category: item.category
             });
          }
        });
      }
      
      // Update 7-day trend if in range
      if (last7Days[saleDateStr] !== undefined) {
        last7Days[saleDateStr] += sale.total;
      }
      
      // Group by brand
      sale.items.forEach(item => {
        if (!brandSales[item.brand]) brandSales[item.brand] = 0;
        brandSales[item.brand] += (item.price * item.quantity);
      });
    });

    const trendData = Object.keys(last7Days).map(dateStr => {
      // Just take Month/Day format
      const [_, m, d] = dateStr.split('-');
      return {
        date: `${m}/${d}`,
        revenue: last7Days[dateStr]
      };
    });

    const pieData = Object.keys(brandSales).map(brand => ({
      name: brand,
      value: brandSales[brand]
    })).sort((a, b) => b.value - a.value);

    // Current Inventory Health
    const invByBrand: Record<string, number> = {};
    let maxStock = 0;
    inventory.forEach(item => {
      if (!invByBrand[item.brand]) invByBrand[item.brand] = 0;
      invByBrand[item.brand] += item.stock;
    });

    Object.values(invByBrand).forEach(stock => {
      if (stock > maxStock) maxStock = stock;
    });

    const barData = Object.keys(invByBrand).map(brand => ({
      name: brand,
      stock: invByBrand[brand],
      percentage: maxStock > 0 ? (invByBrand[brand] / maxStock) * 100 : 0
    })).sort((a, b) => b.stock - a.stock);

    return { 
      todaySalesTotal: todayTotal, 
      todayFramesSold: framesSold,
      todayLensesSold: lensesSold,
      todaySalesItems: salesItems,
      dailySalesTrend: trendData,
      salesByBrand: pieData,
      inventoryByBrand: barData
    };
  }, [inventory, completedSales]);

  // Filter items for modal
  const modalItems = useMemo(() => {
    if (!activeModal) return [];
    return todaySalesItems.filter(item => 
      (activeModal === 'FRAMES' && item.category === 'FRAME') ||
      (activeModal === 'LENSES' && item.category === 'LENS')
    );
  }, [activeModal, todaySalesItems]);

  const formatCurrency = (amount: number) => {
    return language === 'KO' ? `₩${amount.toLocaleString('ko-KR')}` : `${amount.toFixed(2)}`;
  };

  return (
    <div className="flex h-full w-full flex-col bg-transparent text-white overflow-y-auto pb-[120px] z-[1]">
      {/* Header Slot */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-transparent sticky top-0 z-10 backdrop-blur-xl">
        <h2 className="text-2xl font-bold tracking-tight">
          {language === 'KO' ? '분석 대시보드' : 'Analytics Dashboard'}
        </h2>
      </div>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        
        {/* KPI Cards: Today Snapshot */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-[#8b5cf6]/40 (Wait, I should use the standard gradient, but changed color to purple) let's adjust it slightly">
            (Ah, I'll modify this locally)

