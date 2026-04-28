import React from 'react';
import { Truck, CheckCircle, AlertCircle, Clock, ClipboardList, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Equipment } from '../services/equipmentService';
import api from '../services/api';

interface Props {
  equipment: Equipment;
  onRefresh: () => void;
  onEdit: (eq: Equipment) => void;
}

const EquipmentCard: React.FC<Props> = ({ equipment, onRefresh, onEdit }) => {
  const statusStyles = {
    active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle, label: 'Ativo' },
    maintenance: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: 'Manutenção' },
    blocked: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle, label: 'Bloqueado' },
  };

  const style = statusStyles[equipment.status];
  const Icon = style.icon;

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este equipamento?')) {
      try {
        await api.delete(`/equipments/${equipment._id}`);
        onRefresh();
      } catch (err) {
        alert('Erro ao excluir equipamento');
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-6 hover:border-blue-900/30 transition-all flex flex-col h-full shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-sm text-gray-400">
          <Truck size={24} />
        </div>
        <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 border ${style.border} ${style.bg} ${style.text} rounded-sm text-[10px] font-black uppercase tracking-widest`}>
            <Icon size={12} strokeWidth={3} />
            {style.label}
            </div>
            <button onClick={() => onEdit(equipment)} className="p-1.5 text-gray-400 hover:text-blue-900 transition-colors">
                <Edit size={16} />
            </button>
            <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
            </button>
        </div>
      </div>

      <div className="flex-1">
        <Link to={`/equipamentos/${equipment._id}`}>
          <h3 className="text-xl font-black text-gray-900 hover:text-blue-900 transition-colors mb-1 uppercase tracking-tight">
            {equipment.name}
          </h3>
        </Link>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-6">
          {equipment.brand} {equipment.model} • {equipment.year}
        </p>

        <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
          <div>
            <p className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">Série</p>
            <p className="text-xs font-mono font-bold text-gray-700">{equipment.serialNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">Próx. Manut.</p>
            <p className="text-xs font-bold text-gray-700">
              {equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toLocaleDateString() : '---'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link
          to={`/checklist/${equipment._id}`}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-blue-900 text-xs font-black uppercase tracking-widest hover:bg-blue-900 hover:text-white hover:border-blue-900 transition-all rounded-sm"
        >
          <ClipboardList size={16} />
          Realizar Checklist
        </Link>
      </div>
    </div>
  );
};

export default EquipmentCard;
