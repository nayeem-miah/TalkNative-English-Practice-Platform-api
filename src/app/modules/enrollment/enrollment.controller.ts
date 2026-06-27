/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { EnrollmentService } from "./enrollment.service";

const enrollFreeCourse = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.userId;
  const { courseId } = req.body;

  const result = await EnrollmentService.enrollFreeCourse(userId, courseId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Enrolled in course successfully",
    data: result,
  });
});

const createCheckoutSession = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.userId;
    const userEmail = req.user?.email;
    const { courseId } = req.body;

    const result = await EnrollmentService.createCheckoutSession(userId, userEmail, courseId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Checkout session created successfully",
      data: result,
    });
  }
);

const getMyCourses = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.userId;

  const result = await EnrollmentService.getMyCourses(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Enrolled courses retrieved successfully",
    data: result,
  });
});

const getAllEnrollments = catchAsync(async (req: Request, res: Response) => {
  const result = await EnrollmentService.getAllEnrollments(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All enrollments retrieved successfully",
    data: result,
  });
});

export const EnrollmentController = {
  enrollFreeCourse,
  createCheckoutSession,
  getMyCourses,
  getAllEnrollments,
};
