import { Router } from 'express';
import { SuperAdminController } from '../controllers/superAdminController';
import {
  superAdminLoginValidation,
  createCompanyValidation,
} from '../validators/superAdminValidator';
import { authenticate } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';
import { Roles } from '../constants/index';

const router = Router();

// Public Authentication Route
router.post('/login', superAdminLoginValidation, SuperAdminController.login);

// Protected Super Admin Portal Routes
router.use(authenticate, authorizeRoles(Roles.SUPER_ADMIN));

router.get('/dashboard', SuperAdminController.getDashboardData);
router.get('/companies', SuperAdminController.getAllCompanies);
router.post('/companies', createCompanyValidation, SuperAdminController.createCompany);
router.patch('/companies/:id/status', SuperAdminController.updateStatus);

export default router;