import React, { useState } from 'react';
import { X, Save, Calendar, Tool } from 'lucide-react';
import api from '../services/api';

interface MaintenanceFormProps {
  equipmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ equipmentId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'preventive',
    description: '',
    cost: 0,
    mechanic: '',
    nextMaintenanceDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/maintenances', {
        ...formData,
        equipment: equipmentId,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar manutenção');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-sm w-full max-w-lg shadow-xl fade-in">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black uppercase tracking-tight text-blue-900 flex items-center gap-2">
            <Tool size={20} />
            Registrar Manutenção
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-bold border border-red-100 rounded-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Data</label>
              <input
                type="date"
                required
                className="w-full border border-gray-200 rounded-sm p-2 text-sm focus:outline-none focus:border-blue-900"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tipo</label>
              <select
                className="w-full border border-gray-200 rounded-sm p-2 text-sm focus:outline-none focus:border-blue-900"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="preventive">Preventiva</option>
                <option value="corrective">Corretiva</option>
                <option value="inspection">Inspeção</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Mecânico Responsável</label>
            <input
              type="text"
              required
              placeholder="Nome do mecânico ou oficina"
              className="w-full border border-gray-200 rounded-sm p-2 text-sm focus:outline-none focus:border-blue-900"
              value={formData.mechanic}
              onChange={(e) => setFormData({ ...formData, mechanic: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Descrição dos Serviços</label>
            <textarea
              required
              rows={3}
              placeholder="Descreva o que foi feito..."
              className="w-full border border-gray-200 rounded-sm p-2 text-sm focus:outline-none focus:border-blue-900"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Custo (R$)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 rounded-sm p-2 text-sm focus:outline-none focus:border-blue-900"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Próxima Manut.</label>
              <input
                type="date"
                required
                className="w-full border border-gray-200 rounded-sm p-2 text-sm focus:outline-none focus:border-blue-900"
                value={formData.nextMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 rounded-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-900 text-white font-bold uppercase text-[10px] tracking-widest hover:bg-blue-800 rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Salvando...' : 'Salvar Manutenção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;
