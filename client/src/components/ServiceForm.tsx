import React, { useState, useEffect } from 'react';
import { X, Clipboard, Truck, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const ServiceForm: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    location: '',
    equipment: '',
    operators: [] as string[],
    startDate: new Date().toISOString().split('T')[0]
  });

  const [clients, setClients] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  
  const [equipmentValidation, setEquipmentValidation] = useState<{isValid: boolean, issues: string[]} | null>(null);
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
        setEquipments(eRes.data);
        setOperators(oRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados para o serviço');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const validateEquipment = async (clientId: string, equipmentId: string) => {
    if (!clientId || !equipmentId) return;
    try {
      const res = await api.post('/services/validate-equipment', { clientId, equipmentId });
      setEquipmentValidation(res.data);
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
    if (formData.clientId && formData.equipment) {
      validateEquipment(formData.clientId, formData.equipment);
    } else {
      setEquipmentValidation(null);
    }
  }, [formData.clientId, formData.equipment]);

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
    if (equipmentValidation && !equipmentValidation.isValid) {
      alert('Equipamento não atende aos requisitos do cliente!');
      return;
    }

    const invalidOperators = formData.operators.some(opId => operatorsValidation[opId] && !operatorsValidation[opId].isValid);
    if (invalidOperators) {
      alert('Um ou mais operadores não atendem aos requisitos do cliente!');
      return;
    }

    setLoading(true);
    try {
      await api.post('/services', formData);
      onSuccess();
      onClose();
    } catch (err) {
      alert('Erro ao salvar serviço');
    } finally {
      setLoading(false);
    }
  };

  const toggleOperator = (id: string) => {
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
            <Clipboard size={20} /> Novo Serviço
          </h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Título do Serviço</label>
              <input type="text" className="w-full border p-3 text-sm font-bold uppercase" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Cliente</label>
              <select className="w-full border p-3 text-sm font-bold uppercase" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} required>
                <option value="">Selecione o Cliente</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.fantasyName}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Localização</label>
              <input type="text" className="w-full border p-3 text-sm font-bold uppercase" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Data de Início</label>
              <input type="date" className="w-full border p-3 text-sm font-bold" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-900 border-b pb-2 flex items-center gap-2">
              <Truck size={16} /> Equipamento
            </h4>
            <select className="w-full border p-3 text-sm font-bold uppercase" value={formData.equipment} onChange={e => setFormData({...formData, equipment: e.target.value})} required>
              <option value="">Selecione o Equipamento</option>
              {equipments.map(e => <option key={e._id} value={e._id}>{e.name} ({e.serialNumber})</option>)}
            </select>
            
            {equipmentValidation && (
              <div className={`p-4 rounded-sm border ${equipmentValidation.isValid ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {equipmentValidation.isValid ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {equipmentValidation.isValid ? 'Equipamento Apto' : 'Restrições Encontradas'}
                  </span>
                </div>
                {!equipmentValidation.isValid && (
                  <ul className="text-[11px] font-bold space-y-1 ml-6 list-disc uppercase">
                    {equipmentValidation.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-900 border-b pb-2 flex items-center gap-2">
              <Users size={16} /> Operadores
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
              {operators.map(op => {
                const isSelected = formData.operators.includes(op._id);
                const validation = operatorsValidation[op._id];
                return (
                  <div 
                    key={op._id} 
                    onClick={() => toggleOperator(op._id)}
                    className={`p-3 border rounded-sm cursor-pointer transition-all ${isSelected ? 'border-blue-900 bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase">{op.name}</span>
                      {isSelected && validation && (
                        validation.isValid ? <CheckCircle size={14} className="text-green-600" /> : <AlertTriangle size={14} className="text-red-600" />
                      )}
                    </div>
                    {isSelected && validation && !validation.isValid && (
                      <p className="text-[9px] text-red-700 font-bold mt-1 uppercase">Requisitos Pendentes</p>
                    )}
                  </div>
                );
              })}
            </div>
            
            {formData.operators.length > 0 && (
              <div className="space-y-2">
                {formData.operators.map(opId => {
                  const validation = operatorsValidation[opId];
                  if (validation && !validation.isValid) {
                    const op = operators.find(o => o._id === opId);
                    return (
                      <div key={opId} className="bg-red-50 border border-red-100 p-3 text-red-800 rounded-sm">
                        <p className="text-[10px] font-black uppercase mb-1">Pendências: {op?.name}</p>
                        <ul className="text-[10px] font-bold ml-4 list-disc uppercase">
                          {validation.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                        </ul>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          <button 
            disabled={loading || (equipmentValidation && !equipmentValidation.isValid)} 
            className={`w-full py-4 font-black uppercase text-xs tracking-[0.2em] transition-colors ${
              (equipmentValidation && !equipmentValidation.isValid) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}
          >
            {loading ? 'Salvando...' : 'Criar Serviço'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
