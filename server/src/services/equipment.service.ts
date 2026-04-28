import { EquipmentRepository } from '../repositories/equipment.repository';
import { IEquipment } from '../models/Equipment';

const repository = new EquipmentRepository();

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

  async createEquipment(data: Partial<IEquipment>) {
    // Adicionar lógica de negócio aqui se necessário (ex: gerar QR Code)
    return await repository.create(data);
  }

  async updateEquipment(id: string, data: Partial<IEquipment>) {
    const updated = await repository.update(id, data);
    if (!updated) {
      throw new Error('Equipment not found');
    }
    return updated;
  }

  async deleteEquipment(id: string) {
    const deleted = await repository.delete(id);
    if (!deleted) {
      throw new Error('Equipment not found');
    }
    return deleted;
  }
}
