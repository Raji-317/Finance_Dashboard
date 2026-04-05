import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';
import { parseISO, format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

export const Charts = () => {
  const { transactions } = useFinance();
  const [chartView, setChartView] = useState('general');
  const [timeframe, setTimeframe] = useState('monthly');
  
  // Custom month pickers for bounds
  const [startMonthStr, setStartMonthStr] = useState(() => {
     // Default July of last year
     const d = new Date();
     d.setFullYear(d.getFullYear() - 1);
     d.setMonth(6); // July represents 6 explicitly
     return format(d, 'yyyy-MM');
  });
  const [endMonthStr, setEndMonthStr] = useState(() => format(new Date(), 'yyyy-MM'));

  // Calculate strict date bounds mapped cleanly to timeframe configurations
  const filteredTransactions = useMemo(() => {
     return transactions.filter(t => {
        // Mode filtering
        if (chartView !== 'general' && t.type !== chartView) return false;

        const d = parseISO(t.date);
        
        // Timeframe bounds
        if (timeframe === 'yearly') return true; // Show all history by default for years
        
        // For monthly and custom, we rely on the specific startMonth and endMonth bounds mapping July last yr by default
        try {
           const start = startOfMonth(new Date(`${startMonthStr}-01T00:00:00`));
           const end = endOfMonth(new Date(`${endMonthStr}-01T00:00:00`));
           return isWithinInterval(d, { start, end });
        } catch { return true; }
        
     });
  }, [transactions, chartView, timeframe, startMonthStr, endMonthStr]);

  const processedData = useMemo(() => {
    const dataMap = {};
    
    filteredTransactions.forEach(t => {
       const tDate = parseISO(t.date);
       // Distinguish key processing strictly based on timeframe (Monthly vs Yearly)
       const key = timeframe === 'yearly' ? format(tDate, 'yyyy') : format(tDate, 'MMM yy'); 
       
       if (!dataMap[key]) {
         dataMap[key] = { 
            name: key, 
            income: 0, 
            expense: 0, 
            numericDate: timeframe === 'yearly' ? tDate.getFullYear() : new Date(tDate.getFullYear(), tDate.getMonth(), 1).getTime() 
         };
       }
       
       if (t.type === 'income') dataMap[key].income += Number(t.amount);
       if (t.type === 'expense') dataMap[key].expense += Number(t.amount);
    });

    return Object.values(dataMap).sort((a,b) => a.numericDate - b.numericDate).map(item => ({
       name: item.name, income: item.income, expense: item.expense
    }));
  }, [filteredTransactions, timeframe]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow-md border border-slate-100 text-sm font-semibold text-slate-700">
          <p className="mb-2 text-slate-500">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="flex justify-between gap-6">
              <span className="capitalize">{entry.name}</span>
              <span>₹{entry.value.toLocaleString('en-IN')}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         
         <div className="flex rounded-md border border-slate-200 overflow-hidden bg-white shadow-sm">
            <button
               onClick={() => setChartView('general')}
               className={`px-6 py-2 text-sm font-semibold transition-colors ${chartView === 'general' ? 'bg-[#3b82f6] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               General
            </button>
            <button
               onClick={() => setChartView('expense')}
               className={`px-6 py-2 text-sm font-semibold border-l border-slate-200 transition-colors ${chartView === 'expense' ? 'bg-[#3b82f6] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               Expense
            </button>
            <button
               onClick={() => setChartView('income')}
               className={`px-6 py-2 text-sm font-semibold border-l border-slate-200 transition-colors ${chartView === 'income' ? 'bg-[#3b82f6] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               Income
            </button>
         </div>

         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
             {/* Dropdown Options mapping directly to UI requirements */}
             <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm text-sm focus-within:ring-2 ring-blue-500/20">
                <Calendar className="h-4 w-4 text-slate-400" />
                <select 
                   value={timeframe} 
                   onChange={(e) => setTimeframe(e.target.value)}
                   className="font-semibold text-slate-500 outline-none cursor-pointer bg-transparent"
                >
                   <option value="monthly">Monthly</option>
                   <option value="yearly">Yearly</option>
                   <option value="custom">Custom Bounds</option>
                </select>
             </div>

             {/* Dynamic Month Pickers strictly matching explicitly from/to layout bounds requested globally on custom */}
             {timeframe === 'custom' && (
                <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-md px-3 py-1 shadow-sm overflow-hidden text-sm">
                   <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2">
                     <span className="text-xs font-bold text-slate-400">FROM</span>
                     <input 
                       type="month" 
                       value={startMonthStr} 
                       onChange={(e) => setStartMonthStr(e.target.value)} 
                       className="bg-transparent font-semibold outline-none text-slate-600 focus:text-blue-600 transition-colors"
                     />
                   </div>
                   <div className="flex items-center gap-1.5 pl-1">
                     <span className="text-xs font-bold text-slate-400">TO</span>
                     <input 
                       type="month" 
                       value={endMonthStr} 
                       onChange={(e) => setEndMonthStr(e.target.value)} 
                       className="bg-transparent font-semibold outline-none text-slate-600 focus:text-blue-600 transition-colors"
                     />
                   </div>
                </div>
             )}
         </div>

      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200 p-6 h-[500px] flex flex-col">
         
         <div className="mb-6 flex justify-between items-center">
             <h3 className="font-bold text-slate-700 text-[16px]">
               {chartView === 'general' ? 'Historical Timeline mapping' : `Timeline mapped ${chartView === 'expense' ? 'Expenses' : 'Incomes'}`}
             </h3>
         </div>
         
         <div className="flex-1 w-full relative">
            {processedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={processedData} margin={{ top: 20, right: 0, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6}/>
                  
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} 
                    dy={12} 
                  />
                  
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} 
                    tickFormatter={(val) => val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`} 
                    dx={-10}
                    width={60}
                  />
                  
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                  <Legend 
                     verticalAlign="bottom" 
                     height={20}
                     wrapperStyle={{ bottom: -10 }}
                     iconType="square"
                     formatter={(value) => <span style={{ color: '#475569', fontSize: 13, fontWeight: 500, marginLeft: 4, textTransform: 'capitalize'}}>{value}</span>}
                  />

                  {(chartView === 'general' || chartView === 'income') && (
                     <Bar dataKey="income" name="Income" fill="#22c55e" maxBarSize={60} radius={0} />
                  )}
                  {(chartView === 'general' || chartView === 'expense') && (
                     <Bar dataKey="expense" name="Expenses" fill="#df5c49" maxBarSize={60} radius={0} />
                  )}

               </BarChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                No activity mapped spanning these parameters.
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
