import mongoose, { Schema, Document } from 'mongoose';

export interface IClientRequiredDocument {
  documentTypeId: string; // Ex: 'NR11', 'NR35'
  required: boolean;
}

export interface IClientEquipmentRule {
  equipmentTypeId: string; // Ex: 'Guindaste', 'Empilhadeira'
  required: boolean;
}

export interface IClient extends Document {
  name: string;
  fantasyName: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  requiredDocuments: IClientRequiredDocument[];
  equipmentRules: IClientEquipmentRule[];
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    fantasyName: { type: String, required: true },
    cnpj: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String },
    requiredDocuments: [
      {
        documentTypeId: { type: String, required: true },
        required: { type: Boolean, default: true },
      },
    ],
    equipmentRules: [
      {
        equipmentTypeId: { type: String, required: true },
        required: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IClient>('Client', ClientSchema);
