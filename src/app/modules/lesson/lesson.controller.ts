import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { LessonService } from "./lesson.service";

const createLesson = catchAsync(async (req: Request, res: Response) => {
  const result = await LessonService.createLesson(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Class created successfully",
    data: result,
  });
});

const getLessonsByCourse = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  const courseId = req.params.courseId;

  const result = await LessonService.getLessonsByCourse(courseId, userId, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Classes retrieved successfully",
    data: result,
  });
});

const getSingleLesson = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;

  const result = await LessonService.getSingleLesson(req.params.id, userId, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Class details retrieved successfully",
    data: result,
  });
});

const updateLesson = catchAsync(async (req: Request, res: Response) => {
  const result = await LessonService.updateLesson(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Class updated successfully",
    data: result,
  });
});

const deleteLesson = catchAsync(async (req: Request, res: Response) => {
  const result = await LessonService.deleteLesson(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Class deleted successfully",
    data: result,
  });
});

export const LessonController = {
  createLesson,
  getLessonsByCourse,
  getSingleLesson,
  updateLesson,
  deleteLesson,
};