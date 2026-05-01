import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Download, Edit, AlertTriangle, CheckCircle, Clock, ExternalLink, Database, Search } from 'lucide-react';
import api from '../services/api';
import DocumentUploadForm from './DocumentUploadForm';

interface Props {
  ownerId: string;
  category: 'operator' | 'equipment';
  onUploadSuccess?: () => void;
}

const DocumentManager: React.FC<Props> = ({ ownerId, category, onUploadSuccess }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/documents/${category}/${ownerId}`);
      setDocuments(res.data);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Erro ao buscar documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [ownerId]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este documento?')) {
      try {
        await api.delete(`/documents/${id}`);
        fetchDocs();
      } catch (err) {
        alert('Erro ao excluir documento');
      }
    }
  };

  const handleEdit = (doc: any) => {
    setEditingDoc(doc);
    setShowForm(true);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-900 flex items-center gap-2">
          <FileText size={16} />
          Repositório de Documentos
        </h3>
        <button 
          onClick={() => { setEditingDoc(null); setShowForm(true); }}
          className="px-4 py-2 bg-blue-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-blue-800 transition-colors"
        >
          Novo Registro
        </button>
      </div>

      {showForm && (
        <DocumentUploadForm 
          initialData={editingDoc} 
          ownerId={ownerId} 
          category={category} 
          onClose={() => setShowForm(false)} 
          onSuccess={fetchDocs} 
        />
      )}

      <div className="p-6">
        {loading ? (
          <div className="text-center py-10 text-xs font-bold text-gray-400">Carregando...</div>
        ) : documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-sm hover:border-gray-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${doc.status === 'expired' ? 'bg-red-500' : doc.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-800 uppercase">{doc.name}</p>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">{doc.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-mono font-bold text-gray-500">
                    Vencimento: {doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString() : '---'}
                  </span>
                  <div className="flex items-center gap-1">
                    <a 
                      href={api.defaults.baseURL?.replace('/api', '') + doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-blue-900 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button onClick={() => handleEdit(doc)} className="p-1.5 text-gray-400 hover:text-blue-900 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(doc._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-sm">
            <p className="text-gray-400 text-xs font-bold uppercase italic">Nenhum documento registrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManager;
