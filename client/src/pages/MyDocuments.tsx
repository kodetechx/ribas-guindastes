import React from 'react';
import { FileBadge, Download, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MyDocuments = () => {
  const { user } = useAuth();

  // Mock data for NR certifications - in a real app this would come from API
  const docs = [
    { name: 'NR-11 - Transporte e Movimentação', expires: '2026-10-10', status: 'valid' },
    { name: 'NR-12 - Segurança no Trabalho em Máquinas', expires: '2026-05-15', status: 'warning' },
    { name: 'NR-35 - Trabalho em Altura', expires: '2024-01-01', status: 'expired' },
    { name: 'CNH - Categoria E', expires: '2025-12-31', status: 'valid' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <FileBadge className="text-industrial-yellow" size={32} />
          Meus Documentos
        </h2>
        <p className="text-gray-400 mt-2">Consulte suas certificações e validades para operação em campo.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {docs.map((doc, idx) => (
          <div key={idx} className="bg-industrial-gray/20 border border-gray-800 rounded-xl p-5 md:p-6 hover:border-industrial-yellow/30 transition-all group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  doc.status === 'valid' ? 'bg-green-500/10 text-green-500' :
                  doc.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  <FileBadge size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold group-hover:text-industrial-yellow transition-colors">{doc.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>Validade: {new Date(doc.expires).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  {doc.status === 'valid' ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle size={12} /> Válido
                    </span>
                  ) : doc.status === 'warning' ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <AlertTriangle size={12} /> Vencendo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <AlertTriangle size={12} /> Vencido
                    </span>
                  )}
                </div>
                
                <button className="p-3 bg-industrial-gray/50 hover:bg-industrial-yellow hover:text-black rounded-lg transition-all">
                  <Download size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 bg-industrial-yellow/5 border border-industrial-yellow/20 rounded-xl">
        <h4 className="font-bold text-industrial-yellow mb-2 uppercase text-xs tracking-widest">Aviso Importante</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          De acordo com as normas de segurança, você não deve operar equipamentos se alguma de suas certificações obrigatórias (NRs) estiver vencida. Em caso de discrepância, procure seu gestor imediatamente.
        </p>
      </div>
    </div>
  );
};

export default MyDocuments;
