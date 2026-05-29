import React, { useState, useEffect } from 'react';
import { X, Wrench } from 'lucide-react';
import api from '../services/api';
import ImageUploader from './ImageUploader';

interface Props {
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EquipmentForm: React.FC<Props> = ({ initialData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '', brand: '', equipmentModel: '', year: new Date().getFullYear(), serialNumber: '', status: 'active', checklistTemplateId: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/checklist-templates');
        setTemplates(res.data);
      } catch (err) {
        console.error('Erro ao buscar templates de checklist');
      }
    };
    fetchTemplates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        data.append(key, value as any);
      }
    });
    if (image) data.append('file', image);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (initialData) {
        await api.put(`/equipments/${initialData._id}`, data, config);
      } else {
        await api.post('/equipments', data, config);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert('Erro ao salvar equipamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-sm w-full max-w-lg shadow-xl fade-in">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black uppercase tracking-tight text-blue-900 flex items-center gap-2">
            <Wrench size={20} /> {initialData ? 'Editar Equipamento' : 'Novo Equipamento'}
          </h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ImageUploader onImageChange={setImage} currentImage={initialData?.imageUrl} />
          <input type="text" placeholder="Nome" className="w-full border p-2 text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="text" placeholder="Marca" className="w-full border p-2 text-sm" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} required />
          <input type="text" placeholder="Modelo" className="w-full border p-2 text-sm" value={formData.equipmentModel} onChange={(e) => setFormData({...formData, equipmentModel: e.target.value})} required />
          <input type="number" placeholder="Ano" className="w-full border p-2 text-sm" value={formData.year} onChange={(e) => setFormData({...formData, year: Number(e.target.value)})} required />
          <input type="text" placeholder="Número de Série" className="w-full border p-2 text-sm" value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} required />
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Template de Checklist</label>
            <select 
              className="w-full border p-2 text-sm font-bold" 
              value={formData.checklistTemplateId} 
              onChange={(e) => setFormData({...formData, checklistTemplateId: e.target.value})}
            >
              <option value="">Nenhum (Usar Padrão)</option>
              {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>

          <button disabled={loading} className="w-full bg-blue-900 text-white py-3 font-bold uppercase text-[10px] tracking-widest hover:bg-blue-800 transition-colors">Salvar</button>
        </form>
      </div>
    </div>
  );
};

export default EquipmentForm;
