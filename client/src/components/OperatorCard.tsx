import React from 'react';
import { User, AlertTriangle, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Operator } from '../services/operatorService';
import api from '../services/api';

interface Props {
  operator: Operator;
  onRefresh: () => void;
  onEdit: (op: Operator) => void;
}

const OperatorCard: React.FC<Props> = ({ operator, onRefresh, onEdit }) => {
  const hasExpiredNR = operator.nrs.some(nr => new Date(nr.expiresAt) < new Date());

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir o operador ${operator.name}?`)) {
      try {
        await api.delete(`/operators/${operator._id}`);
        onRefresh();
      } catch (err) {
        alert('Erro ao excluir operador');
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm hover:border-blue-900/30 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-sm text-blue-900">
          <User size={24} />
        </div>
        <div className="flex items-center gap-2">
            {hasExpiredNR && (
              <div className="flex items-center gap-1.5 px-3 py-1 border border-red-200 bg-red-50 text-red-700 rounded-sm text-[10px] font-black uppercase tracking-widest">
                <AlertTriangle size={12} strokeWidth={3} /> NR Vencida
              </div>
            )}
            <button onClick={() => onEdit(operator)} className="p-1.5 text-gray-400 hover:text-blue-900 transition-colors">
                <Edit size={16} />
            </button>
            <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
            </button>
        </div>
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
