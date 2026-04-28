import { Request, Response } from 'express';
import { ServiceService } from '../services/service.service';

const service = new ServiceService();

export class ServiceController {
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const services = await service.getAllServices();
      res.status(200).json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const newService = await service.createService(req.body);
      res.status(201).json(newService);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await service.updateService(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
