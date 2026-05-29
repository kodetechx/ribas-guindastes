import { ChecklistTemplateRepository } from '../repositories/checklistTemplate.repository';
import { IChecklistTemplate } from '../models/ChecklistTemplate';
import { AuditLogService } from './auditLog.service';

const repository = new ChecklistTemplateRepository();
const auditLog = new AuditLogService();

export class ChecklistTemplateService {
  async getAllTemplates() {
    return await repository.findAll();
  }

  async getTemplateById(id: string) {
    const template = await repository.findById(id);
    if (!template) {
      throw new Error('Checklist template not found');
    }
    return template;
  }

  async createTemplate(data: Partial<IChecklistTemplate>, userId?: string) {
    const template = await repository.create(data);
    if (userId) {
      await auditLog.log(userId, 'CREATE', 'ChecklistTemplate', template._id.toString(), { name: template.name });
    }
    return template;
  }

  async updateTemplate(id: string, data: Partial<IChecklistTemplate>, userId?: string) {
    const updated = await repository.update(id, data);
    if (!updated) {
      throw new Error('Checklist template not found');
    }
    if (userId) {
      await auditLog.log(userId, 'UPDATE', 'ChecklistTemplate', id, data);
    }
    return updated;
  }

  async deleteTemplate(id: string, userId?: string) {
    const template = await repository.findById(id);
    const deleted = await repository.delete(id);
    if (!deleted) {
      throw new Error('Checklist template not found');
    }
    if (userId) {
      await auditLog.log(userId, 'DELETE', 'ChecklistTemplate', id, { name: template?.name });
    }
    return deleted;
  }
}
