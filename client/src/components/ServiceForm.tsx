import React, { useState, useEffect } from 'react';
import { X, Clipboard, Truck, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  serviceToEdit?: any;
}

const ServiceForm: React.FC<Props> = ({ onClose, onSuccess, serviceToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    location: '',
    equipments: [] as string[],
    operators: [] as string[],
    startDate: new Date().toISOString().split('T')[0]
  });

  const [clients, setClients] = useState<any[]>([]);
  const [allEquipments, setAllEquipments] = useState<any[]>([]);
  const [allOperators, setAllOperators] = useState<any[]>([]);
  
  const [equipmentsValidation, setEquipmentsValidation] = useState<{[key: string]: {isValid: boolean, issues: string[]}}>({});
  const [operatorsValidation, setOperatorsValidation] = useState<{[key: string]: {isValid: boolean, issues: string[]}}>({});
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, eRes, oRes] = await Promise.all([
          api.get('/clients'),
          api.get('/equipments'),
          api.get('/operators')
        ]);
        setClients(cRes.data);
        setAllEquipments(eRes.data);
        setAllOperators(oRes.data);

        if (serviceToEdit) {
          setFormData({
            title: serviceToEdit.title,
            clientId: serviceToEdit.clientId?._id || serviceToEdit.clientId,
            location: serviceToEdit.location,
            equipments: serviceToEdit.equipments?.map((e: any) => e._id || e) || [],
            operators: serviceToEdit.operators?.map((o: any) => o._id || o) || [],
            startDate: new Date(serviceToEdit.startDate).toISOString().split('T')[0]
          });
        }
      } catch (err) {
        console.error('Erro ao carregar dados para o serviço');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [serviceToEdit]);

  const validateEquipment = async (clientId: string, equipmentId: string) => {
    if (!clientId || !equipmentId) return;
    try {
      const res = await api.post('/services/validate-equipment', { clientId, equipmentId });
      setEquipmentsValidation(prev => ({ ...prev, [equipmentId]: res.data }));
    } catch (err) {
      console.error('Erro na validação do equipamento');
    }
  };

  const validateOperator = async (clientId: string, operatorId: string) => {
    if (!clientId || !operatorId) return;
    try {
      const res = await api.post('/services/validate-operator', { clientId, operatorId });
      setOperatorsValidation(prev => ({ ...prev, [operatorId]: res.data }));
    } catch (err) {
      console.error('Erro na validação do operador');
    }
  };

  useEffect(() => {
    if (formData.clientId && formData.equipments.length > 0) {
      formData.equipments.forEach(eqId => {
        if (!equipmentsValidation[eqId]) {
          validateEquipment(formData.clientId, eqId);
        }
      });
    }
  }, [formData.clientId, formData.equipments]);

  useEffect(() => {
    if (formData.clientId && formData.operators.length > 0) {
      formData.operators.forEach(opId => {
        if (!operatorsValidation[opId]) {
          validateOperator(formData.clientId, opId);
        }
      });
    }
  }, [formData.clientId, formData.operators]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if everything is valid
    const invalidEquipments = formData.equipments.some(eqId => equipmentsValidation[eqId] && !equipmentsValidation[eqId].isValid);
    if (invalidEquipments) {
      alert('Um ou mais equipamentos não atendem aos requisitos do cliente!');
      return;
    }

    const invalidOperators = formData.operators.some(opId => operatorsValidation[opId] && !operatorsValidation[opId].isValid);
    if (invalidOperators) {
      alert('Um ou mais operadores não atendem aos requisitos do cliente!');
      return;
    }

    setLoading(true);
    try {
      if (serviceToEdit) {
        await api.put(`/services/${serviceToEdit._id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar serviço');
    } finally {
      setLoading(false);
    }
  };

  const toggleEquipment = (id: string) => {
    if (!id) return;
    setFormData(prev => {
      const equipments = prev.equipments.includes(id)
        ? prev.equipments.filter(eqId => eqId !== id)
        : [...prev.equipments, id];
      return { ...prev, equipments };
    });
  };

  const toggleOperator = (id: string) => {
    if (!id) return;
    setFormData(prev => {
      const operators = prev.operators.includes(id)
        ? prev.operators.filter(opId => opId !== id)
        : [...prev.operators, id];
      return { ...prev, operators };
    });
  };

  if (loadingData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-sm w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-black uppercase text-blue-900 flex items-center gap-2">
            <Clipboard size={20} /> {serviceToEdit ? 'Editar Serviço' : 'Novo Serviço'}
          </h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Título do Serviço</label>
              <input type="text" className="w-full border p-3 text-sm font-bold uppercase focus:border-blue-900 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Cliente</label>
              <select className="w-full border p-3 text-sm font-bold uppercase focus:border-blue-900 outline-none" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} required>
                <option value="">Selecione o Cliente</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.fantasyName}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Localização</label>
              <input type="text" className="w-full border p-3 text-sm font-bold uppercase focus:border-blue-900 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Data de Início</label>
              <input type="date" className="w-full border p-3 text-sm font-bold focus:border-blue-900 outline-none" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-900 border-b pb-2 flex items-center gap-2">
              <Truck size={16} /> Equipamentos Selecionados ({formData.equipments.length})
            </h4>
            <select 
              className="w-full border p-3 text-sm font-bold uppercase focus:border-blue-900 outline-none bg-gray-50"
              onChange={e => toggleEquipment(e.target.value)}
              value=""
            >
              <option value="">Adicionar Equipamento...</option>
              {allEquipments
                .filter(eq => !formData.equipments.includes(eq._id))
                .map(e => <option key={e._id} value={e._id}>{e.name} ({e.serialNumber})</option>)}
            </select>
            
            <div className="grid grid-cols-1 gap-3">
              {formData.equipments.map(eqId => {
                const eq = allEquipments.find(e => e._id === eqId);
                const validation = equipmentsValidation[eqId];
                return (
                  <div key={eqId} className="border border-gray-100 p-4 rounded-sm bg-white shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-900 text-white p-2 rounded-sm"><Truck size={14} /></div>
                        <div>
                          <p className="text-xs font-black uppercase">{eq?.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{eq?.brand} • {eq?.serialNumber}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => toggleEquipment(eqId)} className="text-gray-400 hover:text-red-600 transition-colors">
                        <X size={16} />
                      </button>
                    </div>

                    {validation && (
                      <div className={`p-3 rounded-sm border ${validation.isValid ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {validation.isValid ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {validation.isValid ? 'Apto' : 'Pendências'}
                          </span>
                        </div>
                        {!validation.isValid && (
                          <ul className="text-[10px] font-bold space-y-0.5 ml-5 list-disc uppercase">
                            {validation.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-900 border-b pb-2 flex items-center gap-2">
              <Users size={16} /> Operadores Selecionados ({formData.operators.length})
            </h4>
            <select 
              className="w-full border p-3 text-sm font-bold uppercase focus:border-blue-900 outline-none bg-gray-50"
              onChange={e => toggleOperator(e.target.value)}
              value=""
            >
              <option value="">Adicionar Operador...</option>
              {allOperators
                .filter(op => !formData.operators.includes(op._id))
                .map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
            </select>

            <div className="grid grid-cols-1 gap-3">
              {formData.operators.map(opId => {
                const op = allOperators.find(o => o._id === opId);
                const validation = operatorsValidation[opId];
                return (
                  <div key={opId} className="border border-gray-100 p-4 rounded-sm bg-white shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-900 text-white p-2 rounded-sm"><Users size={14} /></div>
                        <div>
                          <p className="text-xs font-black uppercase">{op?.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{op?.role || 'Operador'}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => toggleOperator(opId)} className="text-gray-400 hover:text-red-600 transition-colors">
                        <X size={16} />
                      </button>
                    </div>

                    {validation && (
                      <div className={`p-3 rounded-sm border ${validation.isValid ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {validation.isValid ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {validation.isValid ? 'Apto' : 'Pendências'}
                          </span>
                        </div>
                        {!validation.isValid && (
                          <ul className="text-[10px] font-bold space-y-0.5 ml-5 list-disc uppercase">
                            {validation.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full py-4 bg-blue-900 text-white font-black uppercase text-xs tracking-[0.2em] transition-colors hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 shadow-lg"
          >
            {loading ? 'Salvando...' : serviceToEdit ? 'Salvar Alterações' : 'Criar Serviço'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
