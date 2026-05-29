import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Check, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const CHECKLIST_ITEMS = [
  "Nível de óleo do motor",
  "Nível de líquido de arrefecimento",
  "Estado dos pneus / lagartas",
  "Funcionamento dos freios",
  "Iluminação e sinalização",
  "Dispositivos de segurança (botão de emergência, etc.)",
  "Integridade estrutural (trincas, vazamentos)",
  "Painel de instrumentos",
  "Sinal sonoro de ré",
  "Extintor de incêndio"
];

const ChecklistExecution = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await api.get(`/equipments/${id}`);
        const eq = response.data;
        setEquipment(eq);

        let checklistItems = CHECKLIST_ITEMS.map(label => ({ label, status: 'ok', observation: '' }));

        if (eq.checklistTemplateId) {
          try {
            const templateRes = await api.get(`/checklist-templates/${eq.checklistTemplateId}`);
            if (templateRes.data && templateRes.data.items) {
              checklistItems = templateRes.data.items.map((item: any) => ({
                label: item.label,
                status: 'ok',
                observation: ''
              }));
            }
          } catch (tErr) {
            console.error('Erro ao carregar template, usando padrão');
          }
        }
        
        setItems(checklistItems);
      } catch (err) {
        setError('Equipamento não encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id]);

  const handleStatusChange = (index: number, status: 'ok' | 'not_ok' | 'na') => {
    const newItems = [...items];
    newItems[index].status = status;
    setItems(newItems);
  };

  const handleObservationChange = (index: number, observation: string) => {
    const newItems = [...items];
    newItems[index].observation = observation;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const isApproved = items.every(item => item.status !== 'not_ok');

    try {
      await api.post('/checklists', {
        equipment: id,
        items,
        isApproved,
        notes
      });
      alert('Checklist enviado com sucesso!');
      navigate('/equipamentos');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar checklist');
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!equipment) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="fade-in max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-10 border-b border-gray-200 pb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-blue-900 transition-colors">
          &larr; Voltar
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Checklist Diário</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Inspeção de Segurança Obrigatória</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-blue-50 text-blue-900 rounded-sm">
            <ClipboardCheck size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-blue-900 uppercase">{equipment.name}</h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {equipment.brand} {equipment.equipmentModel} • S/N: {equipment.serialNumber}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-black text-[10px] uppercase text-gray-400 tracking-widest">Item de Inspeção</th>
                <th className="p-4 font-black text-[10px] uppercase text-gray-400 tracking-widest text-center w-48">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">{item.label}</p>
                    {item.status === 'not_ok' && (
                      <input
                        type="text"
                        placeholder="Descreva o problema observado..."
                        className="mt-3 w-full bg-red-50 border border-red-100 rounded-sm px-3 py-2 text-[11px] font-medium outline-none focus:border-red-300"
                        value={item.observation}
                        onChange={(e) => handleObservationChange(index, e.target.value)}
                        required
                      />
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(index, 'ok')}
                        className={`p-2 rounded-sm transition-all ${item.status === 'ok' ? 'bg-green-600 text-white shadow-md scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        title="OK"
                      >
                        <Check size={16} strokeWidth={3} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(index, 'not_ok')}
                        className={`p-2 rounded-sm transition-all ${item.status === 'not_ok' ? 'bg-red-600 text-white shadow-md scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        title="Não Conforme"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(index, 'na')}
                        className={`p-2 rounded-sm transition-all ${item.status === 'na' ? 'bg-blue-900 text-white shadow-md scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        title="N/A"
                      >
                        <span className="text-[9px] font-black">N/A</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-gray-400">Observações Gerais</label>
          <textarea
            className="w-full bg-white border border-gray-200 rounded-sm p-4 text-sm focus:outline-none focus:border-blue-900 transition-colors shadow-sm"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Relate aqui qualquer observação adicional relevante para a segurança..."
          ></textarea>
        </div>

        {items.some(i => i.status === 'not_ok') && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex gap-4 animate-pulse">
            <AlertTriangle className="text-red-600 shrink-0" size={20} />
            <div>
              <p className="text-red-900 text-xs font-black uppercase tracking-tight">Alerta de Segurança</p>
              <p className="text-red-700 text-[11px] font-bold uppercase mt-1">Existem itens não conformes. O equipamento será bloqueado para uso imediato.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 text-white p-4 rounded-sm flex gap-4 shadow-lg">
            <AlertTriangle className="shrink-0" size={20} />
            <div>
              <p className="text-[10px] font-black uppercase opacity-60">Erro no Envio</p>
              <p className="text-xs font-bold uppercase">{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!!error && error.includes('bloqueada')}
          className={`w-full py-5 bg-blue-900 text-white font-black rounded-sm hover:bg-blue-800 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl ${
            error && error.includes('bloqueada') ? 'opacity-50 cursor-not-allowed grayscale' : ''
          }`}
        >
          <Check size={18} strokeWidth={3} />
          Finalizar e Enviar Checklist
        </button>
      </form>
    </div>
  );
};

export default ChecklistExecution;
