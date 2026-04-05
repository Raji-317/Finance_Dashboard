import React, { createContext, useContext, useState, useEffect } from "react";
import { format, subDays, subMonths } from "date-fns";

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

const generateMockData = () => {
  const today = new Date();
  let data = [];
  
  // Seed extensive list of transactions
  for (let i = 0; i < 30; i++) {
     const isIncome = i % 4 === 0;
     const type = isIncome ? 'income' : 'expense';
     const categories = isIncome ? ['Salary', 'Freelance'] : ['Housing', 'Food', 'Transport', 'Entertainment'];
     const accounts = ['SBI', 'HDFC', 'ICICI', 'Cash'];
     
     data.push({
        id: i.toString(),
        type,
        category: categories[i % categories.length],
        amount: isIncome ? (20000 + (i * 1000)) : (500 + i * 200),
        date: format(subDays(today, i * 2), 'yyyy-MM-dd'),
        account: accounts[i % accounts.length]
     });
  }
  return data;
};

const defaultAccounts = [
  { id: "1", name: "Cash", initialAmount: 5000, type: "Cash", date: new Date().toISOString().split('T')[0] },
  { id: "2", name: "SBI", initialAmount: 20000, type: "Savings", date: new Date().toISOString().split('T')[0] },
  { id: "3", name: "HDFC", initialAmount: 0, type: "Bank Account", date: new Date().toISOString().split('T')[0] },
  { id: "4", name: "ICICI", initialAmount: 10000, type: "Credit Card", date: new Date().toISOString().split('T')[0] }
];

const defaultCategories = [
  { id: "1", name: "Salary", type: "income" },
  { id: "2", name: "Freelance", type: "income" },
  { id: "4", name: "Housing", type: "expense" },
  { id: "5", name: "Food", type: "expense" },
  { id: "6", name: "Transport", type: "expense" },
  { id: "7", name: "Entertainment", type: "expense" }
];

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("finance_transactions_v5");
    return saved ? JSON.parse(saved) : generateMockData();
  });

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem("finance_accounts_v5");
    return saved ? JSON.parse(saved) : defaultAccounts;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("finance_categories_v5");
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  useEffect(() => { localStorage.setItem("finance_transactions_v5", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("finance_accounts_v5", JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem("finance_categories_v5", JSON.stringify(categories)); }, [categories]);

  const addTransaction = (transaction) => { setTransactions(prev => [{ ...transaction, id: Date.now().toString() }, ...prev]); };
  const deleteTransaction = (id) => { setTransactions(prev => prev.filter(t => t.id !== id)); };
  const editTransaction = (updated) => { setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t)); };

  const addAccount = (account) => { 
    setAccounts(prev => {
       const existingIndex = prev.findIndex(a => a.name.toLowerCase() === account.name.toLowerCase());
       if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
             ...updated[existingIndex],
             initialAmount: Number(updated[existingIndex].initialAmount) + Number(account.initialAmount)
          };
          return updated;
       }
       return [...prev, { ...account, id: Date.now().toString(), date: new Date().toISOString().split('T')[0] }];
    });
  };
  const editAccount = (updated) => { 
    setAccounts(prev => {
       const oldAccName = prev.find(a => a.id === updated.id)?.name;
       if (oldAccName && oldAccName !== updated.name) {
          setTransactions(prevTx => prevTx.map(t => (t.account === oldAccName || t.source === oldAccName) ? {...t, account: updated.name, source: updated.name} : t));
       }
       return prev.map(a => a.id === updated.id ? { ...updated, date: new Date().toISOString().split('T')[0] } : a);
    }); 
  };
  const deleteAccount = (id) => { setAccounts(prev => prev.filter(a => a.id !== id)); };

  const addCategory = (category) => { setCategories(prev => [...prev, { ...category, id: Date.now().toString() }]); };

  // Calculate dynamic balances using transactions against indian banks natively
  const dynamicAccounts = accounts.map(acc => {
    const isCredit = acc.type === 'Credit Card' || acc.type === 'Credit';
    let currentBalance = Number(acc.initialAmount);
    let totalSpent = 0;
    
    transactions.forEach(t => {
      // Tie directly to account mapping
      if (t.account === acc.name || t.source === acc.name) {
        if (t.type === "income") {
           // "Income" to a credit card pays off debt (decreases outstanding balance)
           if (isCredit) {
              currentBalance -= Number(t.amount);
           } else {
              currentBalance += Number(t.amount);
           }
        }
        if (t.type === "expense") {
           // "Expense" on a credit card increases debt
           if (isCredit) {
              currentBalance += Number(t.amount);
           } else {
              currentBalance -= Number(t.amount);
           }
           totalSpent += Number(t.amount);
        }
      }
    });
    
    return { ...acc, currentBalance, totalSpent, isCredit };
  });

  const totals = dynamicAccounts.reduce(
    (acc, a) => {
      // Credit card balances are subtracted from total net worth
      if (a.isCredit) {
         acc.balance -= Number(a.currentBalance);
      } else {
         acc.balance += Number(a.currentBalance);
      }
      return acc;
    },
    { balance: 0, income: 0, expense: 0 }
  );

  transactions.forEach(t => {
    if (t.type === 'income') totals.income += Number(t.amount);
    if (t.type === 'expense') totals.expense += Number(t.amount);
  });

  // Synthesize Account Initial Balances into Virtual Transactions so all graphs natively parse starting liquidities
  const virtualTransactions = React.useMemo(() => {
     const initTxs = accounts.map(acc => {
        const isCredit = acc.type === 'Credit Card' || acc.type === 'Credit';
        return {
           id: `init-${acc.id}`,
           type: isCredit ? 'expense' : 'income',
           category: acc.name, // Maps explicitly to display account name on chart legend
           amount: Number(acc.initialAmount),
           date: acc.date || new Date().toISOString().split('T')[0],
           account: acc.name,
           isVirtual: true
        };
     }).filter(t => t.amount > 0);
     
     return [...transactions, ...initTxs];
  }, [transactions, accounts]);

  return (
    <FinanceContext.Provider value={{ 
      transactions: virtualTransactions, 
      addTransaction, deleteTransaction, editTransaction, 
      accounts: dynamicAccounts, addAccount, editAccount, deleteAccount, 
      categories, addCategory, totals 
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
