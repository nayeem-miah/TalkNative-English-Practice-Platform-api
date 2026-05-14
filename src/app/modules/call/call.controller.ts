import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { CallService } from './call.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createReport = catchAsync(async (req: Request, res: Response) => {
  const result = await CallService.createReport(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report submitted successfully',
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

export const CallController = {
  createReport,
  getCallHistory,
};
