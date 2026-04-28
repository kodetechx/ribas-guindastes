import Document, { IDocument } from '../models/Document';

export class DocumentRepository {
  async findAllByOwner(ownerId: string, category: 'operator' | 'equipment') {
    return await Document.find({ ownerId, category });
  }

  async create(data: Partial<IDocument>) {
    return await Document.create(data);
  }

  async delete(id: string) {
    return await Document.findByIdAndDelete(id);
  }
}
