import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

interface Props {
  ownerId: string;
  category: 'operator' | 'equipment';
}

const DocumentManager: React.FC<Props> = ({ ownerId, category }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    try {
      const res = await api.get(`/documents/${category}/${ownerId}`);
      setDocuments(res.data);
    } catch (err) {
      console.error('Erro ao buscar documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, [ownerId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ownerId', ownerId);
    formData.append('category', category);
    formData.append('name', file.name);
    formData.append('type', 'Certificado'); // Simplificado para exemplo

    try {
      await api.post('/documents', formData);
      fetchDocs();
    } catch (err) {
      alert('Erro ao fazer upload');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-900 flex items-center gap-2">
          <FileText size={16} /> Documentação Técnica
        </h3>
        <label className="btn-industrial btn-secondary cursor-pointer text-[10px]">
          <Upload size={14} /> Adicionar
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {loading ? <div className="text-xs text-gray-400">Carregando...</div> : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-sm">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-800 uppercase">{doc.name}</p>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">{doc.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={api.defaults.baseURL + doc.fileUrl} target="_blank" className="p-1.5 text-gray-400 hover:text-blue-900 transition-colors">
                  <Download size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
