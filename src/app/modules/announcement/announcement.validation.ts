import { AnnouncementCategory, AnnouncementStatus } from "@prisma/client";
import { z } from "zod";

const createAnnouncementValidationSchema = z.object({
    title: z.string({
      message: "Title is required",
    }),
    content: z.string({
      message: "Content is required",
    }),
    category: z.nativeEnum(AnnouncementCategory, {
      message: "Category is required",
    }),
    isUrgent: z.boolean().optional(),
    status: z.nativeEnum(AnnouncementStatus).optional(),
});

const updateAnnouncementValidationSchema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    category: z.nativeEnum(AnnouncementCategory).optional(),
    isUrgent: z.boolean().optional(),
    status: z.nativeEnum(AnnouncementStatus).optional(),
});

export const AnnouncementValidation = {
  createAnnouncementValidationSchema,
  updateAnnouncementValidationSchema,
};
