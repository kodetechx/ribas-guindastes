import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, Calendar, Settings, AlertTriangle, ClipboardList, CheckCircle, Wrench } from 'lucide-react';
import api from '../services/api';
import MaintenanceForm from '../components/MaintenanceForm';
import DocumentManager from '../components/DocumentManager';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<any>(null);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  const fetchDetails = async () => {
    try {
      const [eqRes, checkRes, maintRes] = await Promise.all([
        api.get(`/equipments/${id}`),
        api.get(`/checklists/equipment/${id}`),
        api.get(`/maintenances/equipment/${id}`)
      ]);
      setEquipment(eqRes.data);
      setChecklists(checkRes.data);
      setMaintenances(maintRes.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-sm h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
    </div>
  );
  
  if (!equipment) return (
    <div className="p-10 text-center bg-white border border-red-100 rounded-sm">
      <p className="text-red-600 font-bold uppercase tracking-widest text-sm">Equipamento não encontrado</p>
      <Link to="/equipamentos" className="text-blue-900 text-xs font-bold uppercase mt-4 inline-block hover:underline">Voltar para lista</Link>
    </div>
  );

  const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${window.location.origin}/checklist/${id}&chs=200x200&chld=M|0`;

  const statusStyles: any = {
    active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Ativo' },
    maintenance: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Manutenção' },
    blocked: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Bloqueado' },
  };

  const style = statusStyles[equipment.status] || statusStyles.active;

  return (
    <div className="fade-in max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Link to="/equipamentos" className="p-2 bg-white border border-gray-200 rounded-sm text-gray-400 hover:text-blue-900 transition-colors">
            <svg size={20} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{equipment.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 border ${style.border} ${style.bg} ${style.text} rounded-sm text-[9px] font-black uppercase tracking-widest`}>
                {style.label}
              </span>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">S/N: {equipment.serialNumber}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/checklist/${id}`} className="btn-industrial btn-primary">
            <ClipboardList size={16} />
            Realizar Checklist
          </Link>
          <button onClick={() => setShowMaintenanceForm(true)} className="btn-industrial btn-secondary">
            <Wrench size={16} />
            Registrar Manutenção
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* QR Code Card */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 text-center shadow-sm">
            <p className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-4">Etiqueta de Identificação</p>
            <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm inline-block mb-4">
              <img src={qrUrl} alt="QR Code" className="w-32 h-32 mix-blend-multiply" />
            </div>
            <p className="text-[10px] text-gray-500 font-medium px-2 leading-relaxed">
              Use este código para acesso rápido via dispositivo móvel em campo.
            </p>
            <button className="mt-6 w-full py-2 bg-gray-50 border border-gray-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-100 transition-colors">
              Imprimir QR Code
            </button>
          </div>

          {/* Quick Specs */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
            <h4 className="text-[10px] font-black mb-4 uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2">Especificações</h4>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">Marca / Modelo</p>
                <p className="text-sm font-bold text-gray-800 uppercase">{equipment.brand} {equipment.model}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">Ano</p>
                <p className="text-sm font-bold text-gray-800">{equipment.year}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">Próxima Manutenção</p>
                <p className={`text-sm font-bold ${equipment.nextMaintenance && new Date(equipment.nextMaintenance) < new Date() ? 'text-red-600' : 'text-gray-800'}`}>
                  {equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toLocaleDateString() : 'Não agendada'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
              <h3 className="text-xs font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-widest text-blue-900 flex items-center gap-2">
                <ClipboardList size={16} />
                Histórico de Checklists
              </h3>
              {checklists.length > 0 ? (
                <div className="space-y-3">
                  {checklists.slice(0, 10).map((check, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${check.isApproved ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            {new Date(check.date).toLocaleDateString()} - {new Date(check.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Operador: {check.operator?.name || '---'}</p>
                        </div>
                      </div>
                      {!check.isApproved && <AlertTriangle size={14} className="text-red-500" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-sm">
                  <p className="text-gray-400 text-xs font-bold uppercase italic">Nenhum registro encontrado</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
              <h3 className="text-xs font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-widest text-blue-900 flex items-center gap-2">
                <Wrench size={16} />
                Histórico de Manutenção
              </h3>
              {maintenances.length > 0 ? (
                <div className="space-y-3">
                  {maintenances.map((maint, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[8px] font-black uppercase rounded-sm border border-blue-100">
                          {maint.type === 'preventive' ? 'Preventiva' : maint.type === 'corrective' ? 'Corretiva' : 'Inspeção'}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-gray-400">{new Date(maint.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-800 mb-1">{maint.description}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50">
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Resp: {maint.mechanic}</p>
                        <p className="text-[9px] font-black text-blue-900">R$ {maint.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-sm">
                  <p className="text-gray-400 text-xs font-bold uppercase italic">Nenhum registro de manutenção</p>
                </div>
              )}
            </div>
          </div>

          <DocumentManager ownerId={id!} category="equipment" />
        </div>
      </div>

      {showMaintenanceForm && (
        <MaintenanceForm 
          equipmentId={id!} 
          onClose={() => setShowMaintenanceForm(false)} 
          onSuccess={fetchDetails} 
        />
      )}
    </div>
  );
};

export default EquipmentDetail;
