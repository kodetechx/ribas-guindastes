import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  brand: string;
  model: string;
  year: number;
  serialNumber: string;
  status: 'active' | 'maintenance' | 'blocked';
  qrCode?: string;
  documents: string[];
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    serialNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'blocked'],
      default: 'active',
    },
    qrCode: { type: String },
    documents: [{ type: String }],
    lastMaintenance: { type: Date },
    nextMaintenance: { type: Date },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);
