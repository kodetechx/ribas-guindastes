import { OperatorRepository } from '../repositories/operator.repository';
import { IOperator } from '../models/Operator';

const repository = new OperatorRepository();

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

  async createOperator(data: Partial<IOperator>) {
    return await repository.create(data);
  }

  async updateOperator(id: string, data: Partial<IOperator>) {
    const updated = await repository.update(id, data);
    if (!updated) {
      throw new Error('Operator not found');
    }
    return updated;
  }

  async deleteOperator(id: string) {
    const deleted = await repository.delete(id);
    if (!deleted) {
      throw new Error('Operator not found');
    }
    return deleted;
  }
}
