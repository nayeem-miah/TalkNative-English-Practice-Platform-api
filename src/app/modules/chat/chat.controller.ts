/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ChatService } from "./chat.service";

const getTickets = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatService.getTickets(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tickets retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const result = await ChatService.getMessages(ticketId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved successfully",
    data: result,
  });
});

const resolveTicket = catchAsync(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const result = await ChatService.resolveTicket(ticketId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Ticket resolved successfully",
    data: result,
  });
});

const getMyTicket = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await ChatService.getMyTicket(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Ticket retrieved successfully",
    data: result,
  });
});

const markTicketRead = catchAsync(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const result = await ChatService.markTicketRead(ticketId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Ticket marked as read",
    data: result,
  });
});

export const ChatController = {
  getTickets,
  getMessages,
  resolveTicket,
  getMyTicket,
  markTicketRead,
};
