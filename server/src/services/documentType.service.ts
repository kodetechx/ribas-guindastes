import { DocumentTypeRepository } from '../repositories/documentType.repository';
import { IDocumentType } from '../models/DocumentType';
import { AuditLogService } from './auditLog.service';

const repository = new DocumentTypeRepository();
const auditLog = new AuditLogService();

export class DocumentTypeService {
  async getAll() {
    return await repository.findAll();
  }

  async getActive() {
    return await repository.findActive();
  }

  async create(data: Partial<IDocumentType>, userId?: string) {
    const docType = await repository.create(data);
    if (userId) {
      await auditLog.log(userId, 'CREATE', 'DocumentType', docType._id.toString(), { name: docType.name });
    }
    return docType;
  }

  async update(id: string, data: Partial<IDocumentType>, userId?: string) {
    const updated = await repository.update(id, data);
    if (!updated) throw new Error('Tipo de documento não encontrado');
    if (userId) {
      await auditLog.log(userId, 'UPDATE', 'DocumentType', id, data);
    }
    return updated;
  }

  async delete(id: string, userId?: string) {
    const docType = await repository.findById(id);
    const deleted = await repository.delete(id);
    if (!deleted) throw new Error('Tipo de documento não encontrado');
    if (userId) {
      await auditLog.log(userId, 'DELETE', 'DocumentType', id, { name: docType?.name });
    }
    return deleted;
  }
}
