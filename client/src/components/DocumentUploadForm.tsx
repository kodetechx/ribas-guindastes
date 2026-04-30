import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Calendar } from 'lucide-react';
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
        // Edit mode (only metadata, changing file would be a new upload usually)
        await api.put(`/documents/${initialData._id}`, formData);
      } else {
        // Create mode
        if (!file) {
          setError('POR_FAVOR_SELECIONE_UM_ARQUIVO');
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

        await api.post('/documents', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'ERRO_AO_SALVAR_DOCUMENTO');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white border border-black w-full max-w-md shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] fade-in">
        <div className="p-6 border-b border-black flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black text-white">
              <FileText size={18} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">
              {initialData ? 'Editar_Registro' : 'Novo_Documento'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-600 text-red-700 text-[10px] font-technical font-bold uppercase">
              {error}
            </div>
          )}

          {!initialData && (
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400">Seleção_de_Arquivo (.pdf, .jpg, .png)</label>
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full bg-white border border-gray-200 p-3 text-[10px] font-technical cursor-pointer file:hidden hover:border-black transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-hover:text-black">
                  <Upload size={14} />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400">Identificação_Documento</label>
              <input
                type="text"
                required
                placeholder="NOME_EX: CERTIFICADO_NR35_JOAO"
                className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-xs font-technical font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-black transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400">Categoria_Tipo</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-xs font-technical font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-black transition-all"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="CNH">CNH_HABILITACAO</option>
                  <option value="Certificação NR-11">NR-11_MOVIMENTACAO</option>
                  <option value="Certificação NR-12">NR-12_MAQUINAS</option>
                  <option value="Certificação NR-35">NR-35_ALTURA</option>
                  <option value="Documento do Veículo">DOC_VEICULO</option>
                  <option value="Certificado">CERTIFICADO_GERAL</option>
                  <option value="Manual">MANUAL_TECNICO</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400">Data_Expiracao (Opcional)</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-xs font-technical font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-black transition-all"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                  <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-black text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-50 transition-all"
            >
              Abordar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-industrial-dark text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-industrial-yellow hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none disabled:opacity-50"
            >
              {loading ? 'PROCESSANDO...' : 'EXECUTAR_REGISTRO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Upload = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);

export default DocumentUploadForm;
