import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { IMaintenance } from '../models/Maintenance';

const repository = new MaintenanceRepository();
const equipmentRepository = new EquipmentRepository();

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
    // Normalizar datas para evitar shift de fuso horário (meio-dia UTC)
    if (data.date) {
      const d = new Date(data.date);
      data.date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0));
    }
    if (data.nextMaintenanceDate) {
      const d = new Date(data.nextMaintenanceDate);
      data.nextMaintenanceDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0));
    }
    
    if (data.cost) data.cost = Number(data.cost);

    const maintenance = await repository.create(data);

    // Atualizar o equipamento relacionado usando o repositório
    if (maintenance.equipment) {
      await equipmentRepository.update(maintenance.equipment.toString(), {
        lastMaintenance: maintenance.date,
        nextMaintenance: maintenance.nextMaintenanceDate,
        status: 'active' 
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
