import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface INR {
  type: string;
  expiresAt: Date;
}

export interface IOperator extends Document {
  name: string;
  email: string;
  password?: string;
  registrationNumber: string;
  cnh: {
    number: string;
    category: string;
    expiresAt: Date;
  };
  nrs: INR[];
  isActive: boolean;
  photoUrl?: string;
  role: 'admin' | 'manager' | 'operator';
  createdAt: Date;
  updatedAt: Date;
}

const OperatorSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Opcional por enquanto
    registrationNumber: { type: String, required: true, unique: true },
    cnh: {
      number: { type: String, required: true },
      category: { type: String, required: true },
      expiresAt: { type: Date, required: true },
    },
    nrs: [
      {
        type: { type: String, required: true },
        expiresAt: { type: Date, required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
    photoUrl: { type: String },
    role: {
      type: String,
      enum: ['admin', 'manager', 'operator'],
      default: 'operator',
    },
  },
  { timestamps: true }
);

OperatorSchema.pre<IOperator>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

export default mongoose.model<IOperator>('Operator', OperatorSchema);
