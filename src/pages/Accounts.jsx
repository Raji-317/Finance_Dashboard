import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Building2, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Accounts = () => {
  const { accounts, addAccount, editAccount, deleteAccount, totals, transactions } = useFinance();
  const { isAdmin } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState(null);
  const [viewingAcc, setViewingAcc] = useState(null);
  
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountAmount, setNewAccountAmount] = useState('');
  const [newAccountType, setNewAccountType] = useState('Bank Account');

  const openAdd = () => {
    setEditingAcc(null);
    setNewAccountName('');
    setNewAccountAmount('');
    setNewAccountType('Bank Account');
    setIsModalOpen(true);
  };

  const openEdit = (acc, e) => {
    e.stopPropagation();
    setEditingAcc(acc);
    setNewAccountName(acc.name);
    setNewAccountAmount(acc.currentBalance ?? acc.initialAmount);
    setNewAccountType(acc.type || 'Bank Account');
    setIsModalOpen(true);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteAccount(id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newAccountName && newAccountAmount !== '') {
      const enteredValue = parseFloat(newAccountAmount);
      if (editingAcc) {
         let newInitialAmount = enteredValue;
         if (editingAcc.currentBalance !== undefined) {
            const diff = enteredValue - editingAcc.currentBalance;
            newInitialAmount = Number(editingAcc.initialAmount) + diff;
         }
         editAccount({ ...editingAcc, name: newAccountName, initialAmount: newInitialAmount, type: newAccountType });
      } else {
         addAccount({ name: newAccountName, initialAmount: enteredValue, type: newAccountType });
      }
      setIsModalOpen(false);
    }
  };

  // Helper accurately fetching border color and text color per account type matches Screenshot 1 perfectly
  const getThemeVars = (type, index) => {
    if (type === 'Bank Account' || type === 'Checking' || index === 0) return { border: 'border-t-blue-500', text: 'text-blue-500', light: 'text-blue-500' };
    if (type === 'Savings' || type === 'Savings Account' || index === 1) return { border: 'border-t-emerald-500', text: 'text-emerald-500', light: 'text-emerald-500' };
    if (type === 'Credit Card' || type === 'Credit' || index === 2 || index === 3) return { border: 'border-t-[#e25d48]', text: 'text-[#e25d48]', light: 'text-[#e25d48]' };
    return { border: 'border-t-slate-500', text: 'text-slate-700', light: 'text-slate-500' };
  };
  
  return (
    <div className="space-y-6">
      
      {/* Top Header perfectly replicated */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-transparent pb-2">
        <div>
           <h2 className="text-[22px] font-bold text-slate-900 dark:text-slate-50">Accounts</h2>
           <p className="text-sm font-medium text-slate-500">
             Total: <span className="font-bold text-slate-900 dark:text-slate-100">₹{totals.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
           </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#3b82f6] hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Account
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-4">
        {accounts.map((acc, index) => {
          const theme = getThemeVars(acc.type, index);
          return (
          <div key={acc.id} onClick={() => setViewingAcc(acc)} className={`bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200 border-t-[3px] ${theme.border} dark:border-slate-800 dark:${theme.border} relative flex flex-col p-5 cursor-pointer hover:shadow-md transition-shadow`}>
            
            {/* Header Content */}
            <div className="flex justify-between items-start mb-6 gap-2">
               <div className="flex items-start gap-3 overflow-hidden">
                 <Building2 className={`h-6 w-6 mt-1 shrink-0 ${theme.light} opacity-90`} />
                 <div className="overflow-hidden">
                    <h3 className="font-bold text-[15px] text-slate-800 dark:text-slate-100 truncate">{acc.name}</h3>
                    <p className={`text-xs font-semibold ${theme.light} mt-1 truncate`}>{acc.type || 'Bank Account'}</p>
                 </div>
               </div>

               {isAdmin && (
                 <div className="flex items-center gap-3 shrink-0">
                   <button onClick={(e) => openEdit(acc, e)} className="text-slate-400 hover:text-blue-500 transition-colors shrink-0">
                     <Edit2 className="h-4 w-4 shrink-0" />
                   </button>
                   <button onClick={(e) => handleDelete(acc.id, e)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                     <Trash2 className="h-4 w-4 shrink-0" />
                   </button>
                 </div>
               )}
            </div>

            {/* Body Balances */}
            <div className="overflow-hidden">
               <p className="text-xs text-slate-400 font-medium mb-1">Current Balance</p>
               <p className={`text-2xl font-black ${theme.text} truncate`}>
                 {acc.type === 'Credit Card' || acc.type === 'Credit' ? (acc.currentBalance > 0 ? '-' : '+') : (acc.currentBalance < 0 ? '-' : '+')}₹{Math.abs(acc.currentBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
               </p>
            </div>

            {/* Footer Date */}
            <div className="mt-6 text-xs font-medium text-slate-400">
               Last updated: {acc.date || '2026-04-04'}
            </div>
          </div>
        )})}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
             <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold dark:text-white">{editingAcc ? 'Edit Account' : 'Add Account'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                  <X className="h-5 w-5" />
                </button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                  <input type="text" required value={newAccountName} onChange={e => setNewAccountName(e.target.value)} className="w-full px-4 py-2 border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 rounded outline-none text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select value={newAccountType} onChange={e => setNewAccountType(e.target.value)} className="w-full px-4 py-2 border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 rounded outline-none font-medium text-slate-900 dark:text-white">
                     <option value="Bank Account">Bank Account (Current)</option>
                     <option value="Savings">Savings Account</option>
                     <option value="Credit Card">Credit Card</option>
                     <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Balance</label>
                  <input type="number" required value={newAccountAmount} onChange={e => setNewAccountAmount(e.target.value)} className="w-full px-4 py-2 border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 rounded outline-none text-slate-900 dark:text-white" />
                </div>
                <button type="submit" className="w-full mt-6 bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-2 rounded shadow-sm">{editingAcc ? 'Save' : 'Add'}</button>
             </form>
          </div>
        </div>
      )}

      {/* Account Transactions Modal */}
      {viewingAcc && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
               <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{viewingAcc.name}</h2>
                    <p className="text-sm font-medium text-slate-500">Transaction History</p>
                  </div>
                  <button onClick={() => setViewingAcc(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {transactions.filter(t => !t.isVirtual && (t.account === viewingAcc.name || t.source === viewingAcc.name)).length > 0 ? (
                     <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {transactions.filter(t => !t.isVirtual && (t.account === viewingAcc.name || t.source === viewingAcc.name)).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t => (
                           <div key={t.id} className="flex justify-between items-center py-3 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                              <div>
                                 <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{t.category}</p>
                                 <p className="text-xs font-semibold text-slate-400">{t.date}</p>
                              </div>
                              <p className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                                 {t.type === 'income' ? '+' : '-'}₹{Math.abs(Number(t.amount)).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                              </p>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="flex items-center justify-center h-40 text-sm font-semibold text-slate-400">
                        No transactions found for this account.
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
