import { Router } from 'express';
import { CompanyAuthController } from '../controllers/companyAuthController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';
import { enforceTenant } from '../middlewares/tenantMiddleware';
import { companyLoginValidation, createEmployeeValidation, createGroupValidation, postMessageValidation } from '../validators/companyValidator';
import { Roles } from '../constants/index';

const router = Router();

router.post('/login', companyLoginValidation, CompanyAuthController.login);
router.get('/validate', authenticate, enforceTenant, CompanyAuthController.validateSession);

router.use(authenticate, enforceTenant);

router.get('/dashboard', authorizeRoles(Roles.COMPANY_ADMIN, Roles.HR, Roles.MANAGER, Roles.TEAM_LEAD, Roles.EMPLOYEE), CompanyAuthController.getDashboard);
router.get('/employees', authorizeRoles(Roles.COMPANY_ADMIN), CompanyAuthController.getEmployees);
router.post('/employees', authorizeRoles(Roles.COMPANY_ADMIN), createEmployeeValidation, CompanyAuthController.createEmployee);
router.patch('/employees/:id/permissions', authorizeRoles(Roles.COMPANY_ADMIN), CompanyAuthController.updateEmployeePermissions);
router.post('/groups', authorizeRoles(Roles.COMPANY_ADMIN), createGroupValidation, CompanyAuthController.createGroup);
router.post('/groups/:groupId/messages', authorizeRoles(Roles.COMPANY_ADMIN, Roles.HR, Roles.MANAGER, Roles.TEAM_LEAD, Roles.EMPLOYEE), postMessageValidation, CompanyAuthController.postMessage);
router.get('/groups/:groupId/messages', authorizeRoles(Roles.COMPANY_ADMIN, Roles.HR, Roles.MANAGER, Roles.TEAM_LEAD, Roles.EMPLOYEE), CompanyAuthController.getGroupMessages);

export default router;
