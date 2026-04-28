import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Truck, Play, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ServicesList = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data);
      } catch (err) {
        console.error('Erro ao buscar serviços');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/services/${id}`, { status });
      window.location.reload(); // Simplificado para atualização
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  return (
    <div className="fade-in max-w-5xl mx-auto">
      <div className="mb-10 border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Gestão de Serviços</h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Acompanhamento de demandas em campo</p>
      </div>

      {loading ? <div className="text-center">Carregando...</div> : (
        <div className="grid grid-cols-1 gap-4">
          {services.map((service) => (
            <div key={service._id} className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase">{service.title}</h3>
                  <p className="text-xs font-bold text-blue-900">{service.client}</p>
                </div>
                <span className={`px-2 py-1 rounded-sm text-[9px] font-black uppercase ${
                  service.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                  service.status === 'finished' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                }`}>
                  {service.status === 'pending' ? 'Pendente' : service.status === 'in_progress' ? 'Em Andamento' : 'Finalizado'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                <div className="flex items-center gap-2"><MapPin size={14} /> {service.location}</div>
                <div className="flex items-center gap-2"><Truck size={14} /> {service.equipment?.name || '---'}</div>
                <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(service.startDate).toLocaleDateString()}</div>
              </div>

              {service.status !== 'finished' && (
                <div className="flex gap-2">
                  {service.status === 'pending' && (
                    <button onClick={() => handleUpdateStatus(service._id, 'in_progress')} className="btn-industrial btn-primary w-full">
                      <Play size={14} /> Iniciar Serviço
                    </button>
                  )}
                  {service.status === 'in_progress' && (
                    <button onClick={() => handleUpdateStatus(service._id, 'finished')} className="btn-industrial btn-secondary w-full border-green-200 text-green-700 hover:bg-green-50">
                      <CheckCircle size={14} /> Finalizar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesList;
