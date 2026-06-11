import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CourseService } from "./course.service";
import { fileUpload } from "../../utils/fileUpload";

const createCourse = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    const uploadResult = await fileUpload.uploadToCloudinary(req.file);
    if (uploadResult) {
      req.body.thumbnail = uploadResult.secure_url;
    }
  }

  const result = await CourseService.createCourse(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Course created successfully",
    data: result,
  });
});

const getAllCourses = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const query = { ...req.query, role: req.user?.role };
  const result = await CourseService.getAllCourses(query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Courses retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleCourse = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  const result = await CourseService.getSingleCourse(req.params.id, userId, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Course retrieved successfully",
    data: result,
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    const uploadResult = await fileUpload.uploadToCloudinary(req.file);
    if (uploadResult) {
      req.body.thumbnail = uploadResult.secure_url;
    }
  }

  const result = await CourseService.updateCourse(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Course updated successfully",
    data: result,
  });
});

const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.deleteCourse(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Course deleted successfully",
    data: result,
  });
});

export const CourseController = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
};