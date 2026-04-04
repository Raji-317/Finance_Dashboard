import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { format, parseISO, isSameMonth, isSameYear, isSameDay, isSameWeek, isWithinInterval } from 'date-fns';

export const Savings = () => {
  const { transactions } = useFinance();
  const [period, setPeriod] = useState('month'); // month, year, day, week, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const now = new Date();

  // Filter transactions based on period dynamically compounding inherently
  const filtered = transactions.filter(t => {
    const d = parseISO(t.date);
    if (period === 'month') return isSameMonth(d, now);
    if (period === 'year') return isSameYear(d, now);
    if (period === 'day') return isSameDay(d, now);
    if (period === 'week') return isSameWeek(d, now, { weekStartsOn: 1 }); // Start week on Monday
    if (period === 'custom' && customStart && customEnd) {
      return isWithinInterval(d, { start: new Date(customStart), end: new Date(customEnd) });
    }
    return true; // fallback
  });

  const income = filtered.reduce((acc, t) => t.type === 'income' ? acc + Number(t.amount) : acc, 0);
  const expense = filtered.reduce((acc, t) => t.type === 'expense' ? acc + Number(t.amount) : acc, 0);
  const savings = income - expense;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Savings History</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {['month', 'year', 'week', 'day', 'custom'].map(btn => (
          <button
            key={btn}
            onClick={() => setPeriod(btn)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${period === btn ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
          >
            This {btn}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="flex gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg">
          <div className="flex-1">
            <label className="text-xs text-slate-500 block mb-1">Start Date</label>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded p-2 text-sm outline-none dark:text-white"/>
          </div>
          <span className="text-slate-400 mt-4">-</span>
          <div className="flex-1">
            <label className="text-xs text-slate-500 block mb-1">End Date</label>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded p-2 text-sm outline-none dark:text-white"/>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center text-center min-h-[400px]">
         <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
           Period Savings
         </h3>
         <div className={`mt-4 text-7xl font-bold tracking-tight ${savings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ₹{savings.toLocaleString('en-IN', {minimumFractionDigits: 2})}
         </div>

         <div className="mt-12 flex gap-12 text-left bg-slate-50 dark:bg-slate-800 px-8 py-4 rounded-2xl border border-slate-100 dark:border-slate-700">
           <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Income Logged</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">₹{income.toLocaleString('en-IN')}</p>
           </div>
           <div className="border-l border-slate-200 dark:border-slate-700"></div>
           <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Expense Logged</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">₹{expense.toLocaleString('en-IN')}</p>
           </div>
         </div>
      </div>
    </div>
  );
};
