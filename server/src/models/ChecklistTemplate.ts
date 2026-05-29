import mongoose, { Schema, Document } from 'mongoose';

export interface IChecklistTemplateItem {
  label: string;
  description?: string;
  required: boolean;
  order: number;
}

export interface IChecklistTemplate extends Document {
  name: string;
  description?: string;
  items: IChecklistTemplateItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    items: [
      {
        label: { type: String, required: true },
        description: { type: String },
        required: { type: Boolean, default: true },
        order: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IChecklistTemplate>('ChecklistTemplate', ChecklistTemplateSchema);
