import { Request, Response } from 'express';
import { ClientService } from '../services/client.service';

const service = new ClientService();

export class ClientController {
  async getAll(req: Request, res: Response) {
    try {
      const clients = await service.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const client = await service.getClientById(req.params.id as string);
      res.json(client);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async create(req: any, res: Response) {
    try {
      const client = await service.createClient(req.body, req.user?.id);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async update(req: any, res: Response) {
    try {
      const client = await service.updateClient(req.params.id, req.body, req.user?.id);
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async delete(req: any, res: Response) {
    try {
      await service.deleteClient(req.params.id, req.user?.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }
}
