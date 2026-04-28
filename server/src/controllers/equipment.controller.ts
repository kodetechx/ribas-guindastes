import { Request, Response } from 'express';
import { EquipmentService } from '../services/equipment.service';

const service = new EquipmentService();

export class EquipmentController {
  async getAll(req: Request, res: Response) {
    try {
      const equipments = await service.getAllEquipments();
      res.json(equipments);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const equipment = await service.getEquipmentById(req.params.id);
      res.json(equipment);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const equipment = await service.createEquipment(req.body);
      res.status(201).json(equipment);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const equipment = await service.updateEquipment(req.params.id, req.body);
      res.json(equipment);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await service.deleteEquipment(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }
}
