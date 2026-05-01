import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { equipmentService } from '../services/equipmentService';
import type { Equipment } from '../services/equipmentService';
import EquipmentCard from '../components/EquipmentCard';
import EquipmentForm from '../components/EquipmentForm';

const EquipmentList = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const data = await equipmentService.getAll();
      setEquipments(data);
      setFilteredEquipments(data);
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  useEffect(() => {
    let result = equipments;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(eq => 
        eq.name.toLowerCase().includes(term) || 
        eq.brand.toLowerCase().includes(term) || 
        eq.model.toLowerCase().includes(term) ||
        eq.serialNumber.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(eq => eq.status === statusFilter);
    }

    setFilteredEquipments(result);
  }, [searchTerm, statusFilter, equipments]);

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Equipamentos</h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Gerencie a frota de máquinas e veículos.</p>
        </div>
        <button 
          onClick={() => { setEditingEquipment(null); setShowForm(true); }}
          className="btn-industrial btn-primary flex items-center justify-center gap-2 rounded-sm"
        >
          <Plus size={16} />
          Novo Equipamento
        </button>
      </div>

      {showForm && <EquipmentForm initialData={editingEquipment} onClose={() => setShowForm(false)} onSuccess={fetchEquipments} />}

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, marca ou série..."
            className="w-full bg-industrial-gray/20 border border-gray-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-industrial-yellow/50 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select 
            className="bg-industrial-gray/20 border border-gray-800 rounded-lg py-3 px-4 focus:outline-none focus:border-industrial-yellow/50 transition-colors text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">TODOS OS STATUS</option>
            <option value="active">ATIVOS</option>
            <option value="maintenance">MANUTENÇÃO</option>
            <option value="blocked">BLOQUEADOS</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-industrial-yellow"></div>
        </div>
      ) : filteredEquipments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipments.map((item) => (
            <EquipmentCard key={item._id} equipment={item} onRefresh={fetchEquipments} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-industrial-gray/10 rounded-xl border border-dashed border-gray-800">
          <p className="text-gray-500">Nenhum equipamento encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
