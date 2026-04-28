import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  targetModel: 'Equipment' | 'Operator' | 'Checklist' | 'Maintenance' | 'Service';
  targetId: mongoose.Types.ObjectId;
  details: any;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'Operator', required: true },
  action: { type: String, required: true }, // ex: 'UPDATE', 'CREATE', 'DELETE'
  targetModel: { type: String, enum: ['Equipment', 'Operator', 'Checklist', 'Maintenance', 'Service'], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  details: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
