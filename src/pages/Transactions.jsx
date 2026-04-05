import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Trash2, Edit2, ArrowDownRight, ArrowUpRight, Search, Filter } from 'lucide-react';
import { AddTransactionModal } from '../components/AddTransactionModal';

export const Transactions = () => {
  const { transactions, deleteTransaction } = useFinance();
  const { isAdmin } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const filteredAndSorted = transactions
    .filter(t => !t.isVirtual)
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => (t.category || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.note || '').toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
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
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search category or note..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex w-full sm:w-auto gap-3">
             <select 
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
               className="flex-1 sm:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer dark:text-white"
             >
               <option value="all">All Types</option>
               <option value="income">Income</option>
               <option value="expense">Expense</option>
             </select>
             
             <button 
               onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white shrink-0"
             >
               <Filter className="h-4 w-4 shrink-0" /> 
               <span className="truncate">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
             </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden w-full">
        <div className="overflow-x-auto w-full custom-scrollbar pb-2">
          <table className="w-full min-w-[700px] text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Category / Note</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                {isAdmin && <th className="px-6 py-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAndSorted.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center justify-center p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-100/50 text-rose-600 dark:bg-rose-500/10'}`}>
                      {t.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{t.category}</p>
                    <p className="text-xs text-slate-500">{t.note || t.source}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {format(new Date(t.date), 'MMM dd, yyyy')}
                  </td>
                  <td className={`px-6 py-4 font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
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
