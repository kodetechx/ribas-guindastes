import { EquipmentRepository } from '../repositories/equipment.repository';
import { IEquipment } from '../models/Equipment';
import { AuditLogService } from './auditLog.service';

const repository = new EquipmentRepository();
const auditLog = new AuditLogService();

export class EquipmentService {
  async getAllEquipments() {
    return await repository.findAll();
  }

  async getEquipmentById(id: string) {
    const equipment = await repository.findById(id);
    if (!equipment) {
      throw new Error('Equipment not found');
    }
    return equipment;
  }

  async createEquipment(data: Partial<IEquipment>, userId?: string) {
    // O QR Code por padrão será o próprio ID do equipamento (gerado pelo MongoDB)
    // Se precisarmos de um formato específico, podemos ajustar aqui
    const equipment = await repository.create(data);
    
    // Se o campo qrCode estiver vazio, atualizamos com o ID gerado
    if (!equipment.qrCode) {
      equipment.qrCode = equipment._id.toString();
      await repository.update(equipment._id.toString(), { qrCode: equipment.qrCode });
    }

    if (userId) {
      await auditLog.log(userId, 'CREATE', 'Equipment', equipment._id.toString(), { name: equipment.name });
    }
    
    return equipment;
  }

  async updateEquipment(id: string, data: Partial<IEquipment>, userId?: string) {
    const updated = await repository.update(id, data);
    if (!updated) {
      throw new Error('Equipment not found');
    }

    if (userId) {
      await auditLog.log(userId, 'UPDATE', 'Equipment', id, data);
    }

    return updated;
  }

  async deleteEquipment(id: string, userId?: string) {
    const equipment = await repository.findById(id);
    const deleted = await repository.delete(id);
    if (!deleted) {
      throw new Error('Equipment not found');
    }

    if (userId) {
      await auditLog.log(userId, 'DELETE', 'Equipment', id, { name: equipment?.name });
    }

    return deleted;
  }
}
