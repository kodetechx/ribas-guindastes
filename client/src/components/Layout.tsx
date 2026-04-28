import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-industrial-dark text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 pt-20 pb-24 md:pt-0 md:pb-0 min-h-screen">
        <div className="p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
