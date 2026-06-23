import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CallRoutes } from "../modules/call/call.routes";
import { CourseRoutes } from "../modules/course/course.route";
import { LessonRoutes } from "../modules/lesson/lesson.route";
import { EnrollmentRoutes } from "../modules/enrollment/enrollment.route";
import { AdminRoutes } from "../modules/admin/admin.route";

const router = Router();

router.use("/admin", AdminRoutes);
router.use("/users", UserRoutes);
router.use("/auth", AuthRoutes);
router.use("/calls", CallRoutes);
router.use("/call", CallRoutes); // Defensive alias for frontend compatibility
router.use("/courses", CourseRoutes);
router.use("/lessons", LessonRoutes);
router.use("/enrollments", EnrollmentRoutes);






export default router;