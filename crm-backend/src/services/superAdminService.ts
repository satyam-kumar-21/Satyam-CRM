import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { SuperAdmin } from '../models/SuperAdmin';
import { Company, ICompany } from '../models/Company';
import { Employee } from '../models/Employee';
import { Roles, CompanyStatus, SubscriptionPlan } from '../constants/index';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

export class SuperAdminService {
  /**
   * Super Admin Login Engine
   */
  static async login(email: string, password: string) {
    const admin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      throw { statusCode: 401, message: 'Invalid credentials provided.' };
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid credentials provided.' };
    }

    const payload = {
      id: (admin._id as unknown as string).toString(),
      role: Roles.SUPER_ADMIN,
      portalType: 'SUPER_ADMIN' as const,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    admin.refreshTokens.push(refreshToken);
    await admin.save();

    return {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: Roles.SUPER_ADMIN,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Provision New Company & Auto-Generate Root Admin
   */
  static async createCompany(data: {
    name: string;
    email: string;
    phone: string;
    plan: SubscriptionPlan;
    employeeLimit: number;
    storageLimitMB: number;
    branchLimit?: number;
    logo?: string;
  }) {
    const existingCompany = await Company.findOne({
      $or: [{ email: data.email.toLowerCase() }, { name: data.name }],
    });

    if (existingCompany) {
      throw { statusCode: 400, message: 'Company with this name or email already exists.' };
    }

    const companyIdString = `CMP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const companyCode = data.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
    const rawPassword = crypto.randomBytes(4).toString('hex');
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const planExpiryDate = new Date();
    planExpiryDate.setFullYear(planExpiryDate.getFullYear() + 1);

    const newCompany: ICompany = await Company.create({
      companyIdString,
      companyCode,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      logo: data.logo || '',
      status: CompanyStatus.ACTIVE,
      plan: data.plan,
      storageLimitMB: data.storageLimitMB,
      employeeLimit: data.employeeLimit,
      branchLimit: data.branchLimit || 5,
      planExpiryDate,
    });

    const rootAdmin = await Employee.create({
      companyId: newCompany._id,
      employeeId: 'ADMIN-001',
      name: `${data.name} Administrator`,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone,
      role: Roles.COMPANY_ADMIN,
      isSuspended: false,
    });

    return {
      company: newCompany,
      adminCredentials: {
        companyIdString,
        companyCode,
        adminEmail: rootAdmin.email,
        generatedPassword: rawPassword,
      },
    };
  }

  /**
   * Fetch All Companies
   */
  static async getAllCompanies(): Promise<ICompany[]> {
    const companies: ICompany[] = await Company.find().sort({ createdAt: -1 });
    return companies;
  }

  /**
   * Fetch Dashboard Analytics
   */
  static async getDashboardAnalytics() {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ status: CompanyStatus.ACTIVE });
    const blockedCompanies = await Company.countDocuments({ status: CompanyStatus.BLOCKED });
    const suspendedCompanies = await Company.countDocuments({ status: CompanyStatus.SUSPENDED });

    const totalEmployees = await Employee.countDocuments();
    const totalCompanyAdmins = await Employee.countDocuments({ role: Roles.COMPANY_ADMIN });

    const storageUsage = await Company.aggregate([
      { $group: { _id: null, totalUsed: { $sum: '$storageUsedMB' } } },
    ]);

    const totalStorageUsedMB = storageUsage[0]?.totalUsed || 0;

    return {
      totalCompanies,
      activeCompanies,
      blockedCompanies,
      suspendedCompanies,
      totalEmployees,
      totalCompanyAdmins,
      totalStorageUsedMB,
      monthlyGrowthPercentage: 14.5,
      revenueEstimate: 24500.0,
    };
  }

  /**
   * Change Company Status (Block / Activate / Suspend)
   */
  static async updateCompanyStatus(companyId: string, status: CompanyStatus): Promise<ICompany> {
    const company: ICompany | null = await Company.findByIdAndUpdate(
      companyId,
      { status },
      { new: true }
    );

    if (!company) {
      throw { statusCode: 404, message: 'Company record not found.' };
    }

    return company;
  }

  /**
   * Delete Company and Clean Up Associated Employees
   */
  static async deleteCompany(companyId: string): Promise<void> {
    const company: ICompany | null = await Company.findByIdAndDelete(companyId);

    if (!company) {
      throw { statusCode: 404, message: 'Company record not found.' };
    }

    await Employee.deleteMany({ companyId });
  }
}