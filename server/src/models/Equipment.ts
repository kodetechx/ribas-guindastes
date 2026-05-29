import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  brand: string;
  equipmentModel: string;
  year: number;
  serialNumber: string;
  status: 'active' | 'maintenance' | 'blocked';
  qrCode?: string;
  documents: string[];
  checklistTemplateId?: mongoose.Types.ObjectId;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    equipmentModel: { type: String, required: true },
    year: { type: Number, required: true },
    serialNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'blocked'],
      default: 'active',
    },
    qrCode: { type: String },
    documents: [{ type: String }],
    checklistTemplateId: { type: Schema.Types.ObjectId, ref: 'ChecklistTemplate' },
    lastMaintenance: { type: Date },
    nextMaintenance: { type: Date },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);
