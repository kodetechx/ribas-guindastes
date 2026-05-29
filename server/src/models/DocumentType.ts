import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentType extends Document {
  name: string; // Ex: 'NR11', 'CNH', 'ART'
  category: 'operator' | 'equipment' | 'both';
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentTypeSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { 
      type: String, 
      enum: ['operator', 'equipment', 'both'], 
      default: 'both' 
    },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDocumentType>('DocumentType', DocumentTypeSchema);
