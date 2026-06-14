import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/apiError';
import { prisma } from '../../prisma/prisma';
import emailSender from '../../utils/emailSender';
import { getOtpTemplate, getResetPasswordTemplate } from '../../utils/emailTemplates';
import { jwtHelper } from '../../utils/JwtHelper';

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  if (!user || !user.password) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isCorrectPassword) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (user.status === 'SUSPENDED') {
    throw new ApiError(httpStatus.FORBIDDEN, `Your account has been suspended. Reason: ${user.suspensionReason || 'Not specified'}`);
  }

  if (!user.isVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Please verify your email to login.');
  }

  const accessToken = jwtHelper.generateToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.accessToken as string,
    config.jwt.accessTokenExpiresIn as string,
  );
  const refreshToken = jwtHelper.generateToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.refreshToken as string,
    config.jwt.refreshTokenExpiresIn as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const resetToken = jwtHelper.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string,
  );

  await prisma.user.update({
    where: { id: userData.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    }
  });

  const resetLink = `${config.reset_pass_link}?token=${resetToken}`;

  await emailSender(
    'Reset Your Password',
    userData.email,
    getResetPasswordTemplate(userData.name || 'User', resetLink),
  );

  return { message: 'Reset password email sent' };
};

const resetPassword = async (token: string, payload: { password: string }) => {
  // Verify token
  const decoded = jwtHelper.verifyToken(
    token,
    config.jwt.reset_pass_secret as Secret,
  );

  if (!decoded) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid or expired token!');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.passwordResetToken !== token) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Token is invalid or has already been used!');
  }
  if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Token has expired!');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds),
  );

  // Update password
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return { message: 'Password reset successful' };
};

const verifyEmail = async (payload: { email: string; code: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already verified');
  }

  if (user.verificationCode !== payload.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid verification code');
  }

  if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Verification code has expired');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
    },
  });

  return { message: 'Email verified successfully' };
};

const resendOtp = async (payload: { email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already verified');
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationCode,
      verificationCodeExpires,
    },
  });

  await emailSender(
    "Verify Your Account - TalkNative",
    user.email,
    getOtpTemplate(user.name || user.email, verificationCode)
  );

  return { message: 'OTP sent successfully' };
};

export const AuthServices = {
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendOtp,
};
