import mongoose from 'mongoose';
import Maintenance, { IMaintenance } from '../models/Maintenance';

export class MaintenanceRepository {
  async findAll() {
    return await Maintenance.find().populate('equipment');
  }

  async findById(id: string) {
    return await Maintenance.findById(id).populate('equipment');
  }

  async findByEquipment(equipmentId: string) {
    return await Maintenance.find({ 
      equipment: new mongoose.Types.ObjectId(equipmentId) 
    }).sort({ date: -1 });
  }

  async create(data: Partial<IMaintenance>) {
    return await Maintenance.create(data);
  }

  async update(id: string, data: Partial<IMaintenance>) {
    return await Maintenance.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return await Maintenance.findByIdAndDelete(id);
  }
}
