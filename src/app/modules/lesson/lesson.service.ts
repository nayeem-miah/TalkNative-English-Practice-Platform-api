import { Lesson, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";

const createLesson = async (payload: Partial<Lesson>): Promise<Lesson> => {

  const courseExists = await prisma.course.findUnique({
    where: { id: payload.courseId },
  });

  if (!courseExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Associated Course not found");
  }

  const result = await prisma.lesson.create({
    data: payload as any,
  });

  if(!result){
    throw new ApiError(httpStatus.BAD_REQUEST, "Lesson creation failed");
  }

  return result;
};

const getLessonsByCourse = async (
  courseId: string,
  userId: string,
  role: string
): Promise<Lesson[]> => {
  const courseExists = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!courseExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  // Admin bypass
  if (role === UserRole.ADMIN) {
    return prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
    });
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (
    !enrollment ||
    (enrollment.paymentStatus !== "PAID" && enrollment.paymentStatus !== "FREE")
  ) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You must enroll in this course to view the classes"
    );
  }

  return prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });
};

const getSingleLesson = async (
  lessonId: string,
  userId: string,
  role: string
): Promise<Lesson> => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lesson not found");
  }

  // Admin bypass
  if (role === UserRole.ADMIN) {
    return lesson;
  }

  // Check enrollment in parent course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.courseId,
      },
    },
  });

  if (
    !enrollment ||
    (enrollment.paymentStatus !== "PAID" && enrollment.paymentStatus !== "FREE")
  ) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You must enroll in this course to view this class"
    );
  }

  return lesson;
};

const updateLesson = async (
  lessonId: string,
  payload: Partial<Lesson>
): Promise<Lesson> => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lesson not found");
  }

  const result = await prisma.lesson.update({
    where: { id: lessonId },
    data: payload,
  });

  return result;
};

const deleteLesson = async (lessonId: string): Promise<Lesson> => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lesson not found");
  }

  const result = await prisma.lesson.delete({
    where: { id: lessonId },
  });

  return result;
};

export const LessonService = {
  createLesson,
  getLessonsByCourse,
  getSingleLesson,
  updateLesson,
  deleteLesson,
};
