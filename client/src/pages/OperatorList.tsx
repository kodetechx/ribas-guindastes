import React, { useEffect, useState } from 'react';
import { UserPlus, Search, Filter } from 'lucide-react';
import { operatorService } from '../services/operatorService';
import type { Operator } from '../services/operatorService';
import OperatorCard from '../components/OperatorCard';

const OperatorList = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const data = await operatorService.getAll();
        setOperators(data);
      } catch (error) {
        console.error('Erro ao buscar operadores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOperators();
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Operadores</h2>
          <p className="text-gray-400 mt-1">Gestão de pessoal, treinamentos e certificações.</p>
        </div>
        <button className="btn-industrial btn-primary flex items-center justify-center gap-2 rounded-md">
          <UserPlus size={20} />
          Novo Operador
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou e-mail..."
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
      ) : operators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operators.map((item) => (
            <OperatorCard key={item._id} operator={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-industrial-gray/10 rounded-xl border border-dashed border-gray-800">
          <p className="text-gray-500">Nenhum operador cadastrado.</p>
        </div>
      )}
    </div>
  );
};

export default OperatorList;
