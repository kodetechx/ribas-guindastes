import { DocumentRepository } from '../repositories/document.repository';
import { IDocument } from '../models/Document';

const repository = new DocumentRepository();

export class DocumentService {
  async getDocumentsByOwner(ownerId: string, category: 'operator' | 'equipment') {
    return await repository.findAllByOwner(ownerId, category);
  }

  async uploadDocument(data: Partial<IDocument>) {
    return await repository.create(data);
  }

  async deleteDocument(id: string) {
    return await repository.delete(id);
  }
}
