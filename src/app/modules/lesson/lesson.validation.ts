import { z } from "zod";

const createLessonValidationSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  videoUrl: z.string().url("Invalid video URL").or(z.string().length(0)).optional().nullable(),
  duration: z.number().int().nonnegative("Duration cannot be negative").optional().nullable(),
  order: z.number().int("Order must be an integer").default(1),
});

const updateLessonValidationSchema = z.object({
  courseId: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url("Invalid video URL").or(z.string().length(0)).optional().nullable(),
  duration: z.number().int().nonnegative().optional().nullable(),
  order: z.number().int().optional(),
});

export const lessonValidation = {
  createLessonValidationSchema,
  updateLessonValidationSchema,
};
