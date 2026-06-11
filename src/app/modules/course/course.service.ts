import { Course, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";

const createCourse = async (payload: Partial<Course>): Promise<Course> => {
  const result = await prisma.course.create({
    data: payload as any,
  });

  if(!result){
    throw new ApiError(httpStatus.BAD_REQUEST, "Course creation failed");
  }

  return result;
};

const getAllCourses = async (query: Record<string, any>) => {
  const { role, ...filterData } = query;

  const courseQuery = new PrismaQueryBuilder(filterData)
    .search(["title", "description"])
    .filter()
    .sort()
    .paginate();

  if (role !== UserRole.ADMIN) {
    courseQuery.where.isPublished = true;
  }

  const { where, orderBy, skip, take } = courseQuery.build();

  const [result, total] = await prisma.$transaction([
    prisma.course.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  const meta = courseQuery.getMeta(total);

  return {
    meta,
    data: result,
  };
};

const getSingleCourse = async (
  courseId: string,
  userId?: string,
  role?: string
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  // Check enrollment
  let isEnrolled = false;
  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (
      enrollment &&
      (enrollment.paymentStatus === "PAID" || enrollment.paymentStatus === "FREE")
    ) {
      isEnrolled = true;
    }
  }

  if (role === UserRole.ADMIN || isEnrolled) {
    return {
      ...course,
      isEnrolled,
    };
  }

  // If not enrolled/not admin, hide lesson content and videoUrl
  const sanitizedLessons = course.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    duration: lesson.duration,
    order: lesson.order,
    videoUrl: null,
    content: null,
  }));

  return {
    ...course,
    lessons: sanitizedLessons,
    isEnrolled: false,
  };
};

const updateCourse = async (
  courseId: string,
  payload: Partial<Course>
): Promise<Course> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const result = await prisma.course.update({
    where: { id: courseId },
    data: payload,
  });

  return result;
};

const deleteCourse = async (courseId: string): Promise<Course> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const result = await prisma.course.delete({
    where: { id: courseId },
  });

  return result;
};

export const CourseService = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
};
