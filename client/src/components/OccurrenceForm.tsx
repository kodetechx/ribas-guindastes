import React, { useState } from 'react';
import { X, AlertTriangle, Camera, Clock } from 'lucide-react';
import api from '../services/api';

interface Props {
  serviceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const OccurrenceForm: React.FC<Props> = ({ serviceId, onClose, onSuccess }) => {
  const [type, setType] = useState('weather');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming there's an endpoint to add an occurrence
      await api.post(`/services/${serviceId}/occurrences`, {
        type,
        description
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Erro ao registrar ocorrência');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-sm w-full max-w-md shadow-xl">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase text-red-600 flex items-center gap-2">
            <AlertTriangle size={18} /> Registrar Ocorrência
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Tipo de Interrupção</label>
            <select 
              className="w-full border p-3 text-xs font-bold uppercase bg-gray-50"
              value={type}
              onChange={e => setType(e.target.value)}
              required
            >
              <option value="weather">Condição Climática (Chuva/Vento)</option>
              <option value="equipment_failure">Falha no Equipamento</option>
              <option value="wait_for_client">Aguardando Liberação Cliente</option>
              <option value="safety_halt">Interrupção por Segurança</option>
              <option value="other">Outros</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Descrição Detalhada</label>
            <textarea 
              className="w-full border p-3 text-xs font-bold uppercase bg-gray-50 h-32"
              placeholder="Descreva o motivo da interrupção..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-sm">
            <p className="text-[9px] text-yellow-800 font-bold uppercase flex items-center gap-2">
              <Clock size={12} /> Esta ocorrência será registrada com data e hora atual para fins de auditoria.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
          >
            {loading ? 'Registrando...' : 'Salvar Ocorrência'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OccurrenceForm;
