import { Router } from "express";
import auth, { optionalAuth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { parseFormData } from "../../middlewares/parseFormData";
import { fileUpload } from "../../utils/fileUpload";
import { CommunityController } from "./community.controller";
import { CommunityValidation } from "./community.validation";

const router = Router();

// Post Routes
router.post(
  "/posts",
  auth(),
  fileUpload.upload.single("file"),
  parseFormData,
  validateRequest(CommunityValidation.createPostValidationSchema),
  CommunityController.createPost
);

router.get(
  "/posts",
  optionalAuth(),
  CommunityController.getAllPosts
);

router.get(
  "/posts/:id",
  optionalAuth(),
  CommunityController.getSinglePost
);

router.patch(
  "/posts/:id",
  auth(),
  fileUpload.upload.single("file"),
  parseFormData,
  validateRequest(CommunityValidation.updatePostValidationSchema),
  CommunityController.updatePost
);

router.delete(
  "/posts/:id",
  auth(),
  CommunityController.deletePost
);

// Like Routes
router.post(
  "/posts/:id/like",
  auth(),
  CommunityController.toggleLike
);

// Comment Routes
router.post(
  "/posts/:postId/comments",
  auth(),
  validateRequest(CommunityValidation.createCommentValidationSchema),
  CommunityController.createComment
);

router.patch(
  "/comments/:id",
  auth(),
  validateRequest(CommunityValidation.updateCommentValidationSchema),
  CommunityController.updateComment
);

router.delete(
  "/comments/:id",
  auth(),
  CommunityController.deleteComment
);

export const CommunityRoutes = router;