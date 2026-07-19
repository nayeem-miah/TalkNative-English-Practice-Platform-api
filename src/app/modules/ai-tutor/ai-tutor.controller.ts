import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AiTutorService } from "./ai-tutor.service";

const generateResponse = catchAsync(async (req: Request, res: Response) => {
  const result = await AiTutorService.generateAiTutorResponse(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AI Tutor response generated successfully",
    data: result,
  });
});

export const AiTutorController = {
  generateResponse,
};
