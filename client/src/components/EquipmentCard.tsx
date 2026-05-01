import React from 'react';
import { Truck, MapPin, Calendar, Clock, Edit, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface EquipmentCardProps {
  equipment: any;
  onRefresh: () => void;
  onEdit: (eq: any) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onRefresh, onEdit }) => {
  const statusStyles: any = {
    active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Ativo' },
    maintenance: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Manutenção' },
    blocked: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Bloqueado' },
  };

  const style = statusStyles[equipment.status] || statusStyles.active;

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden group hover:border-blue-900 transition-all duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-sm flex items-center justify-center overflow-hidden">
              {equipment.imageUrl ? (
                <img 
                  src={api.defaults.baseURL?.replace('/api', '') + equipment.imageUrl} 
                  alt={equipment.name} 
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = ''; // Fallback se a imagem falhar
                    e.target.parentElement.innerHTML = '<svg size="24" class="text-blue-900"><path d="M10 17h4V5H2v12h3m5 0h20m-2 0v-4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4m10 0v-4"></path></svg>';
                  }}
                />
              ) : (
                <Truck size={24} className="text-blue-900" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{equipment.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{equipment.brand} • {equipment.model}</p>
            </div>
          </div>
          <button 
            onClick={() => onEdit(equipment)}
            className="p-2 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-sm transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className={`px-2 py-0.5 border ${style.border} ${style.bg} ${style.text} rounded-sm text-[8px] font-black uppercase tracking-widest`}>
            {style.label}
          </span>
          <span className="text-[9px] font-mono font-bold text-gray-400">S/N: {equipment.serialNumber}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-[9px] font-bold text-gray-500 uppercase">Ano: {equipment.year}</span>
          </div>
          <Link 
            to={`/equipamentos/${equipment._id}`}
            className="text-[10px] font-black text-blue-900 uppercase tracking-widest text-right hover:underline"
          >
            Detalhes &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
