import { PostCategory, PostStatus } from "@prisma/client";
import { z } from "zod";

const createPostValidationSchema = z.object({
  title: z.string({
    message: "Title is required",
  }),
  category: z.nativeEnum(PostCategory, {
    message: "Category is required",
  }),
  body: z.string({
    message: "Body is required",
  }),
  image: z.string().optional(),
});

const updatePostValidationSchema = z.object({
  title: z.string().optional(),
  category: z.nativeEnum(PostCategory).optional(),
  body: z.string().optional(),
  image: z.string().optional(),
  status: z.nativeEnum(PostStatus).optional(),
});

const createCommentValidationSchema = z.object({
  content: z.string({
    message: "Content is required",
  }),
});

const updateCommentValidationSchema = z.object({
  content: z.string({
    message: "Content is required",
  }),
});

export const CommunityValidation = {
  createPostValidationSchema,
  updatePostValidationSchema,
  createCommentValidationSchema,
  updateCommentValidationSchema,
};
