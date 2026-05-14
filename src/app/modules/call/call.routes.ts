import express from 'express';
import { CallController } from './call.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/report',
  auth(UserRole.USER, UserRole.ADMIN),
  CallController.createReport
);

router.get(
  '/history',
  auth(UserRole.USER, UserRole.ADMIN),
  CallController.getCallHistory
);

export const CallRoutes = router;
