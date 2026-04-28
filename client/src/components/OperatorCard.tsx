import React from 'react';
import { User, ShieldCheck, ShieldAlert, CreditCard } from 'lucide-react';
import type { Operator } from '../services/operatorService';

interface Props {
  operator: Operator;
}

const OperatorCard: React.FC<Props> = ({ operator }) => {
  const isCnhExpired = new Date(operator.cnh.expiresAt) < new Date();
  const hasExpiredNr = operator.nrs.some(nr => new Date(nr.expiresAt) < new Date());
  
  const statusColor = operator.isActive 
    ? (isCnhExpired || hasExpiredNr ? 'text-yellow-500' : 'text-green-500') 
    : 'text-red-500';

  return (
    <div className="bg-industrial-gray/30 border border-gray-800 rounded-lg p-5 hover:border-industrial-yellow/50 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-industrial-gray flex items-center justify-center text-gray-400 overflow-hidden border border-gray-700">
            {operator.photoUrl ? (
              <img src={operator.photoUrl} alt={operator.name} className="w-full h-full object-cover" />
            ) : (
              <User size={24} />
            )}
          </div>
          <div>
            <h3 className="font-bold group-hover:text-industrial-yellow transition-colors leading-tight">
              {operator.name}
            </h3>
            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mt-0.5">
              {operator.registrationNumber} • {operator.role}
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
          operator.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {operator.isActive ? 'Ativo' : 'Inativo'}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <CreditCard size={14} />
            <span>CNH Cat. {operator.cnh.category}</span>
          </div>
          <span className={isCnhExpired ? 'text-red-500 font-bold' : 'text-gray-300'}>
            {new Date(operator.cnh.expiresAt).toLocaleDateString()}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-800">
          <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Treinamentos NR</p>
          <div className="flex flex-wrap gap-2">
            {operator.nrs.length > 0 ? (
              operator.nrs.map((nr, idx) => {
                const isExpired = new Date(nr.expiresAt) < new Date();
                return (
                  <div 
                    key={idx}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${
                      isExpired ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-industrial-gray/50 text-gray-300'
                    }`}
                  >
                    {isExpired ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
                    {nr.type}
                  </div>
                );
              })
            ) : (
              <span className="text-gray-600 italic text-[10px]">Nenhuma NR cadastrada</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorCard;
