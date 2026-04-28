import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  name: string;
  type: string; // ex: 'NR-11', 'CNH', 'Certificado', 'Manual'
  category: 'operator' | 'equipment';
  ownerId: mongoose.Types.ObjectId; // ID do operador ou equipamento
  fileUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
  expiresAt?: Date;
  status: 'valid' | 'warning' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: String, enum: ['operator', 'equipment'], required: true },
    ownerId: { type: Schema.Types.ObjectId, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: ['valid', 'warning', 'expired'],
      default: 'valid',
    },
  },
  { timestamps: true }
);

// Middleware para atualizar status baseado na data de validade antes de salvar
DocumentSchema.pre<IDocument>('save', function (next) {
  if (this.expiresAt) {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (this.expiresAt < now) {
      this.status = 'expired';
    } else if (this.expiresAt < thirtyDaysFromNow) {
      this.status = 'warning';
    } else {
      this.status = 'valid';
    }
  }
  next();
});

export default mongoose.model<IDocument>('Document', DocumentSchema);
