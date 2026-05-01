import { Request, Response } from 'express';
import { ChecklistService } from '../services/checklist.service';

const service = new ChecklistService();

export class ChecklistController {
  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const checklists = await service.getAllChecklists();
      res.status(200).json(checklists);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const checklist = await service.getChecklistById(req.params.id);
      res.status(200).json(checklist);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  public create = async (req: any, res: Response): Promise<void> => {
    try {
      // Auto-assign operator from token if not provided
      const checklistData = {
        ...req.body,
        operator: req.body.operator || req.user.id
      };
      const newChecklist = await service.createChecklist(checklistData);
      res.status(201).json(newChecklist);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public getByEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
      const checklists = await service.getByEquipment(req.params.equipmentId);
      res.status(200).json(checklists);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  
  public checkToday = async (req: Request, res: Response): Promise<void> => {
    try {
      const exists = await service.checkToday(req.params.equipmentId);
      res.status(200).json({ hasChecklist: exists });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await service.updateChecklist(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await service.deleteChecklist(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
