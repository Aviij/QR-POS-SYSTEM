import React, { useMemo } from 'react';
import { Product, Transaction } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';

interface AnalyticsDashboardProps {
  inventory: Product[];
  completedSales: Transaction[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6'];

export default function AnalyticsDashboard({ inventory, completedSales }: AnalyticsDashboardProps) {

  // Process KPIs
  const { todaySalesTotal, todayItemsSold, dailySalesTrend, salesByBrand, inventoryByBrand } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    let todayTotal = 0;
    let todayItems = 0;
    
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
        sale.items.forEach(item => todayItems += item.quantity);
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
    inventory.forEach(item => {
      if (!invByBrand[item.brand]) invByBrand[item.brand] = 0;
      invByBrand[item.brand] += item.stock;
    });

    const barData = Object.keys(invByBrand).map(brand => ({
      name: brand,
      stock: invByBrand[brand]
    })).sort((a, b) => b.stock - a.stock);

    return { 
      todaySalesTotal: todayTotal, 
      todayItemsSold: todayItems,
      dailySalesTrend: trendData,
      salesByBrand: pieData,
      inventoryByBrand: barData
    };
  }, [inventory, completedSales]);

  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-white overflow-y-auto pb-24">
      {/* Header Slot */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900 sticky top-0 z-10">
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
      </div>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-5 shadow-sm backdrop-blur-md">
            <span className="text-sm font-medium text-slate-400">Today's Sales</span>
            <span className="text-2xl font-bold text-green-400 mt-1">${todaySalesTotal.toFixed(2)}</span>
          </div>
          <div className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-5 shadow-sm backdrop-blur-md">
            <span className="text-sm font-medium text-slate-400">Items Sold Today</span>
            <span className="text-2xl font-bold text-blue-400 mt-1">{todayItemsSold}</span>
          </div>
        </div>

        {/* Daily Sales Trend */}
        <div className="flex flex-col rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">7-Day Sales Trend</h3>
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
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Brand */}
        <div className="flex flex-col rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Revenue by Brand</h3>
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
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
               </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Health */}
        <div className="flex flex-col rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Current Inventory by Brand</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryByBrand} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
