import { useEffect, useState, useMemo } from 'react';
import { Calendar, MapPin, Truck, Play, CheckCircle, Plus, Search, Filter, X, Users, AlertTriangle, MessageSquare, Map as MapIcon, ExternalLink, Pencil, Trash2, Info, FileText } from 'lucide-react';
import api from '../services/api';
import ServiceForm from '../components/ServiceForm';
import OccurrenceForm from '../components/OccurrenceForm';
import { generateServiceOrderPDF } from '../utils/pdfGenerator';

const ServicesList = () => {
  const [services, setServices] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [occurrenceServiceId, setOccurrenceServiceId] = useState<string | null>(null);
  const [historyServiceId, setHistoryServiceId] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [filterOperator, setFilterOperator] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [sRes, eRes, oRes] = await Promise.all([
        api.get('/services'),
        api.get('/equipments'),
        api.get('/operators')
      ]);
      setServices(sRes.data);
      setEquipments(eRes.data);
      setOperators(oRes.data);
    } catch (err) {
      console.error('Erro ao buscar dados iniciais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/services/${id}`, { status });
      fetchInitialData();
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchInitialData();
    } catch (err) {
      alert('Erro ao excluir serviço');
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.client?.fantasyName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEquipment = !filterEquipment || service.equipments?.some((e: any) => (e._id || e) === filterEquipment);
      
      const matchesOperator = !filterOperator || (service.operators || []).some((op: any) => (op._id || op) === filterOperator);

      const serviceDate = new Date(service.startDate);
      const matchesDateStart = !filterDateStart || serviceDate >= new Date(filterDateStart);
      const matchesDateEnd = !filterDateEnd || serviceDate <= new Date(filterDateEnd);

      return matchesSearch && matchesEquipment && matchesOperator && matchesDateStart && matchesDateEnd;
    });
  }, [services, searchTerm, filterEquipment, filterOperator, filterDateStart, filterDateEnd]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterEquipment('');
    setFilterOperator('');
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  const columns = [
    { id: 'pending', title: 'Pendentes', color: 'bg-gray-100', icon: <Calendar size={16} /> },
    { id: 'in_progress', title: 'Em Andamento', color: 'bg-blue-50', icon: <Play size={16} /> },
    { id: 'finished', title: 'Finalizados', color: 'bg-green-50', icon: <CheckCircle size={16} /> },
  ];

  const hasActiveFilters = searchTerm || filterEquipment || filterOperator || filterDateStart || filterDateEnd;

  return (
    <div className="fade-in max-w-[1400px] mx-auto px-4">
      <div className="mb-6 border-b border-gray-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Gestão de Serviços</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Acompanhamento de demandas em campo</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowMap(!showMap)}
            className={`btn-industrial flex items-center gap-2 ${showMap ? 'bg-blue-900 text-white' : 'bg-white text-gray-900 border-gray-200'}`}
          >
            <MapIcon size={16} /> {showMap ? 'Ver Kanban' : 'Ver Mapa'}
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-industrial flex items-center gap-2 ${showFilters || hasActiveFilters ? 'bg-blue-900 text-white' : 'bg-white text-gray-900 border-gray-200'}`}
          >
            <Filter size={16} /> {hasActiveFilters ? 'Filtros Ativos' : 'Filtros'}
          </button>
          <button 
            onClick={() => { setServiceToEdit(null); setShowForm(true); }}
            className="btn-industrial btn-primary flex items-center gap-2 flex-1 md:flex-none"
          >
            <Plus size={16} /> Novo Serviço
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {(showFilters || hasActiveFilters) && (
        <div className="bg-white border border-gray-200 rounded-sm p-6 mb-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400">Buscar por Título ou Cliente</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="EX: MANUTENÇÃO, PETROBRAS..."
                  className="w-full border p-3 pl-10 text-xs font-bold uppercase bg-gray-50 focus:bg-white transition-colors"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Equipamento</label>
              <select 
                className="w-full border p-3 text-xs font-bold uppercase bg-gray-50"
                value={filterEquipment}
                onChange={e => setFilterEquipment(e.target.value)}
              >
                <option value="">TODOS</option>
                {equipments.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Operador</label>
              <select 
                className="w-full border p-3 text-xs font-bold uppercase bg-gray-50"
                value={filterOperator}
                onChange={e => setFilterOperator(e.target.value)}
              >
                <option value="">TODOS</option>
                {operators.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">De (Início)</label>
              <input 
                type="date" 
                className="w-full border p-3 text-xs font-bold bg-gray-50"
                value={filterDateStart}
                onChange={e => setFilterDateStart(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Até (Início)</label>
              <input 
                type="date" 
                className="w-full border p-3 text-xs font-bold bg-gray-50"
                value={filterDateEnd}
                onChange={e => setFilterDateEnd(e.target.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end border-t pt-4">
              <button 
                onClick={clearFilters}
                className="text-[10px] font-black uppercase text-red-600 flex items-center gap-1 hover:text-red-800 transition-colors"
              >
                <X size={14} /> Limpar Filtros
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <ServiceForm 
          serviceToEdit={serviceToEdit}
          onClose={() => { setShowForm(false); setServiceToEdit(null); }} 
          onSuccess={fetchInitialData} 
        />
      )}

      {occurrenceServiceId && (
        <OccurrenceForm 
          serviceId={occurrenceServiceId} 
          onClose={() => setOccurrenceServiceId(null)} 
          onSuccess={fetchInitialData} 
        />
      )}

      {historyServiceId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-sm w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase text-blue-900 flex items-center gap-2">
                <MessageSquare size={18} /> Histórico de Ocorrências
              </h3>
              <button onClick={() => setHistoryServiceId(null)}><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {services.find(s => s._id === historyServiceId)?.occurrences.map((occ: any, i: number) => (
                <div key={i} className="border-l-4 border-red-500 bg-gray-50 p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 px-2 py-0.5">
                      {occ.type === 'weather' ? 'Clima' : 
                       occ.type === 'equipment_failure' ? 'Falha Equipamento' :
                       occ.type === 'wait_for_client' ? 'Aguardando Cliente' :
                       occ.type === 'safety_halt' ? 'Parada Segurança' : 'Outros'}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                      {new Date(occ.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 uppercase leading-relaxed">
                    {occ.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setHistoryServiceId(null)} className="btn-industrial px-6">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-sm w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{selectedService.client?.fantasyName}</p>
                <h3 className="text-lg font-black uppercase text-gray-900">{selectedService.title}</h3>
              </div>
              <button onClick={() => setSelectedService(null)}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                  <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase rounded-sm ${
                    selectedService.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    selectedService.status === 'finished' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedService.status === 'pending' ? 'Pendente' : 
                     selectedService.status === 'in_progress' ? 'Em Andamento' : 'Finalizado'}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Início em</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">{new Date(selectedService.startDate).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} /> Localização
                  </p>
                  <p className="text-sm font-bold text-gray-900 uppercase">{selectedService.location}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-gray-400 border-b pb-2 flex items-center gap-2">
                  <Truck size={14} /> Equipamentos Alocados
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedService.equipments?.map((eq: any) => (
                    <div key={eq._id} className="p-3 bg-gray-50 border border-gray-100 rounded-sm flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black uppercase">{eq.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">{eq.brand} • {eq.serialNumber}</p>
                      </div>
                      <Info size={14} className="text-blue-900 cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-gray-400 border-b pb-2 flex items-center gap-2">
                  <Users size={14} /> Equipe de Operação
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedService.operators?.map((op: any) => (
                    <div key={op._id} className="p-3 bg-gray-50 border border-gray-100 rounded-sm flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                        {op.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase">{op.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">{op.role || 'Operador'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => generateServiceOrderPDF(selectedService)}
                className="btn-industrial flex items-center gap-2 bg-white text-blue-900 border-blue-900 hover:bg-blue-50"
              >
                <FileText size={16} /> Gerar Ordem de Serviço (PDF)
              </button>
              <button 
                onClick={() => { setServiceToEdit(selectedService); setShowForm(true); setSelectedService(null); }}
                className="btn-industrial flex items-center gap-2 border-blue-900 text-blue-900"
              >
                <Pencil size={16} /> Editar
              </button>
              <button onClick={() => setSelectedService(null)} className="btn-industrial bg-gray-900 text-white px-8">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {showMap ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
          {services
            .filter(s => s.status === 'in_progress')
            .map(service => (
              <div key={service._id} className="bg-white border-2 border-blue-900 rounded-sm overflow-hidden shadow-lg group">
                <div className="h-48 bg-gray-100 relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(service.location)}&output=embed`}
                    allowFullScreen
                    title={service.location}
                    className="grayscale group-hover:grayscale-0 transition-all duration-500"
                  ></iframe>
                  <div className="absolute inset-0 bg-blue-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="bg-white text-blue-900 px-4 py-2 text-xs font-black uppercase shadow-xl border-2 border-blue-900">
                      Abrir no Google Maps
                    </span>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                  ></a>
                </div>
                <div className="p-4 border-t-2 border-blue-900">
                  <div className="flex justify-between items-start mb-4">
                    <div onClick={() => setSelectedService(service)} className="cursor-pointer">
                      <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{service.client?.fantasyName}</p>
                      <h4 className="text-sm font-black text-gray-900 uppercase hover:text-blue-700 transition-colors">{service.title}</h4>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setServiceToEdit(service); setShowForm(true); }} className="p-1.5 hover:bg-blue-50 rounded-sm text-blue-900"><Pencil size={14} /></button>
                      <button onClick={() => handleDeleteService(service._id)} className="p-1.5 hover:bg-red-50 rounded-sm text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="space-y-2 text-[11px] font-bold text-gray-600 uppercase">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-blue-900" />
                      <span>{service.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-blue-900" />
                      <span>{service.equipments?.length || 0} Equipamento(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-blue-900" />
                      <span>{service.operators?.length || 0} Operador(es)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          
          {services.filter(s => s.status === 'in_progress').length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Nenhuma operação ativa no momento para exibição no mapa.</p>
            </div>
          )}
        </div>
      ) : (
        loading ? (
          <div className="text-center py-20 font-bold uppercase text-gray-400 tracking-widest">Carregando painel operacional...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col h-full">
                <div className={`p-4 border-b-2 ${
                  column.id === 'pending' ? 'border-gray-400' : 
                  column.id === 'in_progress' ? 'border-blue-600' : 'border-green-600'
                } bg-white mb-4 flex justify-between items-center`}>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    {column.icon} {column.title}
                  </h3>
                  <span className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {filteredServices.filter(s => s.status === column.id).length}
                  </span>
                </div>

                <div className={`flex-1 space-y-4 rounded-sm p-2 min-h-[500px] ${column.color}/30 border border-dashed border-gray-200`}>
                  {filteredServices
                    .filter((service) => service.status === column.id)
                    .map((service) => (
                      <div key={service._id} className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-3">
                          <div onClick={() => setSelectedService(service)} className="cursor-pointer flex-1">
                            <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1">
                              {service.client?.fantasyName || 'Cliente não identificado'}
                            </p>
                            <h4 className="text-sm font-black text-gray-900 uppercase leading-tight group-hover:text-blue-700 transition-colors">
                              {service.title}
                            </h4>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setServiceToEdit(service); setShowForm(true); }} className="p-1 text-blue-900 hover:bg-blue-50 rounded-sm"><Pencil size={12} /></button>
                            <button onClick={() => handleDeleteService(service._id)} className="p-1 text-red-600 hover:bg-red-50 rounded-sm"><Trash2 size={12} /></button>
                          </div>
                        </div>

                        {service.occurrences?.length > 0 && (
                          <div className="absolute right-4 top-12 bg-red-50 text-red-600 px-2 py-1 rounded-sm flex items-center gap-1 animate-pulse">
                            <AlertTriangle size={12} />
                            <span className="text-[10px] font-black">{service.occurrences.length}</span>
                          </div>
                        )}

                        <div className="space-y-2 mb-4 border-l-2 border-gray-100 pl-3">
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter hover:text-blue-700 transition-colors group/loc"
                          >
                            <MapPin size={12} className="shrink-0 text-blue-900" /> 
                            <span className="truncate">{service.location}</span>
                            <ExternalLink size={10} className="opacity-0 group-hover/loc:opacity-100 transition-opacity" />
                          </a>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase">
                            <Truck size={12} className="shrink-0 text-blue-900" /> 
                            <span>{service.equipments?.length || 0} Equipamento(s)</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                            <Users size={12} className="shrink-0 text-blue-900" /> 
                            <span>{service.operators?.length || 0} Operador(es)</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                            <Calendar size={12} className="shrink-0" /> 
                            <span>{new Date(service.startDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Occurrences Preview */}
                        {service.occurrences?.length > 0 && (
                          <div className="mb-4 space-y-1">
                            <div className="flex justify-between items-center">
                              <p className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1">
                                <MessageSquare size={10} /> Última Ocorrência:
                              </p>
                              <button 
                                onClick={() => setHistoryServiceId(service._id)}
                                className="text-[8px] font-black uppercase text-blue-900 hover:underline"
                              >
                                Ver Histórico ({service.occurrences.length})
                              </button>
                            </div>
                            <div className="bg-red-50/50 p-2 border-l-2 border-red-500 rounded-r-sm">
                              <p className="text-[10px] font-bold text-red-800 line-clamp-2 uppercase">
                                {service.occurrences[service.occurrences.length - 1].description}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-2 pt-3 border-t border-gray-50">
                          <button 
                            onClick={() => setSelectedService(service)}
                            className="w-full py-2 bg-gray-50 text-gray-600 text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <Info size={12} /> Detalhes do Serviço
                          </button>
                          {service.status === 'in_progress' && (
                            <button 
                              onClick={() => setOccurrenceServiceId(service._id)}
                              className="w-full py-2 border border-red-200 text-red-600 text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <AlertTriangle size={12} /> Registrar Ocorrência
                            </button>
                          )}

                          {service.status !== 'finished' && (
                            <>
                              {service.status === 'pending' && (
                                <button 
                                  onClick={() => handleUpdateStatus(service._id, 'in_progress')} 
                                  className="w-full py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Play size={12} /> Iniciar Operação
                                </button>
                              )}
                              {service.status === 'in_progress' && (
                                <button 
                                  onClick={() => handleUpdateStatus(service._id, 'finished')} 
                                  className="w-full py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <CheckCircle size={12} /> Finalizar Serviço
                                </button>
                              )}
                            </>
                          )}
                          
                          {service.status === 'finished' && (
                            <div className="flex items-center justify-center text-[9px] font-black text-green-600 uppercase tracking-widest py-2">
                              <CheckCircle size={12} className="mr-2" /> Concluído
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  
                  {filteredServices.filter(s => s.status === column.id).length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-sm">
                      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                        {hasActiveFilters ? 'Nenhum resultado' : 'Vazio'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default ServicesList;
