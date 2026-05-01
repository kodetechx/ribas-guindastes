import React, { useEffect, useState } from 'react';
import { Truck, AlertTriangle, FileWarning, CheckSquare, Clock, User, Search, Filter, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../services/api';
import { formatDateUTC, formatDateTime } from '../utils/dateUtils';

const COLORS = ['#1E3A8A', '#F59E0B', '#EF4444', '#10B981'];

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Search states for components
  const [maintSearch, setMaintSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [checklistSearch, setChecklistSearch] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stats/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-sm h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Equipamentos Ativos', 
      value: stats?.equipments?.active || 0, 
      icon: Truck, 
      color: 'text-blue-900', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Manutenções Pendentes', 
      value: stats?.alerts?.upcomingMaintenances?.length || 0, 
      icon: Clock, 
      color: 'text-yellow-700', 
      bg: 'bg-yellow-50' 
    },
    { 
      label: 'Documentos Vencendo', 
      value: stats?.alerts?.documentAlerts?.length || 0, 
      icon: FileWarning, 
      color: 'text-orange-700', 
      bg: 'bg-orange-50' 
    },
    { 
      label: 'Checklists Hoje', 
      value: `${stats?.checklists?.today || 0}/${stats?.equipments?.total || 0}`, 
      icon: CheckSquare, 
      color: 'text-green-700', 
      bg: 'bg-green-50' 
    },
  ];

  // Filtered lists
  const filteredMaint = (stats?.alerts?.upcomingMaintenances || []).filter((m: any) => 
    m.name.toLowerCase().includes(maintSearch.toLowerCase())
  );

  const filteredDocs = (stats?.alerts?.documentAlerts || []).filter((d: any) => 
    d.operatorName.toLowerCase().includes(docSearch.toLowerCase()) ||
    d.docType.toLowerCase().includes(docSearch.toLowerCase())
  );

  const filteredChecklists = (stats?.checklists?.recent || []).filter((c: any) => 
    c.equipment?.name.toLowerCase().includes(checklistSearch.toLowerCase()) ||
    c.operator?.name.toLowerCase().includes(checklistSearch.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="mb-10 border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Painel de Controle</h2>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Gestão de Ativos e Conformidade</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-sm ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</span>
            </div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manutenções Próximas */}
        <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Manutenções Próximas</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filtrar..."
                  className="text-[10px] border border-gray-200 rounded-sm px-2 py-1 outline-none focus:border-blue-900 w-24"
                  value={maintSearch}
                  onChange={(e) => setMaintSearch(e.target.value)}
                />
                <Search size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {maintSearch && (
                <button onClick={() => setMaintSearch('')} className="p-1 text-gray-400 hover:text-red-500">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {filteredMaint.length > 0 ? (
              <div className="space-y-3">
                {filteredMaint.map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-sm">
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-yellow-600" />
                      <span className="font-bold text-xs text-gray-700 uppercase">{m.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gray-400">
                      {formatDateUTC(m.nextMaintenance)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-xs font-bold uppercase italic text-center">Nenhum registro</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertas de Documentação */}
        <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Alertas de Documentação</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filtrar..."
                  className="text-[10px] border border-gray-200 rounded-sm px-2 py-1 outline-none focus:border-blue-900 w-24"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                />
                <Search size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {docSearch && (
                <button onClick={() => setDocSearch('')} className="p-1 text-gray-400 hover:text-red-500">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {filteredDocs.length > 0 ? (
              <div className="space-y-3">
                {filteredDocs.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-sm">
                    <div>
                      <p className="text-xs font-black text-red-900 uppercase tracking-tight">{d.operatorName}</p>
                      <p className="text-[9px] text-red-700 font-black uppercase">{d.docType}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-red-900">
                      {formatDateUTC(d.expiresAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-xs font-bold uppercase italic text-center">Conformidade total</p>
              </div>
            )}
          </div>
        </div>

        {/* Fluxo de Campo */}
        <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Fluxo de Campo</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filtrar..."
                  className="text-[10px] border border-gray-200 rounded-sm px-2 py-1 outline-none focus:border-blue-900 w-24"
                  value={checklistSearch}
                  onChange={(e) => setChecklistSearch(e.target.value)}
                />
                <Search size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {checklistSearch && (
                <button onClick={() => setChecklistSearch('')} className="p-1 text-gray-400 hover:text-red-500">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {filteredChecklists.length > 0 ? (
              <div className="space-y-3">
                {filteredChecklists.map((c: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${c.isApproved ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{c.equipment?.name}</p>
                        <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase">
                          <User size={10} />
                          {c.operator?.name}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 font-bold">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-xs font-bold uppercase italic text-center">Nenhuma atividade</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
          <h3 className="text-xs font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-widest text-gray-500">Utilização de Frota</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.charts?.utilization || []} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {(stats?.charts?.utilization || []).map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
          <h3 className="text-xs font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-widest text-gray-500">Custos de Manutenção (R$)</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.charts?.costs || []}>
                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="cost" fill="#1E3A8A" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
