import React from 'react';
import { User, Mail, Shield, Settings, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface OperatorCardProps {
  operator: any;
  onRefresh: () => void;
  onEdit: (op: any) => void;
}

const OperatorCard: React.FC<OperatorCardProps> = ({ operator, onRefresh, onEdit }) => {
  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este operador?')) {
      try {
        await api.delete(`/operators/${operator._id}`);
        onRefresh();
      } catch (err) {
        alert('Erro ao excluir operador');
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden group hover:border-blue-900 transition-all duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-sm flex items-center justify-center overflow-hidden">
              {operator.photoUrl ? (
                <img 
                  src={api.defaults.baseURL?.replace('/api', '') + operator.photoUrl} 
                  alt={operator.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={24} className="text-blue-900" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{operator.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{operator.role}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => onEdit(operator)}
              className="p-2 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-sm transition-colors"
            >
              <Settings size={16} />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <Mail size={12} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-600">{operator.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-600 uppercase">Matrícula: {operator.registrationNumber}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex gap-1">
            {operator.nrs?.slice(0, 3).map((nr: any, idx: number) => (
              <span key={idx} className="px-1.5 py-0.5 bg-gray-50 border border-gray-100 text-[8px] font-black text-gray-400 uppercase rounded-sm">
                {nr.type}
              </span>
            ))}
          </div>
          <Link 
            to={`/operadores/${operator._id}`}
            className="text-[10px] font-black text-blue-900 uppercase tracking-widest hover:underline"
          >
            Perfil &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OperatorCard;
