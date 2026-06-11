import { z } from "zod";

const createCourseValidationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  price: z.number().nonnegative("Price cannot be negative").default(0.0),
  type: z.enum(["FREE", "PAID"]).default("FREE"),
  isPublished: z.boolean().optional(),
});

const updateCourseValidationSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  price: z.number().nonnegative().optional(),
  type: z.enum(["FREE", "PAID"]).optional(),
  isPublished: z.boolean().optional(),
});

export const courseValidation = {
  createCourseValidationSchema,
  updateCourseValidationSchema,
};
