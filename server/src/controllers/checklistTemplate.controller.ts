import { Request, Response } from 'express';
import { ChecklistTemplateService } from '../services/checklistTemplate.service';

const service = new ChecklistTemplateService();

export class ChecklistTemplateController {
  async getAll(req: Request, res: Response) {
    try {
      const templates = await service.getAllTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const template = await service.getTemplateById(req.params.id as string);
      res.json(template);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async create(req: any, res: Response) {
    try {
      const template = await service.createTemplate(req.body, req.user?.id);
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async update(req: any, res: Response) {
    try {
      const template = await service.updateTemplate(req.params.id, req.body, req.user?.id);
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async delete(req: any, res: Response) {
    try {
      await service.deleteTemplate(req.params.id, req.user?.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }
}
