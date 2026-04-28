import Equipment, { IEquipment } from '../models/Equipment';

export class EquipmentRepository {
  async findAll(): Promise<IEquipment[]> {
    return await Equipment.find().sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IEquipment | null> {
    return await Equipment.findById(id);
  }

  async create(data: Partial<IEquipment>): Promise<IEquipment> {
    const equipment = new Equipment(data);
    return await equipment.save();
  }

  async update(id: string, data: Partial<IEquipment>): Promise<IEquipment | null> {
    return await Equipment.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IEquipment | null> {
    return await Equipment.findByIdAndDelete(id);
  }
}
