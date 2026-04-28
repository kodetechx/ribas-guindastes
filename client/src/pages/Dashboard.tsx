import React, { useEffect, useState } from 'react';
import { Truck, AlertTriangle, FileWarning, CheckSquare, Clock, User } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

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
        <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
          <h3 className="text-xs font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-widest text-gray-500">Manutenções Próximas</h3>
          {stats?.alerts?.upcomingMaintenances?.length > 0 ? (
            <div className="space-y-3">
              {stats.alerts.upcomingMaintenances.map((m: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-sm">
                  <div className="flex items-center gap-3">
                    <Clock size={14} className="text-yellow-600" />
                    <span className="font-bold text-xs text-gray-700 uppercase">{m.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gray-400">
                    {new Date(m.nextMaintenance).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-400 text-xs font-bold uppercase italic">Sem alertas de manutenção</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
          <h3 className="text-xs font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-widest text-gray-500">Alertas de Documentação</h3>
          {stats?.alerts?.documentAlerts?.length > 0 ? (
            <div className="space-y-3">
              {stats.alerts.documentAlerts.map((d: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-sm">
                  <div>
                    <p className="text-xs font-black text-red-900 uppercase tracking-tight">{d.operatorName}</p>
                    <p className="text-[9px] text-red-700 font-black uppercase">{d.docType}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-red-900">
                    {new Date(d.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-400 text-xs font-bold uppercase italic">Conformidade total</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
          <h3 className="text-xs font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-widest text-gray-500">Fluxo de Campo</h3>
          {stats?.checklists?.recent?.length > 0 ? (
            <div className="space-y-3">
              {stats.checklists.recent.map((c: any, idx: number) => (
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
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-400 text-xs font-bold uppercase italic">Aguardando atividades</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
