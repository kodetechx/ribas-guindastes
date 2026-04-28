import Operator, { IOperator } from '../models/Operator';

export class OperatorRepository {
  async findAll(): Promise<IOperator[]> {
    return await Operator.find().sort({ name: 1 });
  }

  async findById(id: string): Promise<IOperator | null> {
    return await Operator.findById(id);
  }

  async create(data: Partial<IOperator>): Promise<IOperator> {
    const operator = new Operator(data);
    return await operator.save();
  }

  async update(id: string, data: Partial<IOperator>): Promise<IOperator | null> {
    return await Operator.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IOperator | null> {
    return await Operator.findByIdAndDelete(id);
  }
}
