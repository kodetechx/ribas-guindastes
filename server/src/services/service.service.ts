import { ServiceRepository } from '../repositories/service.repository';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { OperatorRepository } from '../repositories/operator.repository';
import { ChecklistRepository } from '../repositories/checklist.repository';
import { IService } from '../models/Service';
import { AuditLogService } from './auditLog.service';

const repository = new ServiceRepository();
const equipmentRepository = new EquipmentRepository();
const operatorRepository = new OperatorRepository();
const checklistRepository = new ChecklistRepository();
const auditLog = new AuditLogService();

export class ServiceService {
  async getAllServices() {
    return await repository.findAll();
  }

  async getServicesByOperator(operatorId: string) {
    return await repository.findByOperator(operatorId);
  }

  async createService(data: Partial<IService>, userId?: string) {
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

    const service = await repository.create(data);

    if (userId) {
      await auditLog.log(userId, 'CREATE', 'Service', service._id.toString(), { title: service.title, client: service.client });
    }

    return service;
  }

  async updateService(id: string, data: Partial<IService>, userId?: string) {
    const updated = await repository.update(id, data);
    if (!updated) {
      throw new Error('Serviço não encontrado');
    }

    if (userId) {
      await auditLog.log(userId, 'UPDATE', 'Service', id, { status: updated.status });
    }

    return updated;
  }
}
