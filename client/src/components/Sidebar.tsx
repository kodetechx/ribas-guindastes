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
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-industrial-dark border-b border-gray-800 flex items-center justify-between px-6 z-50">
        <h1 className="text-xl font-bold text-industrial-yellow italic tracking-tighter">RIBAS</h1>
        <div className="flex items-center gap-4">
          {user?.role === 'operator' && (
            <Link to="/meus-documentos" className="p-2 bg-industrial-yellow/10 text-industrial-yellow rounded">
              <FileBadge size={20} />
            </Link>
          )}
          <button onClick={logout} className="text-gray-400">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-industrial-dark border-r border-gray-800 text-white hidden md:flex flex-col z-50">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-industrial-yellow italic tracking-tighter">RIBAS</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Gestão Operacional</p>
        </div>

        <nav className="flex-1 mt-6">
          {filteredItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-4 transition-colors ${
                location.pathname === item.path
                  ? 'bg-industrial-gray border-l-4 border-industrial-yellow text-white'
                  : 'text-gray-400 hover:bg-industrial-gray/50 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 rounded-full bg-industrial-yellow/20 flex items-center justify-center text-industrial-yellow font-bold text-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 uppercase">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors w-full px-2"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-industrial-dark border-t border-gray-800 flex justify-around items-center z-50">
        {filteredItems.slice(0, 4).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              location.pathname === item.path ? 'text-industrial-yellow' : 'text-gray-500'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
