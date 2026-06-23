import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { AdminController } from "./admin.controller";

const router = express.Router();

router.get(
  "/dashboard-overview",
  auth(UserRole.ADMIN),
  AdminController.getDashboardOverview
);

export const AdminRoutes = router;
