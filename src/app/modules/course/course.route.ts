import { UserRole } from "@prisma/client";
import express from "express";
import auth, { optionalAuth } from "../../middlewares/auth";
import { parseFormData } from "../../middlewares/parseFormData";
import validateRequest from "../../middlewares/validateRequest";
import { fileUpload } from "../../utils/fileUpload";
import { CourseController } from "./course.controller";
import { courseValidation } from "./course.validation";

const router = express.Router();

router.get(
  "/",
  optionalAuth(),
  CourseController.getAllCourses
);


router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  CourseController.getSingleCourse
);


router.post(
  "/",
  auth(UserRole.ADMIN),
  fileUpload.upload.single("file"),
  parseFormData,
  validateRequest(courseValidation.createCourseValidationSchema),
  CourseController.createCourse
);


router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  fileUpload.upload.single("file"),
  parseFormData,
  validateRequest(courseValidation.updateCourseValidationSchema),
  CourseController.updateCourse
);


router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  CourseController.deleteCourse
);

export const CourseRoutes = router;
