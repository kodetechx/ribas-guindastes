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
    // O QR Code por padrão será o próprio ID do equipamento (gerado pelo MongoDB)
    // Se precisarmos de um formato específico, podemos ajustar aqui
    const equipment = await repository.create(data);
    
    // Se o campo qrCode estiver vazio, atualizamos com o ID gerado
    if (!equipment.qrCode) {
      equipment.qrCode = equipment._id.toString();
      await repository.update(equipment._id.toString(), { qrCode: equipment.qrCode });
    }
    
    return equipment;
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
