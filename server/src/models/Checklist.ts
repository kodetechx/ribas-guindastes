import mongoose, { Schema, Document } from 'mongoose';

export interface IChecklistItem {
  label: string;
  status: 'ok' | 'not_ok' | 'na';
  observation?: string;
}

export interface IChecklist extends Document {
  equipment: mongoose.Types.ObjectId;
  operator: mongoose.Types.ObjectId;
  date: Date;
  items: IChecklistItem[];
  isApproved: boolean;
  notes?: string;
  signatureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistSchema: Schema = new Schema(
  {
    equipment: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true },
    date: { type: Date, default: Date.now },
    items: [
      {
        label: { type: String, required: true },
        status: { type: String, enum: ['ok', 'not_ok', 'na'], required: true },
        observation: { type: String },
      },
    ],
    isApproved: { type: Boolean, required: true },
    notes: { type: String },
    signatureUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IChecklist>('Checklist', ChecklistSchema);
