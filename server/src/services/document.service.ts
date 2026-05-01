import mongoose from 'mongoose';
import { DocumentRepository } from '../repositories/document.repository';
import { OperatorRepository } from '../repositories/operator.repository';
import { IDocument } from '../models/Document';

const repository = new DocumentRepository();
const operatorRepository = new OperatorRepository();

export class DocumentService {
  async getDocumentsByOwner(ownerId: string, category: 'operator' | 'equipment') {
    return await repository.findAllByOwner(ownerId, category);
  }

  async uploadDocument(data: any) {
    if (data.ownerId && typeof data.ownerId === 'string') {
      data.ownerId = new mongoose.Types.ObjectId(data.ownerId);
    }
    
    const doc = await repository.create(data);

    // Sincronizar com Operador se for um documento de certificação
    if (doc.category === 'operator' && doc.ownerId) {
      const type = doc.type || '';
      if (type.startsWith('Certificação NR') || type === 'CNH') {
        const operator = await operatorRepository.findById(doc.ownerId.toString());
        if (operator) {
          if (type.startsWith('Certificação NR')) {
            const nrType = type.replace('Certificação ', '');
            const existingNRIdx = operator.nrs.findIndex(n => n.type === nrType);
            
            if (existingNRIdx > -1) {
              operator.nrs[existingNRIdx].expiresAt = doc.expiresAt || new Date();
            } else {
              operator.nrs.push({ type: nrType, expiresAt: doc.expiresAt || new Date() });
            }
          } else if (type === 'CNH') {
            operator.cnh.expiresAt = doc.expiresAt || new Date();
          }
          await operatorRepository.update(operator._id.toString(), operator);
        }
      }
    }

    return doc;
  }

  async updateDocument(id: string, data: Partial<IDocument>) {
    return await repository.update(id, data);
  }

  async deleteDocument(id: string) {
    return await repository.delete(id);
  }
}
