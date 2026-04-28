import api from './api';

export interface INR {
  type: string;
  expiresAt: string;
}

export interface Operator {
  _id: string;
  name: string;
  email: string;
  registrationNumber: string;
  cnh: {
    number: string;
    category: string;
    expiresAt: string;
  };
  nrs: INR[];
  isActive: boolean;
  photoUrl?: string;
  role: 'admin' | 'manager' | 'operator';
}

export const operatorService = {
  async getAll() {
    const response = await api.get<Operator[]>('/operators');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Operator>(`/operators/${id}`);
    return response.data;
  },

  async create(data: Partial<Operator>) {
    const response = await api.post<Operator>('/operators', data);
    return response.data;
  },

  async update(id: string, data: Partial<Operator>) {
    const response = await api.put<Operator>(`/operators/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/operators/${id}`);
  },
};
