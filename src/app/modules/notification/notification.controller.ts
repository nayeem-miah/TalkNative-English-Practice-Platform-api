/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await NotificationService.getMyNotifications(
    req.user.userId,
    req.query as Record<string, string>
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getUnreadCount = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await NotificationService.getUnreadCount(req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Unread count retrieved",
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  await NotificationService.markAsRead(req.user.userId, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification marked as read",
    data: null,
  });
});

const markAllAsRead = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  await NotificationService.markAllAsRead(req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All notifications marked as read",
    data: null,
  });
});

const deleteNotification = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  await NotificationService.deleteNotification(req.user.userId, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification deleted",
    data: null,
  });
});

const deleteAllNotifications = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  await NotificationService.deleteAllNotifications(req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All notifications cleared",
    data: null,
  });
});

export const NotificationController = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
