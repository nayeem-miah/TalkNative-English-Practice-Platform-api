import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AnnouncementService } from "./announcement.service";
import httpStatus from "http-status";

const createAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const result = await AnnouncementService.createAnnouncement(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Announcement created successfully",
    data: result,
  });
});

const getAllAnnouncements = catchAsync(async (req: Request, res: Response) => {
  const result = await AnnouncementService.getAllAnnouncements(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Announcements retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getFeed = catchAsync(async (req: Request, res: Response) => {
  const result = await AnnouncementService.getFeed();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Announcement feed retrieved successfully",
    data: result,
  });
});

const deleteAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AnnouncementService.deleteAnnouncement(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Announcement deleted successfully",
    data: result,
  });
});

const updateAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AnnouncementService.updateAnnouncement(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Announcement updated successfully",
    data: result,
  });
});

export const AnnouncementController = {
  createAnnouncement,
  getAllAnnouncements,
  getFeed,
  deleteAnnouncement,
  updateAnnouncement,
};
