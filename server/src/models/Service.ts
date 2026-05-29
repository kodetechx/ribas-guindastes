import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  clientId: mongoose.Types.ObjectId;
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
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
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

// Virtual for backward compatibility or population ease
ServiceSchema.virtual('client', {
  ref: 'Client',
  localField: 'clientId',
  foreignField: '_id',
  justOne: true
});

ServiceSchema.set('toJSON', { virtuals: true });
ServiceSchema.set('toObject', { virtuals: true });

export default mongoose.model<IService>('Service', ServiceSchema);
