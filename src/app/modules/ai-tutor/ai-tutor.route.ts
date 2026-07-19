import { Router } from "express";
import { AiTutorController } from "./ai-tutor.controller";

const router = Router();

router.post("/generate", AiTutorController.generateResponse);
router.post("/", AiTutorController.generateResponse);

export const AiTutorRoutes = router;
