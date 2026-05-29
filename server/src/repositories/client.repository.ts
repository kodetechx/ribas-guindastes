import Client, { IClient } from '../models/Client';

export class ClientRepository {
  async findAll(): Promise<IClient[]> {
    return await Client.find().sort({ name: 1 });
  }

  async findById(id: string): Promise<IClient | null> {
    return await Client.findById(id);
  }

  async create(data: Partial<IClient>): Promise<IClient> {
    const client = new Client(data);
    return await client.save();
  }

  async update(id: string, data: Partial<IClient>): Promise<IClient | null> {
    return await Client.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IClient | null> {
    return await Client.findByIdAndDelete(id);
  }
}
