
import express from 'express';
import passport from 'passport';
import config from '../../config';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
const router = express.Router();

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login
)
router.post("/logout", AuthController.logout)
router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword
);

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

// Google login auth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${config.client_url}/login?error=GoogleAuthFailed`,
  }),
  AuthController.googleLoginCallback
);

export const AuthRoutes = router;
