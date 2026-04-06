import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Calendar, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { format, parseISO, isSameWeek, isSameMonth, isSameYear, isWithinInterval } from 'date-fns';

export const Dashboard = () => {
  const { transactions, totals } = useFinance();
  const { isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState('expense');
  const [timeframe, setTimeframe] = useState('monthly');
  const [customStart, setCustomStart] = useState(() => {
     const d = new Date(); d.setMonth(d.getMonth() - 1); return format(d, 'yyyy-MM-dd');
  });
  const [customEnd, setCustomEnd] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== activeTab) return false;
      if (t.category === 'Uncategorized') return false;

      const d = parseISO(t.date);
      const now = new Date();

      if (timeframe === 'weekly') return isSameWeek(d, now, { weekStartsOn: 1 });
      if (timeframe === 'monthly') return isSameMonth(d, now);
      if (timeframe === 'yearly') return isSameYear(d, now);
      if (timeframe === 'custom' && customStart && customEnd) {
        try {
           const start = new Date(customStart);
           const end = new Date(customEnd);
           end.setHours(23, 59, 59, 999);
           return isWithinInterval(d, { start, end });
        } catch { return false; }
      }
      return false;
    }).sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [transactions, activeTab, timeframe, customStart, customEnd]);

  const timeframeTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      const d = parseISO(t.date);
      const now = new Date();
      let withinTimeframe = false;

      if (timeframe === 'weekly') withinTimeframe = isSameWeek(d, now, { weekStartsOn: 1 });
      else if (timeframe === 'monthly') withinTimeframe = isSameMonth(d, now);
      else if (timeframe === 'yearly') withinTimeframe = isSameYear(d, now);
      else if (timeframe === 'custom' && customStart && customEnd) {
        try {
           const start = new Date(customStart);
           const end = new Date(customEnd);
           end.setHours(23, 59, 59, 999);
           withinTimeframe = isWithinInterval(d, { start, end });
        } catch { withinTimeframe = false; }
      }

      if (withinTimeframe) {
         if (t.type === 'income') income += Number(t.amount);
         if (t.type === 'expense') expense += Number(t.amount);
      }
    });
    
    return { income, expense };
  }, [transactions, timeframe, customStart, customEnd]);

  const chartData = useMemo(() => {
    const dataMap = {};
    let totalValue = 0;

    filteredTransactions.forEach(t => {
      if (t.category === 'Uncategorized') return;

      const cat = t.category || 'Other';
      if (!dataMap[cat]) dataMap[cat] = 0;
      dataMap[cat] += Number(t.amount);
      totalValue += Number(t.amount);
    });

    return {
       totalValue,
       data: Object.entries(dataMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    };
  }, [filteredTransactions]);

  const EXPENSE_COLORS = ['#6d28d9', '#e11d48', '#eab308', '#2563eb', '#c026d3'];
  const INCOME_COLORS = ['#22c55e', '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7'];
  const COLORS = activeTab === 'expense' ? EXPENSE_COLORS : INCOME_COLORS;
  
  // Base theme colors matched identically to the user's screenshot layout requests
  const baseThemeText = activeTab === 'expense' ? 'text-[#f97316]' : 'text-emerald-500';
  const baseThemeBg = activeTab === 'expense' ? 'bg-[#f97316]' : 'bg-emerald-500';
  
  // Custom Render for Donut specific % constraints
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    if (percent * 100 < 1) return null; // Relaxed to show more category percentages
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
            <Wallet className="h-6 w-6 text-blue-500" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-500">Total Balance</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white truncate">₹{Math.abs(totals.balance).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-500">Total Income</p>
            <p className="text-2xl font-black text-emerald-500 truncate">+₹{timeframeTotals.income.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#f97316]/10 dark:bg-[#f97316]/10 flex items-center justify-center shrink-0">
            <TrendingDown className="h-6 w-6 text-[#f97316]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-500">Total Expense</p>
            <p className="text-2xl font-black text-[#f97316] truncate">-₹{timeframeTotals.expense.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
          </div>
        </div>
      </div>

      {/* Top Toggle Switch Layout matching specifically to the upper-left separated block layout */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl self-start w-fit shadow-sm">
        <button
          className={`px-8 py-2 text-[15px] font-bold rounded-lg transition-colors ${activeTab === 'expense' ? 'bg-[#f97316] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          onClick={() => setActiveTab('expense')}
        >
          Expenses
        </button>
        <button
           className={`px-8 py-2 text-[15px] font-bold rounded-lg transition-colors ${activeTab === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
           onClick={() => setActiveTab('income')}
        >
          Income
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: PIE CHART / OVERVIEW MODULE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex flex-col justify-start">
           
           <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-10 gap-4">
              <h2 className={`text-xl font-bold ${baseThemeText}`}>
                {activeTab === 'expense' ? 'Expenses Breakdown' : 'Income Breakdown'}
              </h2>
              
              <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                 <div className="flex items-center gap-3 w-full justify-between sm:justify-start">
                    <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus-within:ring-2 ring-indigo-500/20">
                       <Calendar className="h-4 w-4 text-slate-400" />
                       <select 
                         value={timeframe} 
                         onChange={(e) => setTimeframe(e.target.value)}
                         className="text-sm font-semibold text-slate-500 outline-none cursor-pointer bg-transparent"
                       >
                         <option value="weekly">Weekly</option>
                         <option value="monthly">Monthly</option>
                         <option value="yearly">Yearly</option>
                         <option value="custom">Custom</option>
                       </select>
                    </div>
                    
                    {isAdmin && (
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className={`h-9 px-4 flex items-center justify-center rounded-full text-white shadow-sm transition-transform active:scale-95 ${baseThemeBg} shrink-0`}
                      >
                        <Plus className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline text-sm font-bold">Add</span>
                      </button>
                    )}
                 </div>

                 {timeframe === 'custom' && (
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm mt-1 sm:mt-1.5 w-full sm:w-auto overflow-hidden">
                      <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="bg-transparent text-xs font-semibold outline-none text-slate-900 dark:text-white" />
                      <span className="text-slate-400 font-black shrink-0">-</span>
                      <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="bg-transparent text-xs font-semibold outline-none text-slate-900 dark:text-white" />
                    </div>
                 )}
              </div>
           </div>

           <div className="w-full relative min-h-[240px] flex items-center justify-center">
             {chartData.data.length > 0 ? (
               <ResponsiveContainer width="100%" height={240}>
                 {/* Converted cleanly to strict Donut formatting scaling specific innerRadius limits matching screenshot */}
                 <PieChart>
                   <Pie 
                     data={chartData.data} 
                     cx="50%" cy="50%" 
                     innerRadius={65} 
                     outerRadius={95} 
                     dataKey="value" 
                     stroke="white"
                     strokeWidth={3}
                     labelLine={false}
                     label={renderCustomizedLabel}
                   >
                     {chartData.data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                   </Pie>
                   <Legend verticalAlign="bottom" height={24} iconType="square" wrapperStyle={{fontSize: "12px", fontWeight: "600", color: "#64748b"}}/>
                 </PieChart>
               </ResponsiveContainer>
             ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium text-sm border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl m-4">
                  No records logged in this timeframe.
                </div>
             )}
           </div>

           <div className="mt-8">
              <hr className="border-slate-100 dark:border-slate-800 mb-4" />
              <div className="flex justify-between items-center">
                 <p className="text-sm font-semibold text-slate-400">
                    {activeTab === 'expense' ? 'Total Spent' : 'Total Earned'}
                 </p>
                 <p className={`text-[22px] font-black ${baseThemeText}`}>
                    ₹{chartData.totalValue.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                 </p>
              </div>
           </div>

        </div>

        {/* RIGHT COLUMN: RECENT TRANSACTIONS TRACKER */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden flex flex-col">
           <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className={`text-xl font-bold ${baseThemeText}`}>
                 Recent {activeTab === 'expense' ? 'Expenses' : 'Income'}
              </h2>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2">
             {filteredTransactions.length > 0 ? (
                <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {filteredTransactions.map((t) => (
                    <div key={t.id} className="flex justify-between items-center px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start gap-4">
                         <span className={`text-[26px] leading-[0.6] mt-1 ${baseThemeText}`}>•</span>
                         <div>
                            <p className="font-bold text-[15px] text-slate-700 dark:text-slate-200">{t.category}</p>
                            <p className="text-xs font-semibold text-slate-400 mt-1">{format(new Date(t.date), 'yyyy-MM-dd')}</p>
                         </div>
                      </div>
                      <div className={`font-black text-[15px] ${baseThemeText}`}>
                         {activeTab === 'expense' ? '-' : '+'}₹{Number(t.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="h-full min-h-[300px] flex items-center justify-center text-slate-400 text-sm font-medium">
                   No recent logs map specifically to this timeframe.
                </div>
             )}
           </div>
        </div>

      </div>

      {isAdmin && (
         <AddTransactionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            defaultType={activeTab} // Hard-locks the transaction modal natively mapping precisely to the parent Tab
         />
      )}
    </div>
  );
};
