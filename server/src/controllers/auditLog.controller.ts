import { Request, Response } from 'express';
import { AuditLogService } from '../services/auditLog.service';

const service = new AuditLogService();

export class AuditLogController {
  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await service.getLogs(limit);
      res.status(200).json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public getByTarget = async (req: Request, res: Response): Promise<void> => {
    try {
      const { model, id } = req.params;
      const logs = await service.getTargetLogs(model, id);
      res.status(200).json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
