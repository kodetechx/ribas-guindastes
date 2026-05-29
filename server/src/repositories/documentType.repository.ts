import DocumentType, { IDocumentType } from '../models/DocumentType';

export class DocumentTypeRepository {
  async findAll(): Promise<IDocumentType[]> {
    return await DocumentType.find().sort({ name: 1 });
  }

  async findActive(): Promise<IDocumentType[]> {
    return await DocumentType.find({ isActive: true }).sort({ name: 1 });
  }

  async findById(id: string): Promise<IDocumentType | null> {
    return await DocumentType.findById(id);
  }

  async create(data: Partial<IDocumentType>): Promise<IDocumentType> {
    const docType = new DocumentType(data);
    return await docType.save();
  }

  async update(id: string, data: Partial<IDocumentType>): Promise<IDocumentType | null> {
    return await DocumentType.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IDocumentType | null> {
    return await DocumentType.findByIdAndDelete(id);
  }
}
