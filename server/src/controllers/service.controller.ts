import { Request, Response } from 'express';
import { ServiceService } from '../services/service.service';
import { ValidationService } from '../services/validation.service';

const service = new ServiceService();
const validationService = new ValidationService();

export class ServiceController {
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const services = await service.getAllServices();
      res.status(200).json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async getByOperator(req: Request, res: Response): Promise<void> {
    try {
      const services = await service.getServicesByOperator(String(req.params.operatorId));
      res.status(200).json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async create(req: any, res: Response): Promise<void> {
    try {
      const newService = await service.createService(req.body, req.user?.id);
      res.status(201).json(newService);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async update(req: any, res: Response): Promise<void> {
    try {
      const updated = await service.updateService(String(req.params.id), req.body, req.user?.id);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async validateEquipment(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, equipmentId } = req.body;
      const result = await validationService.validateEquipmentForClient(clientId, equipmentId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async validateOperator(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, operatorId } = req.body;
      const result = await validationService.validateOperatorForClient(clientId, operatorId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
