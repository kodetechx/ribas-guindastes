import React, { useState } from 'react';
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
    name: '', brand: '', model: '', year: new Date().getFullYear(), serialNumber: '', status: 'active'
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value as any));
    if (image) data.append('file', image);

    try {
      if (initialData) await api.put(`/equipments/${initialData._id}`, formData);
      else await api.post('/equipments', data, { headers: { 'Content-Type': 'multipart/form-data' } });
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
          <input type="text" placeholder="Modelo" className="w-full border p-2 text-sm" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} required />
          <input type="number" placeholder="Ano" className="w-full border p-2 text-sm" value={formData.year} onChange={(e) => setFormData({...formData, year: Number(e.target.value)})} required />
          <input type="text" placeholder="Número de Série" className="w-full border p-2 text-sm" value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} required />
          <button disabled={loading} className="w-full bg-blue-900 text-white py-3 font-bold uppercase text-[10px] tracking-widest hover:bg-blue-800 transition-colors">Salvar</button>
        </form>
      </div>
    </div>
  );
};

export default EquipmentForm;
