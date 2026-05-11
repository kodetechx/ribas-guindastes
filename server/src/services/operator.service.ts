import { OperatorRepository } from '../repositories/operator.repository';
import { IOperator } from '../models/Operator';
import { AuditLogService } from './auditLog.service';

const repository = new OperatorRepository();
const auditLog = new AuditLogService();

export class OperatorService {
  async getAllOperators() {
    return await repository.findAll();
  }

  async getOperatorById(id: string) {
    const operator = await repository.findById(id);
    if (!operator) {
      throw new Error('Operator not found');
    }
    return operator;
  }

  async createOperator(data: Partial<IOperator>, userId?: string) {
    const operator = await repository.create(data);

    if (userId) {
      await auditLog.log(userId, 'CREATE', 'Operator', operator._id.toString(), { name: operator.name, email: operator.email });
    }

    return operator;
  }

  async updateOperator(id: string, data: Partial<IOperator>, userId?: string) {
    const updated = await repository.update(id, data);
    if (!updated) {
      throw new Error('Operator not found');
    }

    if (userId) {
      await auditLog.log(userId, 'UPDATE', 'Operator', id, { name: updated.name, email: updated.email });
    }

    return updated;
  }

  async deleteOperator(id: string, userId?: string) {
    const operator = await repository.findById(id);
    const deleted = await repository.delete(id);
    if (!deleted) {
      throw new Error('Operator not found');
    }

    if (userId) {
      await auditLog.log(userId, 'DELETE', 'Operator', id, { name: operator?.name, email: operator?.email });
    }

    return deleted;
  }
}
