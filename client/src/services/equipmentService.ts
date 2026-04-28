import api from './api';

export interface Equipment {
  _id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  serialNumber: string;
  status: 'active' | 'maintenance' | 'blocked';
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export const equipmentService = {
  async getAll() {
    const response = await api.get<Equipment[]>('/equipments');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Equipment>(`/equipments/${id}`);
    return response.data;
  },

  async create(data: Partial<Equipment>) {
    const response = await api.post<Equipment>('/equipments', data);
    return response.data;
  },

  async update(id: string, data: Partial<Equipment>) {
    const response = await api.put<Equipment>(`/equipments/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/equipments/${id}`);
  },
};
