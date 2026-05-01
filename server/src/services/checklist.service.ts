import { ChecklistRepository } from '../repositories/checklist.repository';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { OperatorRepository } from '../repositories/operator.repository';
import { IChecklist } from '../models/Checklist';

const repository = new ChecklistRepository();
const equipmentRepository = new EquipmentRepository();
const operatorRepository = new OperatorRepository();

export class ChecklistService {
  async getAllChecklists() {
    return await repository.findAll();
  }

  async getChecklistById(id: string) {
    const checklist = await repository.findById(id);
    if (!checklist) {
      throw new Error('Checklist not found');
    }
    return checklist;
  }

  async createChecklist(data: Partial<IChecklist>) {
    // 1. Validar se o equipamento existe e está apto
    if (!data.equipment) throw new Error('Equipamento é obrigatório');
    const equipment = await equipmentRepository.findById(data.equipment.toString());
    if (!equipment) throw new Error('Equipamento não encontrado');

    // Regra: Não permitir checklist se a manutenção estiver vencida
    if (equipment.nextMaintenance && equipment.nextMaintenance < new Date()) {
      throw new Error('Equipamento com manutenção vencida. Operação bloqueada.');
    }

    // 2. Validar NRs do operador
    if (!data.operator) throw new Error('Operador é obrigatório');
    const operator = await operatorRepository.findById(data.operator.toString());
    if (!operator) throw new Error('Operador não encontrado');

    const now = new Date();
    const expiredNR = operator.nrs.find(nr => nr.expiresAt < now);
    if (expiredNR) {
      throw new Error(`Operador possui certificação ${expiredNR.type} vencida.`);
    }

    // Check if equipment already has a checklist today
    const todayChecklist = await repository.findTodayByEquipment(data.equipment.toString());
    if (todayChecklist) {
      throw new Error('Equipamento já possui checklist para hoje');
    }
    return await repository.create(data);
  }

  async getByEquipment(equipmentId: string) {
    return await repository.findByEquipment(equipmentId);
  }

  async updateChecklist(id: string, data: Partial<IChecklist>) {
    const updated = await repository.update(id, data);
    if (!updated) {
      throw new Error('Checklist não encontrado');
    }
    return updated;
  }

  async deleteChecklist(id: string) {
    const deleted = await repository.delete(id);
    if (!deleted) {
      throw new Error('Checklist não encontrado');
    }
    return deleted;
  }
}
