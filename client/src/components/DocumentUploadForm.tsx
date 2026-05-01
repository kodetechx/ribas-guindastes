import React, { useState } from 'react';
import { X, FileText, Calendar, Upload } from 'lucide-react';
import api from '../services/api';

interface Props {
  initialData?: any;
  ownerId: string;
  category: 'operator' | 'equipment';
  onClose: () => void;
  onSuccess: () => void;
}

const DocumentUploadForm: React.FC<Props> = ({ initialData, ownerId, category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'Certificado',
    expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().split('T')[0] : '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (initialData) {
        await api.put(`/documents/${initialData._id}`, formData);
      } else {
        if (!file) {
          setError('Selecione um arquivo');
          setLoading(false);
          return;
        }

        const data = new FormData();
        data.append('file', file);
        data.append('ownerId', ownerId);
        data.append('category', category);
        data.append('name', formData.name);
        data.append('type', formData.type);
        if (formData.expiresAt) data.append('expiresAt', formData.expiresAt);

        await api.post('/documents', data);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-sm w-full max-w-lg shadow-xl fade-in">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black uppercase tracking-tight text-blue-900 flex items-center gap-2">
            <FileText size={20} />
            {initialData ? 'Editar Documento' : 'Novo Documento'}
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

          {!initialData && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Arquivo (.pdf, .jpg, .png)</label>
              <input
                type="file"
                accept=".pdf,image/*"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full border border-gray-200 rounded-sm p-2 text-sm focus:outline-none focus:border-blue-900 file:mr-4 file:py-1 file:px-2 file:border-0 file:bg-gray-100 file:rounded-sm file:text-[10px] file:font-bold"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Nome do Documento</label>
            <input
              type="text"
              required
              placeholder="Ex: Certificado NR-35"
              className="w-full border border-gray-200 rounded-sm p-2 text-sm focus:outline-none focus:border-blue-900"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tipo</label>
              <select
                className="w-full border border-gray-200 rounded-sm p-2 text-sm focus:outline-none focus:border-blue-900"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="CNH">CNH</option>
                <option value="Certificação NR-11">NR-11</option>
                <option value="Certificação NR-12">NR-12</option>
                <option value="Certificação NR-35">NR-35</option>
                <option value="Documento do Veículo">Doc. Veículo</option>
                <option value="Certificado">Certificado Geral</option>
                <option value="Manual">Manual Técnico</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Validade</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-sm p-2 text-sm focus:outline-none focus:border-blue-900"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
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
              className="flex-1 py-3 bg-blue-900 text-white font-bold uppercase text-[10px] tracking-widest hover:bg-blue-800 rounded-sm transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar Documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadForm;
