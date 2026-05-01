import Document, { IDocument } from '../models/Document';

export class DocumentRepository {
  async findAllByOwner(ownerId: string, category: 'operator' | 'equipment') {
    return await Document.find({ ownerId, category });
  }

  async create(data: Partial<IDocument>) {
    return await Document.create(data);
  }

  async update(id: string, data: Partial<IDocument>) {
    const doc = await Document.findById(id);
    if (!doc) throw new Error('Documento não encontrado');
    
    Object.assign(doc, data);
    return await doc.save();
  }

  async delete(id: string) {
    return await Document.findByIdAndDelete(id);
  }
}
