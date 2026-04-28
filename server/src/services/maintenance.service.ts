import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { IMaintenance } from '../models/Maintenance';
import Equipment from '../models/Equipment';

const repository = new MaintenanceRepository();

export class MaintenanceService {
  async getAllMaintenances() {
    return await repository.findAll();
  }

  async getMaintenanceById(id: string) {
    const maintenance = await repository.findById(id);
    if (!maintenance) {
      throw new Error('Manutenção não encontrada');
    }
    return maintenance;
  }

  async getByEquipment(equipmentId: string) {
    return await repository.findByEquipment(equipmentId);
  }

  async createMaintenance(data: Partial<IMaintenance>) {
    const maintenance = await repository.create(data);

    // Atualizar o equipamento relacionado
    if (maintenance.equipment) {
      await Equipment.findByIdAndUpdate(maintenance.equipment, {
        lastMaintenance: maintenance.date,
        nextMaintenance: maintenance.nextMaintenanceDate,
        status: 'active' // Assume que após manutenção o equipamento volta a ficar ativo
      });
    }

    return maintenance;
  }

  async updateMaintenance(id: string, data: Partial<IMaintenance>) {
    const updated = await repository.update(id, data);
    if (!updated) {
      throw new Error('Manutenção não encontrada');
    }
    return updated;
  }

  async deleteMaintenance(id: string) {
    const deleted = await repository.delete(id);
    if (!deleted) {
      throw new Error('Manutenção não encontrada');
    }
    return deleted;
  }
}
