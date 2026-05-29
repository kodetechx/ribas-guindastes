import { ClientRepository } from '../repositories/client.repository';
import { IClient } from '../models/Client';
import { AuditLogService } from './auditLog.service';

const repository = new ClientRepository();
const auditLog = new AuditLogService();

export class ClientService {
  async getAllClients() {
    return await repository.findAll();
  }

  async getClientById(id: string) {
    const client = await repository.findById(id);
    if (!client) {
      throw new Error('Client not found');
    }
    return client;
  }

  async createClient(data: Partial<IClient>, userId?: string) {
    const client = await repository.create(data);
    if (userId) {
      await auditLog.log(userId, 'CREATE', 'Client', client._id.toString(), { name: client.name });
    }
    return client;
  }

  async updateClient(id: string, data: Partial<IClient>, userId?: string) {
    const updated = await repository.update(id, data);
    if (!updated) {
      throw new Error('Client not found');
    }
    if (userId) {
      await auditLog.log(userId, 'UPDATE', 'Client', id, data);
    }
    return updated;
  }

  async deleteClient(id: string, userId?: string) {
    const client = await repository.findById(id);
    const deleted = await repository.delete(id);
    if (!deleted) {
      throw new Error('Client not found');
    }
    if (userId) {
      await auditLog.log(userId, 'DELETE', 'Client', id, { name: client?.name });
    }
    return deleted;
  }
}
