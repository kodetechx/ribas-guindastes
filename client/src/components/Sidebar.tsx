import React from 'react';
import { LayoutDashboard, Truck, Users, FileText, Settings, LogOut, FileBadge } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['admin', 'manager', 'operator'] },
    { icon: Truck, label: 'Equipamentos', path: '/equipamentos', roles: ['admin', 'manager', 'operator'] },
    { icon: Users, label: 'Operadores', path: '/operadores', roles: ['admin', 'manager'] },
    { icon: FileBadge, label: 'Meus Documentos', path: '/meus-documentos', roles: ['operator'] },
    { icon: FileText, label: 'Serviços', path: '/servicos', roles: ['admin', 'manager'] },
  ];

  const filteredItems = menuItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
        <h1 className="text-xl font-black text-blue-900 tracking-tighter">RIBAS</h1>
        <div className="flex items-center gap-4">
          <button onClick={logout} className="text-gray-500">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 text-gray-800 hidden md:flex flex-col z-50">
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-2xl font-black text-blue-900 tracking-tighter">RIBAS</h1>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-[0.2em]">Sistemas Industriais</p>
        </div>

        <nav className="flex-1 mt-4">
          {filteredItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-8 py-3.5 transition-all text-sm font-semibold ${
                location.pathname === item.path
                  ? 'bg-gray-50 text-blue-900 border-r-4 border-blue-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} strokeWidth={2.5} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-sm bg-blue-900 flex items-center justify-center text-white font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 uppercase font-black">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-gray-500 hover:text-red-600 transition-colors w-full text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={16} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center z-50">
        {filteredItems.slice(0, 4).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${
              location.pathname === item.path ? 'text-blue-900' : 'text-gray-400'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[9px] font-bold uppercase">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
