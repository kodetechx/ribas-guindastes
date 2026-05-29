import Service, { IService } from '../models/Service';

export class ServiceRepository {
  async findAll() {
    return await Service.find().populate('clientId').populate('equipment').populate('operators');
  }

  async findByOperator(operatorId: string) {
    return await Service.find({ operators: operatorId }).populate('clientId').populate('equipment').populate('operators').sort({ createdAt: -1 });
  }

  async findActiveByEquipment(equipmentId: string) {
    return await Service.findOne({ 
      equipment: equipmentId, 
      status: { $in: ['pending', 'in_progress'] } 
    });
  }

  async create(data: Partial<IService>) {
    return await Service.create(data);
  }

  async update(id: string, data: Partial<IService>) {
    return await Service.findByIdAndUpdate(id, data, { new: true });
  }
}
