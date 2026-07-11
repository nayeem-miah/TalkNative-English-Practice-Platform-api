/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { fileUpload } from "../../utils/fileUpload";
import sendResponse from "../../utils/sendResponse";
import { CommunityService } from "./community.service";

const createPost = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.userId;

  if (req.file) {
    const uploadResult = await fileUpload.uploadToCloudinary(req.file);
    if (uploadResult) {
      req.body.image = uploadResult.secure_url;
    }
  }

  const result = await CommunityService.createPost(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});

const getAllPosts = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.userId;
  const result = await CommunityService.getAllPosts(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Posts retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePost = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.userId;
  const result = await CommunityService.getSinglePost(req.params.id, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post retrieved successfully",
    data: result,
  });
});

const updatePost = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.userId;

  if (req.file) {
    const uploadResult = await fileUpload.uploadToCloudinary(req.file);
    if (uploadResult) {
      req.body.image = uploadResult.secure_url;
    }
  }

  const result = await CommunityService.updatePost(userId, req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post updated successfully",
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const result = await CommunityService.deletePost(userId, req.params.id, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post deleted successfully",
    data: result,
  });
});

const toggleLike = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.userId;
  const result = await CommunityService.toggleLike(userId, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.liked ? "Post liked successfully" : "Post unliked successfully",
    data: result,
  });
});

const createComment = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.userId;
  const result = await CommunityService.createComment(userId, req.params.postId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Comment added successfully",
    data: result,
  });
});

const updateComment = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.userId;
  const result = await CommunityService.updateComment(userId, req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const result = await CommunityService.deleteComment(userId, req.params.id, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
});

export const CommunityController = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  toggleLike,
  createComment,
  updateComment,
  deleteComment,
};