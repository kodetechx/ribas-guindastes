import { ChecklistRepository } from '../repositories/checklist.repository';
import { IChecklist } from '../models/Checklist';

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
