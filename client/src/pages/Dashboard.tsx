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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-industrial-yellow"></div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Equipamentos Ativos', 
      value: stats?.equipments?.active || 0, 
      icon: Truck, 
      color: 'text-green-500', 
      bg: 'bg-green-500/10' 
    },
    { 
      label: 'Manutenções Pendentes', 
      value: stats?.alerts?.upcomingMaintenances?.length || 0, 
      icon: AlertTriangle, 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-500/10' 
    },
    { 
      label: 'Equipamentos Bloqueados', 
      value: stats?.equipments?.blocked || 0, 
      icon: FileWarning, 
      color: 'text-red-500', 
      bg: 'bg-red-500/10' 
    },
    { 
      label: 'Checklists Hoje', 
      value: `${stats?.checklists?.today || 0}/${stats?.equipments?.total || 0}`, 
      icon: CheckSquare, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight">Painel de Controle</h2>
        <p className="text-gray-400 mt-1">Bem-vindo ao sistema de gestão RIBAS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-industrial-gray/30 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-2xl font-black">{stat.value}</span>
            </div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-industrial-gray/30 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 border-b border-gray-800 pb-2">Manutenções Próximas</h3>
          {stats?.alerts?.upcomingMaintenances?.length > 0 ? (
            <div className="space-y-4">
              {stats.alerts.upcomingMaintenances.map((m: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/20 rounded border border-gray-800">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-yellow-500" />
                    <span className="font-medium">{m.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(m.nextMaintenance).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-600 italic">Sem manutenções urgentes.</p>
            </div>
          )}
        </div>

        <div className="bg-industrial-gray/30 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 border-b border-gray-800 pb-2">Últimos Checklists</h3>
          {stats?.checklists?.recent?.length > 0 ? (
            <div className="space-y-4">
              {stats.checklists.recent.map((c: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/20 rounded border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${c.isApproved ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-bold">{c.equipment?.name}</p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase">
                        <User size={10} />
                        {c.operator?.name}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-600 italic">Aguardando checklists diários...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
