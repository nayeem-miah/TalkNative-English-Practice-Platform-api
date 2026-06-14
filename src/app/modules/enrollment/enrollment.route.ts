import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { EnrollmentController } from "./enrollment.controller";
import { enrollmentValidation } from "./enrollment.validation";

const router = express.Router();

router.get(
  "/my-courses",
  auth(UserRole.USER, UserRole.ADMIN),
  EnrollmentController.getMyCourses
);

router.post(
  "/enroll-free",
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(enrollmentValidation.createEnrollmentValidationSchema),
  EnrollmentController.enrollFreeCourse
);

router.post(
  "/create-checkout-session",
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(enrollmentValidation.createEnrollmentValidationSchema),
  EnrollmentController.createCheckoutSession
);

router.get(
  "/",
  auth(UserRole.ADMIN),
  EnrollmentController.getAllEnrollments
);

export const EnrollmentRoutes = router;
