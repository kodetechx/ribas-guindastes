import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { IMaintenance } from '../models/Maintenance';
import { AuditLogService } from './auditLog.service';

const repository = new MaintenanceRepository();
const equipmentRepository = new EquipmentRepository();
const auditLog = new AuditLogService();

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

  async createMaintenance(data: Partial<IMaintenance>, userId?: string) {
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

    if (userId) {
      await auditLog.log(userId, 'CREATE', 'Maintenance', maintenance._id.toString(), { equipment: maintenance.equipment, description: maintenance.description });
    }

    return maintenance;
  }

  async updateMaintenance(id: string, data: Partial<IMaintenance>, userId?: string) {
    const updated = await repository.update(id, data);
    if (!updated) {
      throw new Error('Manutenção não encontrada');
    }

    if (userId) {
      await auditLog.log(userId, 'UPDATE', 'Maintenance', id, data);
    }

    return updated;
  }

  async deleteMaintenance(id: string, userId?: string) {
    const maintenance = await repository.findById(id);
    const deleted = await repository.delete(id);
    if (!deleted) {
      throw new Error('Manutenção não encontrada');
    }

    if (userId) {
      await auditLog.log(userId, 'DELETE', 'Maintenance', id, { equipment: maintenance?.equipment, description: maintenance?.description });
    }

    return deleted;
  }
}
