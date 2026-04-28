import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenance extends Document {
  equipment: mongoose.Types.ObjectId;
  date: Date;
  type: 'preventive' | 'corrective' | 'inspection';
  description: string;
  cost: number;
  mechanic: string;
  partsReplaced: string[];
  nextMaintenanceDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema: Schema = new Schema(
  {
    equipment: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ['preventive', 'corrective', 'inspection'],
      required: true,
    },
    description: { type: String, required: true },
    cost: { type: Number, default: 0 },
    mechanic: { type: String, required: true },
    partsReplaced: [{ type: String }],
    nextMaintenanceDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);
