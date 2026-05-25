import { UserRole } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
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
router.get('/:id', UserController.getFindUserById);

// Existing routes
router.post(
  '/',
  validateRequest(userValidation.createUserValidationSchema),
  UserController.createUser,
);

router.patch(
  '/update-profile',
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(userValidation.updateUserValidationSchema),
  UserController.userUpdateProfile,
);

// DELETE USER BY ID (protected)
router.delete('/:id', auth(UserRole.ADMIN), UserController.deleteUser);

export const UserRoutes = router;
