import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, Calendar, Shield, FileText, Settings, AlertTriangle, ClipboardList, CheckCircle } from 'lucide-react';
import api from '../services/api';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<any>(null);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [eqRes, checkRes] = await Promise.all([
          api.get(`/equipments/${id}`),
          api.get(`/checklists/equipment/${id}`)
        ]);
        setEquipment(eqRes.data);
        setChecklists(checkRes.data);
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!equipment) return <div className="p-10 text-center text-red-500">Equipamento não encontrado</div>;

  const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${window.location.origin}/checklist/${id}&chs=200x200&chld=M|0`;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/equipamentos" className="text-gray-400 hover:text-white">
          &larr; Voltar para Lista
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight">Detalhes do Equipamento</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-industrial-gray/30 border border-gray-800 rounded-xl p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-48 h-48 bg-industrial-gray/50 rounded-lg flex items-center justify-center border border-gray-700">
                <Truck size={64} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-black mb-2">{equipment.name}</h3>
                    <p className="text-xl text-gray-400 font-medium">{equipment.brand} {equipment.model}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                    equipment.status === 'active' ? 'bg-green-500/20 text-green-500' : 
                    equipment.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-500' : 
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {equipment.status}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">Ano de Fabricação</p>
                    <p className="font-mono">{equipment.year}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">Número de Série</p>
                    <p className="font-mono">{equipment.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">Última Manut.</p>
                    <p className="font-mono">{equipment.lastMaintenance ? new Date(equipment.lastMaintenance).toLocaleDateString() : 'N/D'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-industrial-gray/30 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ClipboardList className="text-industrial-yellow" />
              Histórico de Checklists
            </h3>
            {checklists.length > 0 ? (
              <div className="space-y-4">
                {checklists.map((check, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-800/20 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${check.isApproved ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {check.isApproved ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                      </div>
                      <div>
                        <p className="font-medium">{new Date(check.date).toLocaleDateString()} - {new Date(check.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-xs text-gray-500">Operador: {check.operator?.name || 'N/D'}</p>
                      </div>
                    </div>
                    {check.notes && (
                      <div className="hidden md:block text-sm text-gray-400 max-w-xs truncate">
                        {check.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-gray-600 italic">Nenhum checklist registrado para este equipamento.</p>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* QR Code */}
          <div className="bg-industrial-gray/30 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-4">QR Code de Operação</p>
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
            </div>
            <p className="text-xs text-gray-400 px-4">
              Afixe este código no equipamento para acesso rápido ao checklist e documentos.
            </p>
            <button className="mt-6 w-full py-2 bg-gray-800 rounded font-bold text-sm hover:bg-gray-700 transition-colors">
              Imprimir Etiqueta
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-industrial-gray/30 border border-gray-800 rounded-xl p-6">
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">Ações Rápidas</h4>
            <div className="grid grid-cols-1 gap-3">
              <Link to={`/checklist/${id}`} className="flex items-center gap-3 p-3 bg-industrial-yellow text-black rounded font-bold text-sm hover:bg-yellow-500 transition-colors">
                <ClipboardList size={18} />
                Realizar Checklist
              </Link>
              <button className="flex items-center gap-3 p-3 bg-gray-800 rounded font-bold text-sm hover:bg-gray-700 transition-colors">
                <Settings size={18} />
                Agendar Manutenção
              </button>
              <button className="flex items-center gap-3 p-3 bg-gray-800 rounded font-bold text-sm hover:bg-gray-700 transition-colors">
                <FileText size={18} />
                Gerenciar Documentos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
