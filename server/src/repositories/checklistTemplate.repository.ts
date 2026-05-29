import ChecklistTemplate, { IChecklistTemplate } from '../models/ChecklistTemplate';

export class ChecklistTemplateRepository {
  async findAll(): Promise<IChecklistTemplate[]> {
    return await ChecklistTemplate.find().sort({ name: 1 });
  }

  async findById(id: string): Promise<IChecklistTemplate | null> {
    return await ChecklistTemplate.findById(id);
  }

  async create(data: Partial<IChecklistTemplate>): Promise<IChecklistTemplate> {
    const template = new ChecklistTemplate(data);
    return await template.save();
  }

  async update(id: string, data: Partial<IChecklistTemplate>): Promise<IChecklistTemplate | null> {
    return await ChecklistTemplate.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IChecklistTemplate | null> {
    return await ChecklistTemplate.findByIdAndDelete(id);
  }
}
