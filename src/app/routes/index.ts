import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CallRoutes } from "../modules/call/call.routes";
import { CourseRoutes } from "../modules/course/course.route";
import { LessonRoutes } from "../modules/lesson/lesson.route";
import { EnrollmentRoutes } from "../modules/enrollment/enrollment.route";
import { AdminRoutes } from "../modules/admin/admin.route";

import { AnnouncementRoutes } from "../modules/announcement/announcement.route";
import { ChatRoutes } from "../modules/chat/chat.route";
import { CommunityRoutes } from "../modules/community/community.route";
import { AiTutorRoutes } from "../modules/ai-tutor/ai-tutor.route";

const router = Router();

router.use("/admin", AdminRoutes);
router.use("/users", UserRoutes);
router.use("/auth", AuthRoutes);
router.use("/calls", CallRoutes);
router.use("/call", CallRoutes); // Defensive alias for frontend compatibility
router.use("/courses", CourseRoutes);
router.use("/lessons", LessonRoutes);
router.use("/enrollments", EnrollmentRoutes);
router.use("/announcements", AnnouncementRoutes);
router.use("/chat", ChatRoutes);
router.use("/community", CommunityRoutes);
router.use("/ai-tutor", AiTutorRoutes);

export default router;