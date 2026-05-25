import { Request, Response } from 'express';
import HttpStatus from 'http-status';
import ApiError from '../../errors/apiError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.login(req.body);
  const { accessToken, refreshToken } = result;

  const isProduction = process.env.NODE_ENV === 'production';
  const isDeployed = !req.headers.host?.includes('localhost') && !req.headers.host?.includes('127.0.0.1');

  const cookieOptions = {
    secure: isProduction || isDeployed,
    httpOnly: true,
    sameSite: (isProduction || isDeployed ? 'none' : 'lax') as any,
  };

  // httpOnly cookies (read by server-side middleware, not JS)
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 90,
  });

  // JS-readable cookies (read by frontend RTK Query prepareHeaders)
  res.cookie('accessToken_js', accessToken, {
    secure: isProduction || isDeployed,
    httpOnly: false,
    sameSite: (isProduction || isDeployed ? 'none' : 'lax') as any,
    maxAge: 1000 * 60 * 60,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User loggedin successfully!',
    data: {
      result,
    },
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // Clear development cookies (SameSite=Lax)
  res.clearCookie('accessToken', {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
  });
  res.clearCookie('refreshToken', {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
  });
  res.clearCookie('accessToken_js', {
    secure: false,
    httpOnly: false,
    sameSite: 'lax',
  });

  // Clear production cookies (SameSite=None, Secure=true)
  res.clearCookie('accessToken', {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
  });
  res.clearCookie('refreshToken', {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
  });
  res.clearCookie('accessToken_js', {
    secure: true,
    httpOnly: false,
    sameSite: 'none',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged out successfully!',
    data: null,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Check your email for reset password link!',
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.query.token as string;

  if (!token) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Reset token is required!');
  }

  await AuthServices.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Password reset successfully!',
    data: null,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.verifyEmail(req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Email verified successfully!',
    data: result,
  });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.resendOtp(req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'OTP resent successfully!',
    data: result,
  });
});

export const AuthController = {
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendOtp,
};
