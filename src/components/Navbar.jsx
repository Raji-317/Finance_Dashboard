import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export const Navbar = ({ toggleSidebar }) => {
  const { role, toggleRole, darkMode, toggleDarkMode } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    const path = location.pathname.substring(1);
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between bg-[#2a3042] px-2 sm:px-4 text-white shadow-md">
      
      <div className="flex items-center gap-2 sm:gap-4 w-auto sm:w-1/3 shrink-0 min-w-0">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 sm:p-2 text-slate-300 hover:bg-[#343a4e] transition-colors shrink-0"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
        </button>
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 overflow-hidden">
          <div className="flex shrink-0 h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded bg-[#343a4e] font-bold text-white shadow-sm border border-slate-600 text-[10px] sm:text-base">
            F
          </div>
          <span className="text-[12px] sm:text-lg font-semibold tracking-tight truncate">FinDash</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-1 sm:px-2 min-w-0">
         <h1 className="text-[14px] sm:text-[16px] font-bold tracking-wide text-white truncate w-full text-center leading-none">
            {getPageTitle()}
         </h1>
      </div>

      <div className="flex items-center justify-end gap-1.5 sm:gap-3 w-auto sm:w-1/3 shrink-0 min-w-0">
        <button
          onClick={toggleDarkMode}
          className="rounded-full p-1.5 sm:p-2 text-slate-300 hover:bg-[#343a4e] transition-colors shrink-0"
        >
          {darkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />}
        </button>

        <div className="relative flex items-center rounded-full border border-[#3b445b] bg-transparent pl-2 sm:pl-3 pr-1 sm:pr-2 py-1 transition-colors hover:bg-[#343a4e] max-w-[85px] sm:max-w-none">
          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0 bg-blue-400 mr-1.5 sm:mr-2 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
          <select
            value={role}
            onChange={(e) => toggleRole(e.target.value)}
            className="cursor-pointer bg-transparent text-[10px] sm:text-xs font-bold text-slate-200 outline-none appearance-none pr-3 sm:pr-4 w-full truncate"
          >
            <option value="Viewer" className="text-slate-900">Viewer</option>
            <option value="Admin" className="text-slate-900">Admin</option>
          </select>
          <div className="pointer-events-none absolute right-1 sm:right-2 text-slate-400">
             <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

      </div>
    </header>
  );
};
