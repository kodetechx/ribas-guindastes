import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import api from '../services/api';
import ImageUploader from './ImageUploader';

interface Props {
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const OperatorForm: React.FC<Props> = ({ initialData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '', email: '', registrationNumber: '', role: 'operator'
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value as any));
    if (avatar) data.append('file', avatar);

    try {
      if (initialData) await api.put(`/operators/${initialData._id}`, formData);
      else await api.post('/operators', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Erro ao salvar operador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-sm w-full max-w-lg shadow-xl fade-in">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black uppercase tracking-tight text-blue-900 flex items-center gap-2">
            <UserPlus size={20} /> {initialData ? 'Editar Operador' : 'Novo Operador'}
          </h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ImageUploader onImageChange={setAvatar} currentImage={initialData?.avatarUrl} />
          <input type="text" placeholder="Nome Completo" className="w-full border p-2 text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="E-mail" className="w-full border p-2 text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="text" placeholder="Matrícula" className="w-full border p-2 text-sm" value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} required />
          <select className="w-full border p-2 text-sm" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
            <option value="operator">Operador</option>
            <option value="manager">Gestor</option>
            <option value="admin">Administrador</option>
          </select>
          <button disabled={loading} className="w-full bg-blue-900 text-white py-3 font-bold uppercase text-[10px] tracking-widest hover:bg-blue-800 transition-colors">Salvar</button>
        </form>
      </div>
    </div>
  );
};

export default OperatorForm;
