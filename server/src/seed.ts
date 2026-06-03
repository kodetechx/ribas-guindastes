import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Equipment from './models/Equipment';
import Operator from './models/Operator';
import Client from './models/Client';
import DocumentType from './models/DocumentType';
import ChecklistTemplate from './models/ChecklistTemplate';
import Service from './models/Service';
import DocumentModel from './models/Document';
import Checklist from './models/Checklist';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ribas');
    console.log('Connected to MongoDB for seeding...');

    // Clear all collections
    await Promise.all([
      Equipment.deleteMany({}),
      Operator.deleteMany({}),
      Client.deleteMany({}),
      DocumentType.deleteMany({}),
      ChecklistTemplate.deleteMany({}),
      Service.deleteMany({}),
      DocumentModel.deleteMany({}),
      Checklist.deleteMany({}),
    ]);
    console.log('Cleared existing data.');

    // 1. Seed Document Types
    const docTypes = await DocumentType.insertMany([
      { name: 'NR-11', category: 'operator', description: 'Transporte, Movimentação, Armazenagem e Manuseio de Materiais' },
      { name: 'NR-12', category: 'equipment', description: 'Segurança no Trabalho em Máquinas e Equipamentos' },
      { name: 'NR-35', category: 'operator', description: 'Trabalho em Altura' },
      { name: 'ASO', category: 'operator', description: 'Atestado de Saúde Ocupacional' },
      { name: 'ART', category: 'equipment', description: 'Anotação de Responsabilidade Técnica' },
      { name: 'LAUDO ESTRUTURAL', category: 'equipment', description: 'Laudo de integridade do equipamento' },
      { name: 'CNH', category: 'operator', description: 'Carteira Nacional de Habilitação' },
    ]);
    console.log('Document types seeded.');

    // 2. Seed Checklist Templates
    const template = await ChecklistTemplate.create({
      name: 'Padrão Guindaste Rodoviário',
      description: 'Checklist obrigatório para guindastes sobre pneus.',
      items: [
        { label: 'Nível de óleo do motor', required: true, order: 1 },
        { label: 'Vazamentos hidráulicos (Patolas/Lança)', required: true, order: 2 },
        { label: 'Estado dos cabos de aço', required: true, order: 3 },
        { label: 'Funcionamento do limitador de carga', required: true, order: 4 },
        { label: 'Pressão dos pneus', required: true, order: 5 },
        { label: 'Sinal sonora de ré e iluminação', required: true, order: 6 },
      ]
    });
    console.log('Checklist templates seeded.');

    // 3. Seed Clients
    const clients = await Client.insertMany([
      {
        name: 'Petrobras S.A.',
        fantasyName: 'PETROBRAS',
        cnpj: '33.000.167/0001-01',
        phone: '(21) 3224-4477',
        email: 'suprimentos@petrobras.com.br',
        address: 'Av. República do Chile, 65 - Rio de Janeiro, RJ',
        requiredDocuments: [
          { documentTypeId: 'NR-11', required: true },
          { documentTypeId: 'NR-35', required: true },
          { documentTypeId: 'ASO', required: true },
          { documentTypeId: 'LAUDO ESTRUTURAL', required: true }
        ]
      },
      {
        name: 'Vale S.A.',
        fantasyName: 'VALE',
        cnpj: '33.592.510/0001-54',
        phone: '(31) 3916-2000',
        email: 'gestao.contratos@vale.com',
        address: 'Rua de Passagem, 123 - Nova Lima, MG',
        requiredDocuments: [
          { documentTypeId: 'NR-11', required: true },
          { documentTypeId: 'ART', required: true }
        ]
      }
    ]);
    console.log('Clients seeded.');

    // 4. Seed Operators
    const operators = await Operator.create([
      {
        name: 'João Operador',
        email: 'joao@ribas.com',
        password: 'password123',
        registrationNumber: 'RIB-001',
        role: 'operator',
        cnh: { number: '123456789', category: 'D', expiresAt: new Date(2027, 0, 1) },
        nrs: [
          { type: 'NR-11', expiresAt: new Date(2026, 5, 15) },
          { type: 'NR-35', expiresAt: new Date(2026, 11, 20) }
        ]
      },
      {
        name: 'Maria Silva',
        email: 'maria@ribas.com',
        password: 'password123',
        registrationNumber: 'RIB-002',
        role: 'operator',
        cnh: { number: '987654321', category: 'E', expiresAt: new Date(2028, 5, 10) },
        nrs: [{ type: 'NR-11', expiresAt: new Date(2026, 8, 1) }]
      },
      {
        name: 'Tiago Admin',
        email: 'admin@ribas.com',
        password: 'password123',
        registrationNumber: 'ADM-001',
        role: 'admin',
        cnh: { number: '555555555', category: 'B', expiresAt: new Date(2030, 0, 1) },
        nrs: []
      }
    ]);
    console.log('Operators seeded.');

    // 5. Seed Equipments
    const equipments = await Equipment.insertMany([
      {
        name: 'Guindaste RT 530',
        brand: 'Grove',
        equipmentModel: 'RT 530E-2',
        year: 2018,
        serialNumber: 'GRV-7821-X',
        status: 'active',
        checklistTemplateId: template._id,
        nextMaintenance: new Date(2026, 6, 15)
      },
      {
        name: 'Caminhão Munck 45tm',
        brand: 'Mercedes-Benz',
        equipmentModel: 'Axor 2644',
        year: 2022,
        serialNumber: 'MB-4412-M',
        status: 'active',
        nextMaintenance: new Date(2026, 5, 30)
      }
    ]);
    console.log('Equipments seeded.');

    // 6. Seed Documents
    await DocumentModel.insertMany([
      {
        name: 'Laudo Estrutural 2026 - RT 530',
        type: 'LAUDO ESTRUTURAL',
        category: 'equipment',
        ownerId: equipments[0]._id,
        fileUrl: 'uploads/mock-laudo.pdf',
        fileName: 'mock-laudo.pdf',
        mimeType: 'application/pdf',
        size: 1024 * 500, // 500KB
        expiresAt: new Date(2027, 0, 1),
        status: 'valid'
      },
      {
        name: 'ART de Inspeção - Munck',
        type: 'ART',
        category: 'equipment',
        ownerId: equipments[1]._id,
        fileUrl: 'uploads/mock-art.pdf',
        fileName: 'mock-art.pdf',
        mimeType: 'application/pdf',
        size: 1024 * 300, // 300KB
        expiresAt: new Date(2026, 10, 1),
        status: 'valid'
      }
    ]);
    console.log('Documents seeded.');

    // 7. Seed Services
    await Service.create([
      {
        title: 'Manutenção em Refinaria',
        clientId: clients[0]._id,
        location: 'Duarte da Costa, RJ',
        equipment: equipments[0]._id,
        operators: [operators[0]._id],
        status: 'in_progress',
        startDate: new Date()
      },
      {
        title: 'Carga e Descarga de Minério',
        clientId: clients[1]._id,
        location: 'Mina do Sossego, PA',
        equipment: equipments[1]._id,
        operators: [operators[1]._id],
        status: 'pending',
        startDate: new Date()
      }
    ]);
    console.log('Services seeded.');

    // 8. Seed some initial checklists
    await Checklist.create({
      equipment: equipments[0]._id,
      operator: operators[0]._id,
      date: new Date(),
      isApproved: true,
      items: template.items.map(i => ({ label: i.label, status: 'ok' })),
      notes: 'Equipamento em perfeitas condições.'
    });

    console.log('Checklists seeded.');
    console.log('Successfully seeded database with all new features!');

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
