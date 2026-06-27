import { UserRole } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AnnouncementController } from "./announcement.controller";
import { AnnouncementValidation } from "./announcement.validation";

const router = Router();

router.get("/feed", AnnouncementController.getFeed);

router.get(
  "/",
  auth(UserRole.ADMIN),
  AnnouncementController.getAllAnnouncements
);

router.post(
  "/",
  auth(UserRole.ADMIN),
  validateRequest(AnnouncementValidation.createAnnouncementValidationSchema),
  AnnouncementController.createAnnouncement
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(AnnouncementValidation.updateAnnouncementValidationSchema),
  AnnouncementController.updateAnnouncement
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  AnnouncementController.deleteAnnouncement
);

export const AnnouncementRoutes = router;
