import { ChecklistRepository } from '../repositories/checklist.repository';
import { IChecklist } from '../models/Checklist';
import Equipment from '../models/Equipment';
import Operator from '../models/Operator';

const repository = new ChecklistRepository();

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
    const equipment = await Equipment.findById(data.equipment);
    if (!equipment) throw new Error('Equipamento não encontrado');

    // Regra: Não permitir checklist se a manutenção estiver vencida
    if (equipment.nextMaintenance && equipment.nextMaintenance < new Date()) {
      throw new Error('Equipamento com manutenção vencida. Operação bloqueada.');
    }

    // 2. Validar NRs do operador
    const operator = await Operator.findById(data.operator);
    if (!operator) throw new Error('Operador não encontrado');

    const now = new Date();
    const expiredNR = operator.nrs.find(nr => nr.expiresAt < now);
    if (expiredNR) {
      throw new Error(`Operador possui certificação ${expiredNR.type} vencida.`);
    }

    // Check if equipment already has a checklist today
    const todayChecklist = await repository.findTodayByEquipment(data.equipment as any);
    if (todayChecklist) {
      throw new Error('Equipamento já possui checklist para hoje');
    }
    return await repository.create(data);
  }

  async getByEquipment(equipmentId: string) {
    return await repository.findByEquipment(equipmentId);
  }

  async checkToday(equipmentId: string) {
    const todayChecklist = await repository.findTodayByEquipment(equipmentId);
    return !!todayChecklist;
  }
}
