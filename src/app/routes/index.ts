import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CallRoutes } from "../modules/call/call.routes";

const router = Router();

router.use("/users", UserRoutes);
router.use("/auth", AuthRoutes);
router.use("/calls", CallRoutes);
router.use("/call", CallRoutes); // Defensive alias for frontend compatibility






export default router;