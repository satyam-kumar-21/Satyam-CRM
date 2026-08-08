import bcrypt from 'bcrypt';
import { Employee, IEmployee } from '../models/Employee';
import { Company } from '../models/Company';
import { Roles, CompanyStatus } from '../constants/index';
import { generateAccessToken, generateRefreshToken, ITokenPayload } from '../utils/jwt';
import { Group } from '../models/Group';
import { Message, IMessage } from '../models/Message';

export class CompanyAuthService {
  static async login(companyCode: string, email: string, password: string) {
    const company = await Company.findOne({ companyCode: companyCode.toUpperCase(), status: CompanyStatus.ACTIVE });
    if (!company) {
      throw { statusCode: 401, message: 'Invalid company credentials.' };
    }

    const employee = await Employee.findOne({ companyId: company._id, email: email.toLowerCase() });
    if (!employee || employee.isSuspended) {
      throw { statusCode: 401, message: 'Invalid employee credentials or account suspended.' };
    }

    const isMatch = await bcrypt.compare(password, employee.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid employee credentials.' };
    }

    const payload: ITokenPayload = {
      id: employee._id.toString(),
      role: employee.role,
      companyId: company._id.toString(),
      portalType: employee.role === Roles.COMPANY_ADMIN ? 'COMPANY_ADMIN' : 'EMPLOYEE',
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    employee.refreshTokens.push(refreshToken);
    await employee.save();

    return {
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
      company: {
        id: company._id,
        companyCode: company.companyCode,
        name: company.name,
      },
      accessToken,
      refreshToken,
    };
  }

  static async getDashboard(employeeId: string, companyId: string) {
    const company = await Company.findById(companyId);
    const employeeCount = await Employee.countDocuments({ companyId });
    const groups = await Group.find({ companyId });
    const messages = await Message.find({ companyId }).sort({ createdAt: -1 }).limit(10);

    return {
      company: {
        id: company?._id,
        name: company?.name,
        companyCode: company?.companyCode,
        status: company?.status,
        plan: company?.plan,
      },
      stats: {
        totalEmployees: employeeCount,
        activeGroups: groups.length,
        recentMessages: messages.length,
      },
      groups,
      recentMessages: messages,
    };
  }

  static async createEmployee(companyId: string, data: { name: string; email: string; phone: string; role: Roles; password: string; permissions?: string[] }) {
    const existing = await Employee.findOne({ companyId, email: data.email.toLowerCase() });
    if (existing) {
      throw { statusCode: 400, message: 'Employee with this email already exists for the company.' };
    }

    const employeeId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await bcrypt.hash(data.password, 10);

    const employee = await Employee.create({
      companyId,
      employeeId,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone,
      role: data.role,
      permissions: data.permissions || [],
      isSuspended: false,
    });

    return { id: employee._id, name: employee.name, email: employee.email, role: employee.role, permissions: employee.permissions };
  }

  static async getEmployees(companyId: string) {
    return await Employee.find({ companyId }).sort({ createdAt: -1 });
  }

  static async updateEmployeePermissions(companyId: string, employeeId: string, permissions: string[]) {
    const employee = await Employee.findOneAndUpdate(
      { companyId, _id: employeeId },
      { permissions },
      { new: true }
    );

    if (!employee) {
      throw { statusCode: 404, message: 'Employee not found.' };
    }

    return { id: employee._id, permissions: employee.permissions };
  }

  static async createGroup(companyId: string, creatorId: string, data: { name: string; description?: string }) {
    const group = await Group.create({
      companyId,
      createdBy: creatorId,
      name: data.name,
      description: data.description || '',
    });
    return group;
  }

  static async postGroupMessage(companyId: string, senderId: string, groupId: string, data: { content: string }) {
    const group = await Group.findOne({ _id: groupId, companyId });
    if (!group) {
      throw { statusCode: 404, message: 'Group not found.' };
    }

    const message = await Message.create({
      companyId,
      groupId,
      senderId,
      content: data.content,
    });

    return message;
  }

  static async getGroupMessages(companyId: string, groupId: string) {
    const group = await Group.findOne({ _id: groupId, companyId });
    if (!group) {
      throw { statusCode: 404, message: 'Group not found.' };
    }

    return await Message.find({ companyId, groupId }).sort({ createdAt: 1 });
  }
}
