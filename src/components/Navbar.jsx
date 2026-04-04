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
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between bg-[#2a3042] px-4 text-white shadow-md">
      
      <div className="flex items-center gap-4 w-1/3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-300 hover:bg-[#343a4e] transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          {/* User requested F block matching toggle color */}
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#343a4e] font-bold text-white shadow-sm border border-slate-600">
            F
          </div>
          <span className="text-lg font-semibold tracking-tight">FinDash</span>
        </div>
      </div>

      <div className="flex-1 text-center hidden md:block">
         <h1 className="text-[15px] font-bold tracking-wide text-white">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center justify-end gap-3 w-1/3">
        <button
          onClick={toggleDarkMode}
          className="rounded-full p-2 text-slate-300 hover:bg-[#343a4e] transition-colors"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative flex items-center rounded-full border border-[#3b445b] bg-transparent pl-3 pr-2 py-1 transition-colors hover:bg-[#343a4e]">
          <div className="h-2 w-2 rounded-full bg-blue-400 mr-2 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
          <select
            value={role}
            onChange={(e) => toggleRole(e.target.value)}
            className="cursor-pointer bg-transparent text-xs font-bold text-slate-200 outline-none appearance-none pr-4"
          >
            <option value="Viewer" className="text-slate-900">Viewer</option>
            <option value="Admin" className="text-slate-900">Admin</option>
          </select>
          <div className="pointer-events-none absolute right-2 text-slate-400">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

      </div>
    </header>
  );
};
