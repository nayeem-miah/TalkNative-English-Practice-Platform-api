import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { LessonController } from "./lesson.controller";
import { lessonValidation } from "./lesson.validation";

const router = express.Router();


router.get(
  "/course/:courseId",
  auth(UserRole.USER, UserRole.ADMIN),
  LessonController.getLessonsByCourse
);


router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  LessonController.getSingleLesson
);


router.post(
  "/",
  auth(UserRole.ADMIN),
  validateRequest(lessonValidation.createLessonValidationSchema),
  LessonController.createLesson
);


router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(lessonValidation.updateLessonValidationSchema),
  LessonController.updateLesson
);


router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  LessonController.deleteLesson
);

export const LessonRoutes = router;
