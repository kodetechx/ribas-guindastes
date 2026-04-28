import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Shield, AlertTriangle, FileBadge, Calendar } from 'lucide-react';
import api from '../services/api';
import DocumentManager from '../components/DocumentManager';

const OperatorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [operator, setOperator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperator = async () => {
      try {
        const res = await api.get(`/operators/${id}`);
        setOperator(res.data);
      } catch (err) {
        console.error('Erro ao buscar operador');
      } finally {
        setLoading(false);
      }
    };
    fetchOperator();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!operator) return <div className="p-10 text-center text-red-500">Operador não encontrado</div>;

  return (
    <div className="fade-in max-w-[1400px] mx-auto pb-20">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <Link to="/operadores" className="text-blue-900 text-[10px] font-black uppercase tracking-widest hover:underline">
          &larr; Voltar para Lista
        </Link>
        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mt-2">{operator.name}</h2>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">{operator.role} • {operator.registrationNumber}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-200 rounded-sm p-8 shadow-sm">
            <h4 className="text-[10px] font-black mb-6 uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-4">Informações de Contato</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">E-mail</p>
                <p className="text-sm font-bold text-gray-800">{operator.email}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">CNH ({operator.cnh.category})</p>
                <p className="text-sm font-bold text-gray-800">{operator.cnh.number}</p>
              </div>
            </div>
          </div>

          <DocumentManager ownerId={id!} category="operator" />
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
            <h4 className="text-[10px] font-black mb-6 uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-4">Certificações (NRs)</h4>
            <div className="space-y-3">
              {operator.nrs.map((nr: any, idx: number) => (
                <div key={idx} className={`p-3 border rounded-sm flex justify-between items-center ${new Date(nr.expiresAt) < new Date() ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center gap-2">
                    <Shield size={16} className={new Date(nr.expiresAt) < new Date() ? 'text-red-700' : 'text-blue-900'} />
                    <span className="text-xs font-black uppercase text-gray-700">{nr.type}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gray-400">{new Date(nr.expiresAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDetail;
