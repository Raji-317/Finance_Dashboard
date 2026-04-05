import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const AddTransactionModal = ({ isOpen, onClose, defaultType = 'expense', initialData = null }) => {
  const { addTransaction, editTransaction, accounts, categories } = useFinance();
  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');

  // Default to first account and category on open if applicable
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setAmount(initialData.amount);
        setDate(initialData.date);
        setCategory(initialData.category);
        setAccount(initialData.account || accounts[0]?.name || '');
      } else {
        setType(defaultType);
        setAmount('');
        
        // Exact Local Timezone Format
        const tzDate = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const localDateStr = `${tzDate.getFullYear()}-${pad(tzDate.getMonth()+1)}-${pad(tzDate.getDate())}`;
        setDate(localDateStr);
        // Prefill generic category based on type
        const catOpts = categories.filter(c => c.type === defaultType);
        setCategory(catOpts.length > 0 ? catOpts[0].name : '');
        setAccount(accounts.length > 0 ? accounts[0].name : '');
      }
    }
  }, [isOpen, defaultType, initialData, accounts, categories]);

  // Update predefined category array when type switches
  useEffect(() => {
     if(!initialData && isOpen){
        const catOpts = categories.filter(c => c.type === type);
        setCategory(catOpts.length > 0 ? catOpts[0].name : '');
     }
  }, [type, categories, initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category || !account) return; // Prevent empty submits

    const parsedAmount = Math.abs(parseFloat(amount));
    const record = {
      type,
      amount: parsedAmount,
      date,
      category,
      account
    };

    if (initialData) {
      editTransaction({ ...record, id: initialData.id });
    } else {
      addTransaction(record);
    }
    
    onClose();
  };

  const currentCategoriesList = categories.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-50">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold">{initialData ? 'Update Record' : 'Record Transaction'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${type === 'expense' ? 'bg-white dark:bg-slate-900 shadow-sm text-rose-500' : 'text-slate-500'}`}
              onClick={() => setType('expense')}
              disabled={!!initialData} // Lock type if editing
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${type === 'income' ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-500' : 'text-slate-500'}`}
              onClick={() => setType('income')}
              disabled={!!initialData}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount Formatted</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="number"
                min="0"
                step="0.01" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-black text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-slate-900 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium text-slate-900 dark:text-white"
                required
              >
                {currentCategoriesList.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Source</label>
              <select 
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium text-slate-900 dark:text-white"
                required
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
                {initialData && initialData.account && !accounts.some(a => a.name === initialData.account) && (
                  <option key="ghost-acc" value={initialData.account}>{initialData.account} (Deleted)</option>
                )}
            </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm text-slate-900 dark:text-white"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={accounts.length === 0}
            className={`w-full mt-4 font-bold tracking-wide py-3.5 rounded-xl transition-all shadow-lg ${accounts.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none dark:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'}`}
          >
            {accounts.length === 0 ? 'Create an Account First' : (initialData ? 'Update Record' : 'Save Record To Ledger')}
          </button>
        </form>
      </div>
    </div>
  );
};
