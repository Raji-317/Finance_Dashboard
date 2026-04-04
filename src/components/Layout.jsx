import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useState } from 'react';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 transition-colors">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* pt-20 ensures the content is cleanly pushed down below the Fixed Navbar (which is h-16) globally */}
      <main className="pt-24 pb-20 px-4 lg:px-8 max-w-7xl mx-auto w-full">
         <Outlet />
      </main>
    </div>
  );
};
