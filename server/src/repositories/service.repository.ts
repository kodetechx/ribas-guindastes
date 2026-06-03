import Service, { IService } from '../models/Service';

export class ServiceRepository {
  async findAll() {
    return await Service.find().populate('clientId').populate('equipments').populate('operators');
  }

  async findByOperator(operatorId: string) {
    return await Service.find({ operators: operatorId }).populate('clientId').populate('equipments').populate('operators').sort({ createdAt: -1 });
  }

  async findActiveByEquipment(equipmentId: string) {
    return await Service.findOne({ 
      equipments: { $in: [equipmentId] }, 
      status: { $in: ['pending', 'in_progress'] } 
    });
  }

  async findById(id: string) {
    return await Service.findById(id).populate('clientId').populate('equipments').populate('operators');
  }

  async create(data: Partial<IService>) {
    return await Service.create(data);
  }

  async update(id: string, data: Partial<IService>) {
    return await Service.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return await Service.findByIdAndDelete(id);
  }

  async addOccurrence(id: string, occurrence: any) {
    return await Service.findByIdAndUpdate(
      id, 
      { $push: { occurrences: occurrence } }, 
      { new: true }
    );
  }
}
