import mongoose, { Schema, Document } from 'mongoose';

export interface IOccurrence {
  type: 'weather' | 'equipment_failure' | 'wait_for_client' | 'safety_halt' | 'other';
  description: string;
  createdAt: Date;
  photoUrl?: string;
}

export interface IService extends Document {
  title: string;
  clientId: mongoose.Types.ObjectId;
  location: string;
  equipments: mongoose.Types.ObjectId[];
  operators: mongoose.Types.ObjectId[];
  status: 'pending' | 'in_progress' | 'finished';
  occurrences: IOccurrence[];
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
    equipments: [{ type: Schema.Types.ObjectId, ref: 'Equipment', required: true }],
    operators: [{ type: Schema.Types.ObjectId, ref: 'Operator' }],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'finished'],
      default: 'pending',
    },
    occurrences: [
      {
        type: { 
          type: String, 
          enum: ['weather', 'equipment_failure', 'wait_for_client', 'safety_halt', 'other'],
          required: true 
        },
        description: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        photoUrl: { type: String }
      }
    ],
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
