import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { CallService } from './call.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createReport = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const reporterId = req.user?.userId || req.body.reporterId;
  const result = await CallService.createReport({
    ...req.body,
    reporterId
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report submitted successfully',
    data: result,
  });
});

const createReview = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const reviewerId = req.user?.userId || req.body.reviewerId;
  const result = await CallService.createReview({
    ...req.body,
    reviewerId
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const getCallHistory = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.userId; // Assuming auth middleware adds user to req
  const result = await CallService.getCallHistory(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call history retrieved successfully',
    data: result,
  });
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const result = await CallService.getAllReports();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reports retrieved successfully',
    data: result,
  });
});

const getSingleReport = catchAsync(async (req: Request, res: Response) => {
  const result = await CallService.getSingleReport(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report details retrieved successfully',
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await CallService.getAllReviews();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const getSingleReview = catchAsync(async (req: Request, res: Response) => {
  const result = await CallService.getSingleReview(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review details retrieved successfully',
    data: result,
  });
});

const suspendUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  
  const result = await CallService.suspendUser(id, status, reason);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: status === 'SUSPENDED' ? 'User suspended successfully' : 'User activated successfully',
    data: result,
  });
});

export const CallController = {
  createReport,
  createReview,
  getCallHistory,
  getAllReports,
  getSingleReport,
  getAllReviews,
  getSingleReview,
  suspendUser,
};
