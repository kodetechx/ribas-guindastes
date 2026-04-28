import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  client: string;
  location: string;
  equipment: mongoose.Types.ObjectId;
  operators: mongoose.Types.ObjectId[];
  status: 'pending' | 'in_progress' | 'finished';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    client: { type: String, required: true },
    location: { type: String, required: true },
    equipment: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
    operators: [{ type: Schema.Types.ObjectId, ref: 'Operator' }],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'finished'],
      default: 'pending',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IService>('Service', ServiceSchema);
