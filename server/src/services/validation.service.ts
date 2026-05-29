import { ClientRepository } from '../repositories/client.repository';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { OperatorRepository } from '../repositories/operator.repository';
import { DocumentRepository } from '../repositories/document.repository';
import mongoose from 'mongoose';

const clientRepo = new ClientRepository();
const equipmentRepo = new EquipmentRepository();
const operatorRepo = new OperatorRepository();
const documentRepo = new DocumentRepository();

export class ValidationService {
  async validateEquipmentForClient(clientId: string, equipmentId: string) {
    const client = await clientRepo.findById(clientId);
    const equipment = await equipmentRepo.findById(equipmentId);

    if (!client || !equipment) {
      throw new Error('Client or Equipment not found');
    }

    const issues: string[] = [];

    // 1. Check required documents
    const equipmentDocuments = await documentRepo.findByOwner(new mongoose.Types.ObjectId(equipmentId));
    
    for (const reqDoc of client.requiredDocuments) {
      const doc = equipmentDocuments.find(d => d.type === reqDoc.documentTypeId);
      
      if (!doc) {
        issues.push(`Documento obrigatório ausente: ${reqDoc.documentTypeId}`);
      } else if (doc.status === 'expired') {
        issues.push(`Documento vencido: ${reqDoc.documentTypeId}`);
      }
    }

    // 2. Check equipment type rules
    const typeRule = client.equipmentRules.find(r => r.equipmentTypeId === equipment.brand || r.equipmentTypeId === equipment.name);
    // This logic might need refinement based on how equipment types are categorized
    // For now, let's assume if there are rules and this equipment isn't allowed, it's an issue
    // (Simplification for initial version)

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  async validateOperatorForClient(clientId: string, operatorId: string) {
    const client = await clientRepo.findById(clientId);
    const operator = await operatorRepo.findById(operatorId);

    if (!client || !operator) {
      throw new Error('Client or Operator not found');
    }

    const issues: string[] = [];

    // 1. Check CNH
    const now = new Date();
    if (operator.cnh.expiresAt < now) {
      issues.push('CNH vencida');
    }

    // 2. Check NRs/Documents required by client
    // Operators might have NRs in their model or as Document entities. 
    // Looking at Operator.ts, they have an 'nrs' array.
    
    for (const reqDoc of client.requiredDocuments) {
      // Check if it's an NR in the operator model
      const nr = operator.nrs.find(n => n.type === reqDoc.documentTypeId);
      if (nr) {
        if (nr.expiresAt < now) {
          issues.push(`NR vencida: ${reqDoc.documentTypeId}`);
        }
        continue;
      }

      // If not an NR, check Document entities
      const operatorDocs = await documentRepo.findByOwner(new mongoose.Types.ObjectId(operatorId));
      const doc = operatorDocs.find(d => d.type === reqDoc.documentTypeId);
      
      if (!doc) {
        issues.push(`Documento/Treinamento obrigatório ausente: ${reqDoc.documentTypeId}`);
      } else if (doc.status === 'expired') {
        issues.push(`Documento/Treinamento vencido: ${reqDoc.documentTypeId}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
