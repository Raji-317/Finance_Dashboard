import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ArrowLeft, X, Layers, Briefcase, ShoppingBag, Home, Zap, Film, Utensils, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { format } from 'date-fns';

const iconMap = {
  Salary: Briefcase,
  Freelance: Zap,
  Housing: Home,
  Food: Utensils,
  Transport: Layers,
  Utilities: Zap,
  Entertainment: Film,
  Health: Heart,
  Shopping: ShoppingBag,
  Default: Layers
};

export const Categories = () => {
  const { categories, transactions, addCategory, addTransaction, accounts } = useFinance();
  const { isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState('expense');
  const [drillDownCategory, setDrillDownCategory] = useState(null);
  
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  
  // Create Category Setup
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  // User explicitly wants to add an initial logic mapping expense/income automatically
  const [initialAmount, setInitialAmount] = useState('');
  const [initialDate, setInitialDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [initialAccount, setInitialAccount] = useState(() => accounts.length > 0 ? accounts[0].name : "");

  const categoriesWithStats = categories.map(cat => {
     let amount = 0;
     let count = 0;
     let transactionsList = [];

     transactions.forEach(t => {
        if (t.category === cat.name && t.type === cat.type) {
           amount += Number(t.amount);
           count += 1;
           transactionsList.push(t);
        }
     });

     return { ...cat, amount, count, transactionsList: transactionsList.sort((a,b) => new Date(b.date) - new Date(a.date)) };
  });

  const displayedCategories = categoriesWithStats.filter(c => c.type === activeTab).sort((a, b) => b.amount - a.amount);

  const handleAddNewCategory = (e) => {
    e.preventDefault();
    if(newCatName) {
      addCategory({ name: newCatName, type: activeTab });
      
      // Auto hook an initial transaction if they provided a numeric baseline as requested
      if (initialAmount && Number(initialAmount) > 0) {
         addTransaction({
            type: activeTab,
            amount: parseFloat(initialAmount),
            date: initialDate,
            category: newCatName,
            account: initialAccount
         });
      }

      setIsCatModalOpen(false);
      setNewCatName('');
      setInitialAmount('');
    }
  };

  if (drillDownCategory) {
     const catData = displayedCategories.find(c => c.name === drillDownCategory);
     if (!catData) return null;

      return (
        <div className="flex flex-col h-[calc(100vh-160px)] space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
           <button onClick={() => setDrillDownCategory(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
             <ArrowLeft className="h-6 w-6" />
           </button>
           <div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{catData.name} Registry</h2>
             <p className="text-sm text-slate-500">{activeTab === 'expense' ? 'Expenses' : 'Income'} Log</p>
           </div>
         </div>

         <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 shrink-0">
            <div>
               <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">TOTAL RECORDED</p>
               <p className="text-4xl font-black text-indigo-900 dark:text-indigo-50 mt-1">₹{catData.amount.toLocaleString('en-IN', {minimumFractionDigits:2})}</p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => setIsTransModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
              >
                Log {activeTab === 'expense' ? 'Expense' : 'Income'}
              </button>
            )}
         </div>

         <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-0">
            {catData.transactionsList.length > 0 ? (
               <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {catData.transactionsList.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                       <div>
                         <p className="font-bold text-slate-800 dark:text-slate-200">{format(new Date(t.date), 'MMMM dd, yyyy')}</p>
                         <p className="text-xs text-slate-500 font-medium mt-0.5">Source: {t.account}</p>
                       </div>
                       <p className={`font-black text-lg ${activeTab === 'expense' ? 'text-slate-900 dark:text-slate-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
                         {activeTab === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN', {minimumFractionDigits:2})}
                       </p>
                    </div>
                  ))}
               </div>
            ) : (
              <div className="p-12 text-center text-slate-500">No records found for this category yet.</div>
            )}
         </div>

         <AddTransactionModal 
            isOpen={isTransModalOpen} 
            onClose={() => setIsTransModalOpen(false)} 
            defaultType={activeTab}
            initialData={{
               type: activeTab,
               category: catData.name, 
               amount: '',
               date: new Date().toISOString().split('T')[0]
            }}
         />
       </div>
     );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shrink-0">
        <div className="flex flex-col gap-4 w-full sm:w-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Master Categories</h2>
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
        </div>

        {isAdmin && (
           <button 
             onClick={() => setIsCatModalOpen(true)}
             className="bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors"
           >
             Add Category
           </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {displayedCategories.map((cat, idx) => {
          const IconComponent = iconMap[cat.name] || iconMap['Default'];
          const borderColors = ['border-blue-200 dark:border-blue-900', 'border-rose-200 dark:border-rose-900', 'border-emerald-200 dark:border-emerald-900', 'border-purple-200 dark:border-purple-900', 'border-amber-200 dark:border-amber-900'];
          const bColor = borderColors[idx % borderColors.length];

          return (
          <div 
            key={cat.name} 
            onClick={() => setDrillDownCategory(cat.name)}
            className={`p-4 rounded-xl border-2 bg-white dark:bg-slate-900 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center text-center ${bColor}`}
          >
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-3 border border-slate-100 dark:border-slate-700 mt-2">
               <IconComponent className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </div>
            
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-1">{cat.name}</h3>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full mb-3 mt-1 border border-slate-100 dark:border-slate-700">{cat.count} logs</span>
            
            <p className="text-lg font-black text-slate-900 dark:text-white mt-auto">
               ₹{cat.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </p>
          </div>
        )})}
        {displayedCategories.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No {activeTab} categories created yet.
          </div>
        )}
      </div>
      </div>

      {isCatModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Category</h2>
                 <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-full"><X className="h-5 w-5"/></button>
              </div>
              <form onSubmit={handleAddNewCategory} className="space-y-4">
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category Name ({activeTab})</label>
                   <input 
                     required 
                     autoFocus
                     type="text" 
                     value={newCatName} 
                     onChange={e => setNewCatName(e.target.value)} 
                     className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-medium"
                   />
                 </div>
                 
                 <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                   <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Initial Log (Optional)</p>
                   <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Amount (₹)</label>
                        <input 
                          type="number" 
                          value={initialAmount} 
                          onChange={e => setInitialAmount(e.target.value)} 
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                           <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date</label>
                           <input 
                             type="date"
                             value={initialDate}
                             onChange={e => setInitialDate(e.target.value)}
                             className="w-full px-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-xs"
                           />
                        </div>
                        <div className="flex-1">
                           <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Bank</label>
                           <select 
                             value={initialAccount}
                             onChange={e => setInitialAccount(e.target.value)}
                             className="w-full px-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-xs"
                           >
                             {accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                           </select>
                        </div>
                      </div>
                   </div>
                 </div>

                 <button type="submit" className="w-full mt-6 bg-[#3b82f6] text-white font-bold py-3 rounded-xl transition-colors hover:bg-blue-600 shadow-sm">Save Category</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
