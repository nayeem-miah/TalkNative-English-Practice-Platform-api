import { z } from "zod";

const createEnrollmentValidationSchema = z.object({
  courseId: z.string({
    message: "Course ID is required",
  }).min(1, "Course ID cannot be empty"),
});

export const enrollmentValidation = {
  createEnrollmentValidationSchema,
};
