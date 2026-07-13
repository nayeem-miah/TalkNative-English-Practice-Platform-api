import express from 'express';
import { CallController } from './call.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { CallValidation } from './call.validation';

const router = express.Router();

router.post(
  '/report',
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(CallValidation.createReportValidationSchema),
  CallController.createReport
);

router.post(
  '/review',
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(CallValidation.createReviewValidationSchema),
  CallController.createReview
);

router.get(
  '/history',
  auth(UserRole.USER, UserRole.ADMIN),
  CallController.getCallHistory
);

router.get(
  '/reports',
  auth(UserRole.ADMIN),
  CallController.getAllReports
);

router.get(
  '/reports/:id',
  auth(UserRole.ADMIN),
  CallController.getSingleReport
);

router.get(
  '/reviews',
  auth(UserRole.ADMIN),
  CallController.getAllReviews
);

router.get(
  '/reviews/:id',
  auth(UserRole.ADMIN),
  CallController.getSingleReview
);

router.patch(
  '/users/:id/suspend',
  auth(UserRole.ADMIN),
  CallController.suspendUser
);

export const CallRoutes = router;
