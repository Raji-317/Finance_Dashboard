import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Coins, LineChart, Building2, UserCircle, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

import { useFinance } from '../context/FinanceContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Accounts', path: '/accounts', icon: Building2 },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Categories', path: '/categories', icon: PieChart },
  { name: 'Savings', path: '/savings', icon: Coins },
  { name: 'Charts', path: '/charts', icon: LineChart },
];

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { role } = useAuth();
  const { totals } = useFinance();

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/50 z-20 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />
      
      <aside className={cn(
        "fixed top-0 left-0 z-30 h-screen w-72 bg-white transition-transform duration-300 dark:bg-slate-900 flex flex-col border-r border-slate-200 dark:border-slate-800",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="bg-[#2a3042] text-white pb-6 pt-5 px-6 border-b border-[#3b445b] shrink-0 shadow-sm relative overflow-hidden">
          {/* Subtle background glow effect for premium feel */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

          <div className="flex items-center gap-3 text-2xl font-bold mb-8 relative z-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 font-bold text-white shadow-md border border-indigo-400/30 text-sm">
              F
            </div>
            <span className="tracking-tight text-[19px]">FinDash</span>
          </div>

          <div className="flex items-center gap-3.5 relative z-10 bg-[#1f2430] p-3 rounded-xl border border-[#3b445b] shadow-inner">
            <div className="relative">
              <UserCircle className="h-11 w-11 text-slate-300 opacity-90" strokeWidth={1.5} />
              <div className="absolute bottom-0 right-0 bg-emerald-500 w-3 h-3 rounded-full border-2 border-[#1f2430]"></div>
            </div>
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center w-full">
                 <p className="font-bold text-[14px] text-white tracking-wide">Rajya Lakshmi</p>
                 <p className="text-[9px] font-bold bg-[#343a4e] text-[#60a5fa] px-1.5 py-0.5 rounded shadow-sm tracking-wider uppercase">{role}</p>
              </div>
              <p className="text-[13px] font-black text-emerald-400 mt-1 flex items-center leading-none">
                 ₹{totals.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                 <span className="text-[10px] font-medium text-slate-400 ml-1.5 align-baseline font-mono uppercase">Total Funds</span>
              </p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                isActive 
                  ? "bg-slate-100 dark:bg-slate-800 text-[#2a3042] dark:text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <NavLink
             to="/"
             className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
          >
             <Settings className="h-5 w-5" />
             Settings
          </NavLink>
        </div>
      </aside>
    </>
  );
};
