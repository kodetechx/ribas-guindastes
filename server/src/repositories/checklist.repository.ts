import Checklist, { IChecklist } from '../models/Checklist';

export class ChecklistRepository {
  async findAll() {
    return await Checklist.find().populate('equipment').populate('operator');
  }

  async findById(id: string) {
    return await Checklist.findById(id).populate('equipment').populate('operator');
  }

  async findByEquipment(equipmentId: string) {
    return await Checklist.find({ equipment: equipmentId }).sort({ date: -1 });
  }

  async create(data: Partial<IChecklist>) {
    return await Checklist.create(data);
  }

  async update(id: string, data: Partial<IChecklist>) {
    return await Checklist.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return await Checklist.findByIdAndDelete(id);
  }

  async findTodayByEquipment(equipmentId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    return await Checklist.findOne({
      equipment: equipmentId,
      date: { $gte: start, $lte: end }
    });
  }
}
