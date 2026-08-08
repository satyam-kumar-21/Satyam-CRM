import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { SuperAdminService } from '../services/superAdminService';
import { ApiResponse } from '../utils/responseHandler';
import { Company } from '../models/Company';

export class SuperAdminController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { email, password } = req.body;
      const result = await SuperAdminService.login(email, password);

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, 'Super Admin authenticated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
      };

      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);

      // Pass null for data
      ApiResponse.success(res, 'Super Admin logged out successfully', null);
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await SuperAdminService.getDashboardAnalytics();
      ApiResponse.success(res, 'Analytics fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  }

  static async createCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const result = await SuperAdminService.createCompany(req.body);
      ApiResponse.success(res, 'Company provisioned successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAllCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';

      const query: any = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { companyCode: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const totalRecords = await Company.countDocuments(query);
      const companies = await Company.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      ApiResponse.success(res, 'Companies retrieved successfully', companies, 200, {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedCompany = await SuperAdminService.updateCompanyStatus(id, status);
      ApiResponse.success(res, 'Company status updated successfully', updatedCompany);
    } catch (error) {
      next(error);
    }
  }
}