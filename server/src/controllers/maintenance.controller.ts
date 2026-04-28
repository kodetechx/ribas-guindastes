import { Request, Response } from 'express';
import { MaintenanceService } from '../services/maintenance.service';

const service = new MaintenanceService();

export class MaintenanceController {
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const maintenances = await service.getAllMaintenances();
      res.status(200).json(maintenances);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const maintenance = await service.getMaintenanceById(req.params.id);
      res.status(200).json(maintenance);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  public async getByEquipment(req: Request, res: Response): Promise<void> {
    try {
      const maintenances = await service.getByEquipment(req.params.equipmentId);
      res.status(200).json(maintenances);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const newMaintenance = await service.createMaintenance(req.body);
      res.status(201).json(newMaintenance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await service.updateMaintenance(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      await service.deleteMaintenance(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
