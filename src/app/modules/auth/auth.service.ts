import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/apiError';
import { prisma } from '../../prisma/prisma';
import emailSender from '../../utils/emailSender';
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

  const resetLink = `${config.reset_pass_link}?token=${resetToken}`;

  emailSender(
    'Reset Your Password',
    userData.email,
    `
        <p>Hello ${userData.name || 'User'},</p>
        <p>Click the link below to reset your password:</p>
         <a href="${resetLink}" style="text-decoration: none;">
            <button style="background-color: #007BFF; color: white; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
              Reset Password
            </button>
          </a>
        <p>If you didn’t request this, ignore this email.</p>
        `,
  ).catch(err => console.error("Forgot Password Email Error:", err));

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

  emailSender(
    "Verify Your Account - FluentFlow",
    user.email,
    `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #00d2ff;">Welcome to FluentFlow!</h2>
      <p>Your 6-digit verification code is:</p>
      <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${verificationCode}</h1>
      <p>This code will expire in 5 minutes.</p>
    </div>
    `
  ).catch(err => console.error("Resend OTP Email Error:", err));

  return { message: 'OTP sent successfully' };
};

export const AuthServices = {
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendOtp,
};
