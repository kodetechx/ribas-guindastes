import React from 'react';
import { User, Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Operator } from '../services/operatorService';

interface Props {
  operator: Operator;
}

const OperatorCard: React.FC<Props> = ({ operator }) => {
  const hasExpiredNR = operator.nrs.some(nr => new Date(nr.expiresAt) < new Date());

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm hover:border-blue-900/30 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-sm text-blue-900">
          <User size={24} />
        </div>
        {hasExpiredNR && (
          <div className="flex items-center gap-1.5 px-3 py-1 border border-red-200 bg-red-50 text-red-700 rounded-sm text-[10px] font-black uppercase tracking-widest">
            <AlertTriangle size={12} strokeWidth={3} /> NR Vencida
          </div>
        )}
      </div>

      <Link to={`/operadores/${operator._id}`}>
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-1 hover:text-blue-900 transition-colors">{operator.name}</h3>
      </Link>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">{operator.registrationNumber} • {operator.role}</p>

      <div className="grid grid-cols-1 gap-2 pt-4 border-t border-gray-100">
        <div>
          <p className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">E-mail</p>
          <p className="text-xs font-bold text-gray-700">{operator.email}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">Certificações Ativas</p>
          <div className="flex gap-2 mt-1">
             {operator.nrs.map(nr => (
               <span key={nr.type} className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-sm text-[9px] font-bold uppercase tracking-widest">
                 {nr.type}
               </span>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorCard;
