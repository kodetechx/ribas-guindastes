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
  const [items, setItems] = useState<any[]>(
    CHECKLIST_ITEMS.map(label => ({ label, status: 'ok', observation: '' }))
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await api.get(`/equipments/${id}`);
        setEquipment(response.data);
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
    <div className="max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
          &larr; Voltar
        </button>
        <h2 className="text-3xl font-extrabold tracking-tight">Checklist Diário</h2>
      </div>

      <div className="bg-industrial-gray/20 border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-industrial-yellow/10 text-industrial-yellow rounded-lg">
            <ClipboardCheck size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{equipment.name}</h3>
            <p className="text-gray-400">{equipment.brand} {equipment.model} • S/N: {equipment.serialNumber}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-industrial-gray/10 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-industrial-gray/30">
              <tr>
                <th className="p-4 font-bold text-sm uppercase">Item de Inspeção</th>
                <th className="p-4 font-bold text-sm uppercase text-center w-48">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-industrial-gray/5">
                  <td className="p-4">
                    <p className="font-medium">{item.label}</p>
                    {item.status === 'not_ok' && (
                      <input
                        type="text"
                        placeholder="Descreva o problema..."
                        className="mt-2 w-full bg-red-500/5 border border-red-500/20 rounded px-2 py-1 text-sm"
                        value={item.observation}
                        onChange={(e) => handleObservationChange(index, e.target.value)}
                        required
                      />
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(index, 'ok')}
                        className={`p-2 rounded ${item.status === 'ok' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'}`}
                        title="OK"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(index, 'not_ok')}
                        className={`p-2 rounded ${item.status === 'not_ok' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-500'}`}
                        title="Não Conforme"
                      >
                        <X size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(index, 'na')}
                        className={`p-2 rounded ${item.status === 'na' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'}`}
                        title="N/A"
                      >
                        <span className="text-[10px] font-bold">N/A</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-gray-500">Observações Gerais</label>
          <textarea
            className="w-full bg-industrial-gray/20 border border-gray-800 rounded-lg p-4 focus:outline-none focus:border-industrial-yellow/50"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alguma observação adicional sobre o equipamento?"
          ></textarea>
        </div>

        {items.some(i => i.status === 'not_ok') && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex gap-3">
            <AlertTriangle className="text-red-500 shrink-0" />
            <div>
              <p className="text-red-500 font-bold">Atenção!</p>
              <p className="text-red-500/80 text-sm">Existem itens não conformes. O equipamento poderá ser bloqueado para uso.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded flex gap-3 animate-pulse">
            <AlertTriangle className="text-red-500 shrink-0" />
            <div>
              <p className="text-red-500 font-bold">Bloqueio de Segurança</p>
              <p className="text-red-500/80 text-sm">{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!!error && error.includes('bloqueada')}
          className={`w-full py-4 bg-industrial-yellow text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 ${
            error && error.includes('bloqueada') ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Check size={20} />
          Finalizar e Enviar Checklist
        </button>
      </form>
    </div>
  );
};

export default ChecklistExecution;
