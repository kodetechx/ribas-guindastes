import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { equipmentService } from '../services/equipmentService';
import type { Equipment } from '../services/equipmentService';
import EquipmentCard from '../components/EquipmentCard';

const EquipmentList = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const data = await equipmentService.getAll();
        setEquipments(data);
      } catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipments();
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Equipamentos</h2>
          <p className="text-gray-400 mt-1">Gerencie a frota de máquinas e veículos.</p>
        </div>
        <button className="btn-industrial btn-primary flex items-center justify-center gap-2 rounded-md">
          <Plus size={20} />
          Novo Equipamento
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, marca ou série..."
            className="w-full bg-industrial-gray/20 border border-gray-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-industrial-yellow/50 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-industrial-gray/20 border border-gray-800 rounded-lg hover:bg-industrial-gray/40 transition-colors">
          <Filter size={20} />
          Filtros
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-industrial-yellow"></div>
        </div>
      ) : equipments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipments.map((item) => (
            <EquipmentCard key={item._id} equipment={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-industrial-gray/10 rounded-xl border border-dashed border-gray-800">
          <p className="text-gray-500">Nenhum equipamento cadastrado.</p>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
