import React from 'react';
import { Truck, CheckCircle, AlertCircle, Clock, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Equipment } from '../services/equipmentService';

interface Props {
  equipment: Equipment;
}

const EquipmentCard: React.FC<Props> = ({ equipment }) => {
  const statusStyles = {
    active: { bg: 'bg-green-500/10', text: 'text-green-500', icon: CheckCircle, label: 'Ativo' },
    maintenance: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', icon: Clock, label: 'Manutenção' },
    blocked: { bg: 'bg-red-500/10', text: 'text-red-500', icon: AlertCircle, label: 'Bloqueado' },
  };

  const style = statusStyles[equipment.status];
  const Icon = style.icon;

  return (
    <div className="bg-industrial-gray/30 border border-gray-800 rounded-lg p-5 hover:border-industrial-yellow/50 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${style.bg} ${style.text}`}>
          <Truck size={24} />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
          <Icon size={14} />
          {style.label}
        </div>
      </div>

      <Link to={`/equipamentos/${equipment._id}`}>
        <h3 className="text-xl font-bold mb-1 group-hover:text-industrial-yellow transition-colors">
          {equipment.name}
        </h3>
      </Link>
      <p className="text-gray-400 text-sm mb-4">
        {equipment.brand} {equipment.model} • {equipment.year}
      </p>

      <div className="pt-4 border-t border-gray-800 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Série</p>
          <p className="text-sm font-mono text-gray-300">{equipment.serialNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Próx. Manut.</p>
          <p className="text-sm text-gray-300">
            {equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toLocaleDateString() : 'N/D'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          to={`/checklist/${equipment._id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-industrial-gray/40 border border-gray-700 rounded text-sm font-bold hover:bg-industrial-yellow hover:text-black hover:border-industrial-yellow transition-all"
        >
          <ClipboardList size={18} />
          Realizar Checklist
        </Link>
      </div>
    </div>
  );
};

export default EquipmentCard;
