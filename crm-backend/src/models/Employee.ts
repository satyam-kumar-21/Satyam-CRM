import { Schema, model, Document } from 'mongoose';
import { Roles } from '../constants/index';
import { tenantPlugin } from '../plugins/tenantPlugin';

export interface IEmployee extends Document {
  companyId: Schema.Types.ObjectId;
  employeeId: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  avatar?: string;
  role: Roles;
  permissions: string[];
  departmentId?: Schema.Types.ObjectId;
  teamId?: Schema.Types.ObjectId;
  isSuspended: boolean;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: Object.values(Roles), default: Roles.EMPLOYEE },
    permissions: { type: [String], default: [] },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    isSuspended: { type: Boolean, default: false },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

EmployeeSchema.index({ companyId: 1, email: 1 }, { unique: true });
EmployeeSchema.index({ companyId: 1, employeeId: 1 }, { unique: true });
EmployeeSchema.plugin(tenantPlugin);

export const Employee = model<IEmployee>('Employee', EmployeeSchema);