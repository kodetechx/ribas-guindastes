import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, Calendar, Settings, AlertTriangle, ClipboardList, CheckCircle, Wrench, Edit, Trash2, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import api from '../services/api';
import MaintenanceForm from '../components/MaintenanceForm';
import DocumentManager from '../components/DocumentManager';
import { formatDateUTC, formatDateTime } from '../utils/dateUtils';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<any>(null);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/equipments/${id}`, { status: newStatus });
      fetchDetails();
    } catch (err) {
      alert('Erro ao atualizar status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteMaintenance = async (maintId: string) => {
    if (window.confirm('Tem certeza que deseja remover este registro de manutenção?')) {
      try {
        await api.delete(`/maintenances/${maintId}`);
        fetchDetails();
      } catch (error) {
        alert('Erro ao excluir manutenção');
      }
    }
  };

  const handleDeleteChecklist = async (checkId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este checklist?')) {
      try {
        await api.delete(`/checklists/${checkId}`);
        fetchDetails();
      } catch (error) {
        alert('Erro ao excluir checklist');
      }
    }
  };

  const handleEditMaintenance = (maint: any) => {
    setEditingMaintenance(maint);
    setShowMaintenanceForm(true);
  };
  
  const handleEditChecklist = (check: any) => {
    // Redireciona para tela de execução com ID do checklist para carregar dados
    window.location.href = `/checklist/${id}?edit=${check._id}`;
  };

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
    active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Ativo', icon: ShieldCheck },
    maintenance: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Manutenção', icon: ShieldAlert },
    blocked: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Bloqueado', icon: ShieldX },
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
              <div className="relative group">
                <button 
                  disabled={updatingStatus}
                  className={`px-2 py-0.5 border ${style.border} ${style.bg} ${style.text} rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:brightness-95 transition-all`}
                >
                  <style.icon size={10} />
                  {style.label}
                </button>
                <div className="absolute top-full left-0 mt-1 hidden group-hover:block z-50 bg-white border border-gray-200 shadow-xl rounded-sm p-1 min-w-[120px]">
                  {Object.keys(statusStyles).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleUpdateStatus(s)}
                      className="w-full text-left px-3 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <div className={`w-2 h-2 rounded-full ${statusStyles[s].bg.replace('50', '500')}`} />
                      {statusStyles[s].label}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">S/N: {equipment.serialNumber}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/checklist/${id}`} className="btn-industrial btn-primary">
            <ClipboardList size={16} />
            Realizar Checklist
          </Link>
          <button onClick={() => { setEditingMaintenance(null); setShowMaintenanceForm(true); }} className="btn-industrial btn-secondary">
            <Wrench size={16} />
            Registrar Manutenção
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Foto do Equipamento */}
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm aspect-square flex items-center justify-center bg-gray-50">
            {equipment.imageUrl ? (
              <img 
                src={api.defaults.baseURL?.replace('/api', '') + equipment.imageUrl} 
                className="w-full h-full object-cover" 
                alt={equipment.name}
              />
            ) : (
              <Truck size={48} className="text-gray-200" />
            )}
          </div>

          {/* QR Code Card */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 text-center shadow-sm">
            <p className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-4">Etiqueta de Identificação</p>
            <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm inline-block mb-4">
              <img src={qrUrl} alt="QR Code" className="w-32 h-32 mix-blend-multiply" />
            </div>
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
                  {equipment.nextMaintenance ? formatDateUTC(equipment.nextMaintenance) : 'Não agendada'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm flex flex-col h-[500px]">
              <h3 className="text-xs font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-widest text-blue-900 flex items-center gap-2">
                <ClipboardList size={16} />
                Histórico de Checklists
              </h3>
              <div className="overflow-y-auto flex-1 custom-scrollbar pr-1">
                {checklists.length > 0 ? (
                  <div className="space-y-3">
                    {checklists.map((check, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-sm group">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${check.isApproved ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="text-xs font-bold text-gray-800">
                              {formatDateTime(check.createdAt)}
                            </p>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Operador: {check.operator?.name || '---'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!check.isApproved && <AlertTriangle size={14} className="text-red-500" />}
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button 
                              onClick={() => handleEditChecklist(check)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded-sm transition-colors"
                            >
                              <Edit size={12} />
                            </button>
                            <button 
                              onClick={() => handleDeleteChecklist(check._id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded-sm transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-sm h-full flex items-center justify-center">
                    <p className="text-gray-400 text-xs font-bold uppercase italic">Nenhum registro encontrado</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm flex flex-col h-[500px]">
              <h3 className="text-xs font-black mb-6 border-b border-gray-100 pb-4 uppercase tracking-widest text-blue-900 flex items-center gap-2">
                <Wrench size={16} />
                Histórico de Manutenção
              </h3>
              <div className="overflow-y-auto flex-1 custom-scrollbar pr-1">
                {maintenances.length > 0 ? (
                  <div className="space-y-3">
                    {maintenances.map((maint, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-sm group relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[8px] font-black uppercase rounded-sm border border-blue-100">
                            {maint.type === 'preventive' ? 'Preventiva' : maint.type === 'corrective' ? 'Corretiva' : 'Inspeção'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-gray-400">{formatDateUTC(maint.date)}</span>
                            <div className="hidden group-hover:flex items-center gap-1">
                              <button 
                                onClick={() => handleEditMaintenance(maint)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded-sm transition-colors"
                              >
                                <Edit size={12} />
                              </button>
                              <button 
                                onClick={() => handleDeleteMaintenance(maint._id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded-sm transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
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
                  <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-sm h-full flex items-center justify-center">
                    <p className="text-gray-400 text-xs font-bold uppercase italic">Nenhum registro de manutenção</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DocumentManager ownerId={id!} category="equipment" onUploadSuccess={fetchDetails} />
        </div>
      </div>

      {showMaintenanceForm && (
        <MaintenanceForm 
          equipmentId={id!} 
          initialData={editingMaintenance}
          onClose={() => { setShowMaintenanceForm(false); setEditingMaintenance(null); }} 
          onSuccess={fetchDetails} 
        />
      )}
    </div>
  );
};

export default EquipmentDetail;
