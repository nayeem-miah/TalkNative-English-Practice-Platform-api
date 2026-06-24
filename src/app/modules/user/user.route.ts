import { UserRole } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import { parseFormData } from '../../middlewares/parseFormData';
import validateRequest from '../../middlewares/validateRequest';
import { fileUpload } from '../../utils/fileUpload';
import { UserController } from './user.controller';
import { userValidation } from './user.validation';

const router = express.Router();

// Get current user (protected)
router.get(
  '/me',
  auth(UserRole.USER, UserRole.ADMIN),
  UserController.getSingleUser,
);

// GET ALL USERS (protected)
router.get('/', UserController.getAllUsers);

// FIND USER BY ID (protected)
router.get('/:id', auth(UserRole.USER, UserRole.ADMIN), UserController.getFindUserById);

// Existing routes
router.post(
  '/',
  validateRequest(userValidation.createUserValidationSchema),
  UserController.createUser,
);

router.patch(
  '/update-profile',
  auth(UserRole.USER, UserRole.ADMIN),
  fileUpload.upload.single('file'),
  parseFormData,
  validateRequest(userValidation.updateUserValidationSchema),
  UserController.userUpdateProfile,
);

router.patch(
  '/role/:id',
  auth(UserRole.ADMIN),
  validateRequest(userValidation.updateUserRoleValidationSchema),
  UserController.updateUserRole,
);

router.patch(
  '/status/:id',
  auth(UserRole.ADMIN),
  validateRequest(userValidation.updateUserStatusValidationSchema),
  UserController.updateUserStatus,
);

// DELETE USER BY ID (protected)
router.delete('/:id', auth(UserRole.ADMIN), UserController.deleteUser);

export const UserRoutes = router;
