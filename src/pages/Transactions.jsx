import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Trash2, Edit2, ArrowDownRight, ArrowUpRight, Search, Filter, Calendar } from 'lucide-react';
import { AddTransactionModal } from '../components/AddTransactionModal';

export const Transactions = () => {
  const { transactions, deleteTransaction } = useFinance();
  const { isAdmin } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const filteredAndSorted = transactions
    .filter(t => !t.isVirtual)
    .filter(t => t.category !== 'Uncategorized')
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => (t.category || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.note || '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(t => {
       if (!fromDate && !toDate) return true;
       const tDate = new Date(t.date).getTime();
       const from = fromDate ? new Date(fromDate).getTime() : -Infinity;
       const to = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : Infinity;
       return tDate >= from && tDate <= to;
    })
    .sort((a, b) => {
      if (sortOrder === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOrder === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOrder === 'amount-desc') return Math.abs(Number(b.amount)) - Math.abs(Number(a.amount));
      if (sortOrder === 'amount-asc') return Math.abs(Number(a.amount)) - Math.abs(Number(b.amount));
      return 0;
    });

  const handleEditClick = (t) => {
    setEditingData(t);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Transactions</h2>
        
        {/* Controls */}
        <div className="flex flex-col xl:flex-row flex-wrap items-start xl:items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full xl:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search category or note..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap w-full xl:w-auto gap-3">
             <div className="relative flex-1 sm:flex-none">
               <button 
                 onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                 className={`w-full flex items-center justify-center gap-2 border rounded-xl px-4 py-2 text-sm font-medium transition-colors ${fromDate || toDate ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' : 'bg-white text-slate-600 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-slate-300'}`}
               >
                 <Calendar className="h-4 w-4 shrink-0"/>
                 <span className="truncate">Date</span>
                 {(fromDate || toDate) && <div className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></div>}
               </button>

               {isDateFilterOpen && (
                 <div className="absolute top-full mt-2 right-0 sm:right-auto sm:left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-50">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">From</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm outline-none dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">To</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm outline-none dark:text-white" />
                      </div>
                      <div className="flex justify-between pt-2">
                         <button onClick={() => { setFromDate(''); setToDate(''); }} className="text-xs text-slate-400 hover:text-slate-600 font-medium">Clear</button>
                         <button onClick={() => setIsDateFilterOpen(false)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium">Apply</button>
                      </div>
                    </div>
                 </div>
               )}
             </div>
             
             <div className="flex w-full sm:w-auto gap-3">
               <select 
                 value={filterType}
                 onChange={(e) => setFilterType(e.target.value)}
                 className="flex-1 sm:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-medium outline-none cursor-pointer dark:text-white shrink-0"
               >
                 <option value="all">All Types</option>
                 <option value="income">Income</option>
                 <option value="expense">Expense</option>
               </select>
               
               <select 
                 value={sortOrder}
                 onChange={(e) => setSortOrder(e.target.value)}
                 className="flex-1 sm:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-medium outline-none cursor-pointer dark:text-white shrink-0"
               >
                 <option value="date-desc">Recent</option>
                 <option value="date-asc">Old</option>
                 <option value="amount-desc">Increasing Order</option>
                 <option value="amount-asc">Decreasing Order</option>
               </select>
             </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden w-full">
        
        {/* Mobile View: Card Stack */}
        <div className="md:hidden flex flex-col gap-4 p-3 sm:p-5 bg-slate-50/50 dark:bg-transparent">
          {filteredAndSorted.map(t => (
            <div key={t.id} className="p-5 flex flex-col gap-4 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-3">
                 <div className="flex items-start gap-4 overflow-hidden">
                    <div className={`shrink-0 inline-flex items-center justify-center p-3 rounded-xl shadow-sm ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                      {t.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    </div>
                    <div className="overflow-hidden mt-0.5 w-full">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px] truncate">{t.category}</p>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                           {t.account || t.source}
                        </span>
                        {t.note && <span className="text-[11px] font-semibold text-slate-400 truncate">{t.note}</span>}
                      </div>
                    </div>
                 </div>
                 <div className="text-right shrink-0">
                    <p className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      {format(new Date(t.date), 'MMM dd, yyyy')}
                    </p>
                 </div>
              </div>
              
              {isAdmin && (
                <div className="flex justify-end items-center mt-1 border-t border-slate-100 dark:border-slate-800/50 pt-2">
                  {t.isVirtual ? (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">System Log</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEditClick(t)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-500 transition-colors">
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button onClick={() => deleteTransaction(t.id)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {filteredAndSorted.length === 0 && (
            <div className="p-8 text-center text-sm font-medium text-slate-500">
              No transactions found matching your criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto w-full custom-scrollbar pb-4 bg-white dark:bg-slate-900">
          <table className="w-full min-w-[700px] text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8fafc] dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Type</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Category / Note</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Source</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Date</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px]">Amount</th>
                {isAdmin && <th className="px-6 py-5 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredAndSorted.map((t, idx) => (
                <tr key={t.id} className={`hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/40 dark:bg-slate-800/20'}`}>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center justify-center p-2.5 rounded-xl shadow-sm ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                      {t.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-[15px] text-slate-800 dark:text-slate-100 mb-1">{t.category}</p>
                    <p className="text-[13px] font-semibold text-slate-400">{t.note}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                      {t.account || t.source}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-semibold text-[13px] text-slate-500 dark:text-slate-400">
                    {format(new Date(t.date), 'MMMM dd, yyyy')}
                  </td>
                  <td className={`px-6 py-5 font-black text-[15px] ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-5 text-right">
                      {t.isVirtual ? (
                         <div className="flex justify-end pr-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">System Log</span>
                         </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditClick(t)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-500/10 transition-colors shrink-0">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteTransaction(t.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-500/10 transition-colors shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSorted.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No transactions found matching your criteria.
            </div>
          )}
        </div>
      </div>

      <AddTransactionModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        initialData={editingData} 
      />
    </div>
  );
};
