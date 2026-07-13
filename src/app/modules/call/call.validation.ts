import { z } from "zod";

const createReportValidationSchema = z.object({
  reportedId: z.string().min(1, "Reported user ID is required"),
  reason: z.string().min(1, "Reason is required"),
  callId: z.string().optional(),
  description: z.string().optional(),
});

const createReviewValidationSchema = z.object({
  revieweeId: z.string().min(1, "Reviewee ID is required"),
  rating: z.number({
    "message": "Rating must be a number",
  }).min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
  notes: z.string().optional(),
});

export const CallValidation = {
  createReportValidationSchema,
  createReviewValidationSchema,
};
