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
      console.error('ERRO_AO_BUSCAR_DOCUMENTOS');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [ownerId]);

  const handleDelete = async (id: string) => {
    if (confirm('DETECÇÃO_DE_SEGURANÇA: CONFIRMAR EXCLUSÃO PERMANENTE DO REGISTRO?')) {
      try {
        await api.delete(`/documents/${id}`);
        fetchDocs();
      } catch (err) {
        alert('ERRO: FALHA_NA_PURGA');
      }
    }
  };

  const handleEdit = (doc: any) => {
    setEditingDoc(doc);
    setShowForm(true);
  };

  return (
    <div className="bg-white border border-black relative overflow-hidden transition-all duration-500">
      {/* Module Header - Technical Block */}
      <div className="bg-industrial-dark p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]">
            <Database size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] leading-none">
              Repositório de Documentação
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-industrial-yellow text-[10px] font-technical font-black uppercase tracking-widest bg-white/10 px-1.5 py-0.5">Sincronização_Ativa</span>
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => { setEditingDoc(null); setShowForm(true); }}
          className="btn-industrial bg-white text-black border-white hover:bg-industrial-yellow hover:border-industrial-yellow px-6 py-2 shadow-none"
        >
          <Upload size={14} strokeWidth={3} />
          <span>Novo Registro</span>
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

      {/* Internal Content Area */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-sm h-10 w-10 border-t-4 border-b-4 border-industrial-dark"></div>
            <span className="text-[10px] font-technical text-gray-400 uppercase font-black">Acessando_Dados...</span>
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => {
              const isExpired = doc.status === 'expired';
              const isWarning = doc.status === 'warning';
              const statusColor = isExpired ? 'bg-red-600' : isWarning ? 'bg-orange-500' : 'bg-black';
              
              return (
                <div key={doc._id} className="group relative bg-white border border-gray-100 transition-all duration-300 hover:border-black hover:translate-x-1">
                  {/* Status Indicator Stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor}`}></div>
                  
                  <div className="flex items-center justify-between p-5 pl-6">
                    <div className="flex items-center gap-6">
                      <div className={`p-3 ${statusColor} text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]`}>
                        <FileText size={18} strokeWidth={2.5} />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none">{doc.name}</p>
                          <span className="text-[8px] font-technical font-black text-gray-400 border border-gray-200 px-1.5 py-0.5 uppercase">{doc.mimeType.split('/')[1]}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-accent">
                            <Database size={10} strokeWidth={3} />
                            <span className="text-[9px] font-technical font-black uppercase tracking-tighter">{doc.type}</span>
                          </div>
                          <span className="text-gray-200 font-technical text-xs">|</span>
                          <div className="flex items-center gap-2">
                            <Clock size={10} className="text-gray-400" />
                            <span className={`text-[10px] font-technical font-bold uppercase ${isExpired ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-gray-500'}`}>
                              Vencimento: {doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString() : 'INDETERMINADO'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <a 
                        href={api.defaults.baseURL + doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-50 border border-black/5 text-gray-400 hover:text-black hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                        title="Ver_Arquivo"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button 
                        onClick={() => handleEdit(doc)}
                        className="p-2 bg-gray-50 border border-black/5 text-gray-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] transition-all"
                        title="Editar_Metadados"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc._id)}
                        className="p-2 bg-red-50 border border-red-100 text-red-300 hover:text-red-600 hover:border-red-600 hover:shadow-[3px_3px_0px_0px_rgba(220,38,38,1)] transition-all"
                        title="Purgar_Registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center border-4 border-dashed border-gray-50 relative group">
            <div className="flex flex-col items-center gap-4">
               <div className="p-4 bg-gray-50 text-gray-200 group-hover:text-industrial-dark transition-colors border border-transparent group-hover:border-black/10">
                  <Database size={40} strokeWidth={1} />
               </div>
               <div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] italic">Status: Repositório_Vazio</p>
                  <p className="text-[9px] font-technical text-gray-300 mt-2 uppercase font-bold tracking-widest">Aguardando inserção de dados regulatórios</p>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid Pattern Background - Component Wide */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Decorative Technical Border Corner */}
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-black opacity-10 m-1"></div>
    </div>
  );
};

export default DocumentManager;
