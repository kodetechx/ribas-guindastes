import { ServiceRepository } from '../repositories/service.repository';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { OperatorRepository } from '../repositories/operator.repository';
import { ChecklistRepository } from '../repositories/checklist.repository';
import { IService } from '../models/Service';

const repository = new ServiceRepository();
const equipmentRepository = new EquipmentRepository();
const operatorRepository = new OperatorRepository();
const checklistRepository = new ChecklistRepository();

export class ServiceService {
  async getAllServices() {
    return await repository.findAll();
  }

  async createService(data: Partial<IService>) {
    if (!data.equipment) throw new Error('Equipamento é obrigatório');
    
    const equipmentId = data.equipment.toString();

    // 1. Regra: Equipamento não pode estar em dois serviços ativos
    const activeService = await repository.findActiveByEquipment(equipmentId);
    if (activeService) {
      throw new Error('Equipamento já possui um serviço ativo/pendente.');
    }

    // 2. Regra: Equipamento deve estar com manutenção em dia (Removido bloqueio por status manual)
    const equipment = await equipmentRepository.findById(equipmentId);
    if (!equipment) throw new Error('Equipamento não encontrado');
    
    if (equipment.nextMaintenance && equipment.nextMaintenance < new Date()) {
      throw new Error('Manutenção do equipamento vencida.');
    }

    // 3. Regra: Checklist diário obrigatório
    const todayChecklist = await checklistRepository.findTodayByEquipment(equipmentId);
    if (!todayChecklist) {
      throw new Error('Checklist diário não realizado para este equipamento.');
    }

    // 4. Regra: Validar operadores (NRs e CNH)
    if (data.operators && data.operators.length > 0) {
      for (const opId of data.operators) {
        const operator = await operatorRepository.findById(opId.toString());
        if (!operator) throw new Error(`Operador ${opId} não encontrado.`);
        
        const now = new Date();
        
        // Validar CNH
        if (operator.cnh.expiresAt < now) {
          throw new Error(`Operador ${operator.name} está com a CNH vencida.`);
        }

        // Validar NRs
        const expiredNR = operator.nrs.find(nr => nr.expiresAt < now);
        if (expiredNR) {
          throw new Error(`Operador ${operator.name} possui certificação ${expiredNR.type} vencida.`);
        }
      }
    }

    return await repository.create(data);
  }

  async updateService(id: string, data: Partial<IService>) {
    return await repository.update(id, data);
  }
}
