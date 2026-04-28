import { ServiceRepository } from '../repositories/service.repository';
import { IService } from '../models/Service';

const repository = new ServiceRepository();

export class ServiceService {
  async getAllServices() {
    return await repository.findAll();
  }

  async createService(data: Partial<IService>) {
    if (!data.equipment) throw new Error('Equipamento é obrigatório');

    // Regra: Equipamento não pode estar em dois serviços ativos
    const activeService = await repository.findActiveByEquipment(data.equipment as any);
    if (activeService) {
      throw new Error('Equipamento já possui um serviço ativo/pendente.');
    }

    return await repository.create(data);
  }

  async updateService(id: string, data: Partial<IService>) {
    return await repository.update(id, data);
  }
}
