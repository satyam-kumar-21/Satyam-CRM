import { Schema, model, Document } from 'mongoose';

export interface ISuperAdmin extends Document {
  name: string;
  email: string;
  passwordHash: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SuperAdminSchema = new Schema<ISuperAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

export const SuperAdmin = model<ISuperAdmin>('SuperAdmin', SuperAdminSchema);