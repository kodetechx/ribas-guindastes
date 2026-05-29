import { Request, Response } from 'express';
import { DocumentTypeService } from '../services/documentType.service';

const service = new DocumentTypeService();

export class DocumentTypeController {
  async getAll(req: Request, res: Response) {
    try {
      const types = await service.getAll();
      res.json(types);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getActive(req: Request, res: Response) {
    try {
      const types = await service.getActive();
      res.json(types);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: any, res: Response) {
    try {
      const type = await service.create(req.body, req.user?.id);
      res.status(201).json(type);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: any, res: Response) {
    try {
      const type = await service.update(req.params.id, req.body, req.user?.id);
      res.json(type);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: any, res: Response) {
    try {
      await service.delete(req.params.id, req.user?.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}
