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
    return language === 'KO' ? `₩${amount.toLocaleString('ko-KR')}` : `$${amount.toFixed(2)}`;
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
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-[#8b5cf6]/40 to-[#d946ef]/10 border border-[#8b5cf6]/20 p-6 shadow-lg backdrop-blur-md">
            <span className="text-sm font-medium text-purple-200">
              {language === 'KO' ? '오늘의 수익' : 'Today\'s Revenue'}
            </span>
            <span className="text-4xl font-bold text-white mt-2">{formatCurrency(todaySalesTotal)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveModal('FRAMES')} 
              className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-5 shadow-sm backdrop-blur-md text-left transition-transform active:scale-95"
            >
              <div className="flex items-center gap-2 mb-2">
                <Glasses className="h-5 w-5 text-indigo-400" />
                <span className="text-sm font-medium text-slate-400">
                  {language === 'KO' ? '판매된 안경테' : 'Frames Sold'}
                </span>
              </div>
              <span className="text-2xl font-bold text-indigo-400">{todayFramesSold}</span>
            </button>
            <button 
              onClick={() => setActiveModal('LENSES')}
              className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-5 shadow-sm backdrop-blur-md text-left transition-transform active:scale-95"
            >
              <div className="flex items-center gap-2 mb-2">
                <CircleDashed className="h-5 w-5 text-[#8b5cf6]" />
                <span className="text-sm font-medium text-slate-400">
                  {language === 'KO' ? '판매된 렌즈' : 'Lenses Sold'}
                </span>
              </div>
              <span className="text-2xl font-bold text-[#8b5cf6]">{todayLensesSold}</span>
            </button>
          </div>
        </div>

        {/* Daily Sales Trend */}
        <div className="flex flex-col rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">
            {language === 'KO' ? '7일 판매 추이' : '7-Day Sales Trend'}
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => language === 'KO' ? `₩${val/1000}k` : `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) => [formatCurrency(value), language === 'KO' ? '수익' : 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Brand */}
        <div className="flex flex-col rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">
            {language === 'KO' ? '브랜드별 수익' : 'Revenue by Brand'}
          </h3>
          <div className="h-[250px] w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                    data={salesByBrand}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {salesByBrand.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number) => [formatCurrency(value), language === 'KO' ? '수익' : 'Revenue']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
               </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Health */}
        <div className="flex flex-col rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">
            {language === 'KO' ? '브랜드별 현재 재고' : 'Current Inventory by Brand'}
          </h3>
          <div className="flex flex-col gap-5 w-full">
            {inventoryByBrand.map((item) => (
              <div key={item.name} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-slate-200">{item.name}</span>
                  <span className="text-sm font-medium text-slate-400">{item.stock.toLocaleString()}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Drill-down Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[80vh] flex flex-col bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                {activeModal === 'FRAMES' 
                  ? (language === 'KO' ? '오늘 판매된 안경테' : 'Frames Sold Today') 
                  : (language === 'KO' ? '오늘 판매된 렌즈' : 'Lenses Sold Today')}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="flex items-center justify-center p-2 rounded-full bg-white/10 text-white active:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {modalItems.length > 0 ? (
                modalItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-xs text-slate-400 mt-1">{item.time}</span>
                    </div>
                    <span className="font-bold text-white text-lg">{formatCurrency(item.price)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <p>{language === 'KO' ? '오늘 아직 판매된 항목이 없습니다.' : 'No items sold yet today.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}