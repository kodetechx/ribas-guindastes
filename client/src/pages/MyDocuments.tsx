import React, { useEffect, useState } from 'react';
import { FileBadge, Download, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MyDocuments = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/documents/operator/${user.id}`);
        setDocs(res.data);
      } catch (err) {
        console.error('Erro ao buscar documentos');
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="mb-10 border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
          <FileBadge className="text-blue-900" size={28} />
          Meus Documentos
        </h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Certificações e validades operacionais</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-bold uppercase text-xs tracking-widest">Carregando documentos...</div>
      ) : docs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div key={doc._id} className="bg-white border border-gray-200 rounded-sm p-5 shadow-sm hover:border-blue-900/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-sm ${
                    doc.status === 'valid' ? 'bg-green-50 text-green-700' :
                    doc.status === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    <FileBadge size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{doc.name}</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{doc.type}</p>
                  </div>
                </div>

                <a 
                  href={api.defaults.baseURL + doc.fileUrl} 
                  target="_blank" 
                  className="p-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-500 hover:text-blue-900 transition-all"
                >
                  <Download size={16} />
                </a>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Calendar size={12} />
                  {doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString() : 'Sem data'}
                </div>
                {doc.status === 'valid' ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-sm text-[9px] font-black uppercase tracking-widest border border-green-100">
                    <CheckCircle size={10} /> Válido
                  </span>
                ) : doc.status === 'warning' ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-sm text-[9px] font-black uppercase tracking-widest border border-yellow-100">
                    <AlertTriangle size={10} /> Vencendo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-sm text-[9px] font-black uppercase tracking-widest border border-red-100">
                    <AlertTriangle size={10} /> Vencido
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-sm">
          <p className="text-gray-400 text-xs font-bold uppercase italic">Nenhum documento encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default MyDocuments;
