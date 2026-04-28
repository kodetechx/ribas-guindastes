import { Request, Response } from 'express';
import { OperatorService } from '../services/operator.service';

const service = new OperatorService();

export class OperatorController {
  async getAll(req: Request, res: Response) {
    try {
      const operators = await service.getAllOperators();
      res.json(operators);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const operator = await service.getOperatorById(req.params.id);
      res.json(operator);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const operator = await service.createOperator(req.body);
      res.status(201).json(operator);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const operator = await service.updateOperator(req.params.id, req.body);
      res.json(operator);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await service.deleteOperator(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }
}
