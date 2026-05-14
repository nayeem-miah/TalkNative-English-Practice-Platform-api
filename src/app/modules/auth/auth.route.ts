
import express from 'express'
import { AuthController } from './auth.controller'
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';
const router = express.Router()

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login
)
router.post("/logout", AuthController.logout)
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

router.post(
  "/verify-email",
  validateRequest(AuthValidation.verifyEmailValidationSchema),
  AuthController.verifyEmail
);

router.post(
  "/resend-otp",
  validateRequest(AuthValidation.resendOtpValidationSchema),
  AuthController.resendOtp
);




export const AuthRoutes = router