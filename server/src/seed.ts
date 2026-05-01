import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Equipment from './models/Equipment';
import Operator from './models/Operator';

dotenv.config();

const equipmentSeedData = [
  { name: 'Guindaste RT 530', brand: 'Grove', model: 'RT 530E-2', year: 2018, serialNumber: 'GRV-7821-X', status: 'active' },
  { name: 'Empilhadeira Diesel 7t', brand: 'Hyster', model: 'H155FT', year: 2020, serialNumber: 'HYS-9902-B', status: 'maintenance' },
  { name: 'Caminhão Munck 45tm', brand: 'Mercedes-Benz', model: 'Axor 2644', year: 2022, serialNumber: 'MB-4412-M', status: 'active' },
];

const operatorSeedData = [
  {
    name: 'João Silva',
    email: 'joao@ribas.com',
    password: 'password123',
    registrationNumber: 'OP-001',
    cnh: { number: '000000', category: 'D', expiresAt: new Date() },
    nrs: [],
    role: 'operator',
  },
  {
    name: 'Maria Oliveira',
    email: 'maria@ribas.com',
    password: 'password123',
    registrationNumber: 'OP-002',
    cnh: { number: '000000', category: 'D', expiresAt: new Date() },
    nrs: [],
    role: 'operator',
  },
  {
    name: 'Admin User',
    email: 'admin@ribas.com',
    password: 'password123',
    registrationNumber: 'ADM-001',
    cnh: { number: '000000', category: 'B', expiresAt: new Date() },
    nrs: [],
    role: 'admin',
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
