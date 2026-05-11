import { Request, Response } from 'express';
import { MaintenanceService } from '../services/maintenance.service';

const service = new MaintenanceService();

export class MaintenanceController {
  public getAll = async (req: Request, res: Response) => {
    try {
      const maintenances = await service.getAllMaintenances();
      res.json(maintenances);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getById = async (req: Request, res: Response) => {
    try {
      const maintenance = await service.getMaintenanceById(req.params.id);
      res.json(maintenance);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  public getByEquipment = async (req: Request, res: Response) => {
    try {
      // Corrigido: usando equipmentId conforme definido na rota
      const { equipmentId } = req.params;
      const maintenances = await service.getByEquipment(equipmentId);
      res.json(maintenances);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public create = async (req: any, res: Response) => {
    try {
      const maintenance = await service.createMaintenance(req.body, req.user?.id);
      res.status(201).json(maintenance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  public update = async (req: any, res: Response) => {
    try {
      const maintenance = await service.updateMaintenance(req.params.id, req.body, req.user?.id);
      res.json(maintenance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  public delete = async (req: any, res: Response) => {
    try {
      await service.deleteMaintenance(req.params.id, req.user?.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };
}
