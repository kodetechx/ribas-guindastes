import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Equipment from './models/Equipment';
import Operator from './models/Operator';

dotenv.config();

const equipmentSeedData = [
  {
    name: 'Guindaste RT 530',
    brand: 'Grove',
    model: 'RT 530E-2',
    year: 2018,
    serialNumber: 'GRV-7821-X',
    status: 'active',
    nextMaintenance: new Date('2026-06-15'),
  },
  {
    name: 'Empilhadeira Diesel 7t',
    brand: 'Hyster',
    model: 'H155FT',
    year: 2020,
    serialNumber: 'HYS-9902-B',
    status: 'maintenance',
    nextMaintenance: new Date('2026-04-30'),
  },
  {
    name: 'Caminhão Munck 45tm',
    brand: 'Mercedes-Benz / Madal',
    model: 'Axor 2644 / MD 45007',
    year: 2022,
    serialNumber: 'MB-4412-M',
    status: 'active',
    nextMaintenance: new Date('2026-08-20'),
  },
  {
    name: 'Plataforma Tesoura 12m',
    brand: 'JLG',
    model: '3246ES',
    year: 2019,
    serialNumber: 'JLG-5543-P',
    status: 'blocked',
    nextMaintenance: new Date('2026-03-01'),
  }
];

const operatorSeedData = [
  {
    name: 'João Silva',
    email: 'joao@ribas.com',
    password: 'password123',
    registrationNumber: 'OP-001',
    cnh: {
      number: '123456789',
      category: 'D',
      expiresAt: new Date('2028-12-31'),
    },
    nrs: [
      { type: 'NR11', expiresAt: new Date('2026-10-10') },
      { type: 'NR12', expiresAt: new Date('2026-05-15') },
    ],
    role: 'operator',
    isActive: true,
  },
  {
    name: 'Maria Oliveira',
    email: 'maria@ribas.com',
    password: 'password123',
    registrationNumber: 'OP-002',
    cnh: {
      number: '987654321',
      category: 'E',
      expiresAt: new Date('2025-05-20'),
    },
    nrs: [
      { type: 'NR11', expiresAt: new Date('2026-01-01') },
      { type: 'NR35', expiresAt: new Date('2026-06-30') },
    ],
    role: 'operator',
    isActive: true,
  },
  {
    name: 'Carlos Santos',
    email: 'carlos@ribas.com',
    password: 'password123',
    registrationNumber: 'ADM-001',
    cnh: {
      number: '456789123',
      category: 'B',
      expiresAt: new Date('2027-01-01'),
    },
    nrs: [],
    role: 'admin',
    isActive: true,
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ribas');
    console.log('Connected to MongoDB for seeding...');

    await Equipment.deleteMany({});
    await Operator.deleteMany({});
    console.log('Cleared existing data.');

    await Equipment.insertMany(equipmentSeedData);
    await Operator.create(operatorSeedData);
    console.log('Successfully seeded database!');

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
