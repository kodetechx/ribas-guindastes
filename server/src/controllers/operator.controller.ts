import { Request, Response } from 'express';
import { OperatorService } from '../services/operator.service';

const service = new OperatorService();

export class OperatorController {
  public getAll = async (req: Request, res: Response) => {
    try {
      const operators = await service.getAllOperators();
      res.json(operators);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public getById = async (req: Request, res: Response) => {
    try {
      const operator = await service.getOperatorById(String(req.params.id));
      res.json(operator);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  };

  public create = async (req: any, res: Response) => {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.photoUrl = `/uploads/${req.file.filename}`;
        data.avatarUrl = `/uploads/${req.file.filename}`;
      }
      const operator = await service.createOperator(data, req.user?.id);
      res.status(201).json(operator);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };

  public update = async (req: any, res: Response) => {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.photoUrl = `/uploads/${req.file.filename}`;
        data.avatarUrl = `/uploads/${req.file.filename}`;
      }
      const operator = await service.updateOperator(String(req.params.id), data, req.user?.id);
      res.json(operator);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };

  public delete = async (req: any, res: Response) => {
    try {
      await service.deleteOperator(String(req.params.id), req.user?.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  };
}
