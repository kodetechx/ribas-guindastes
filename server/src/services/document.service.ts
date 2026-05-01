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
    if (data.ownerId && typeof data.ownerId === 'string' && mongoose.Types.ObjectId.isValid(data.ownerId)) {
      data.ownerId = new mongoose.Types.ObjectId(data.ownerId);
    } else if (data.ownerId && !mongoose.Types.ObjectId.isValid(data.ownerId)) {
      throw new Error('ID_PROPRIETARIO_INVALIDO');
    }
    
    // Garantir que expiresAt seja tratado corretamente como UTC
    if (data.expiresAt === '') {
      delete data.expiresAt;
    } else if (data.expiresAt) {
      // Adiciona T00:00:00 para garantir que o JS crie a data como UTC e não local time
      const dateString = typeof data.expiresAt === 'string' && data.expiresAt.includes('T') 
        ? data.expiresAt 
        : `${data.expiresAt}T00:00:00Z`;
      data.expiresAt = new Date(dateString);
    }

    const doc = await repository.create(data);

    // Sincronizar com Operador se for um documento de certificação
    if (doc.category === 'operator' && doc.ownerId) {
      const type = doc.type || '';
      if (type.startsWith('Certificação NR') || type === 'CNH') {
        const operator = await operatorRepository.findById(doc.ownerId.toString());
        if (operator) {
          const operatorObj = operator.toObject();
          if (type.startsWith('Certificação NR')) {
            const nrType = type.replace('Certificação ', '');
            const existingNRIdx = operatorObj.nrs.findIndex((n: any) => n.type === nrType);
            
            if (existingNRIdx > -1) {
              operatorObj.nrs[existingNRIdx].expiresAt = doc.expiresAt || new Date();
            } else {
              operatorObj.nrs.push({ type: nrType, expiresAt: doc.expiresAt || new Date() });
            }
          } else if (type === 'CNH') {
            operatorObj.cnh.expiresAt = doc.expiresAt || new Date();
          }
          await operatorRepository.update(operatorObj._id.toString(), operatorObj);
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
