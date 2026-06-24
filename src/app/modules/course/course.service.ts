/* eslint-disable @typescript-eslint/no-explicit-any */
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

  // Compute per-course studentsCount and revenue dynamically
  const data = await Promise.all(
    result.map(async (course) => {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: course.id },
        select: { amountPaid: true },
      });
      const studentsCount = enrollments.length;
      const revenue = enrollments.reduce((sum, e) => sum + (e.amountPaid ?? 0), 0);
      return {
        ...course,
        studentsCount,
        revenue,
      };
    })
  );

  // Compute global course statistics
  const totalCourses = await prisma.course.count();
  const publishedCourses = await prisma.course.count({
    where: { isPublished: true },
  });
  const draftCourses = totalCourses - publishedCourses;

  const allEnrollments = await prisma.enrollment.findMany({
    select: { amountPaid: true },
  });
  const totalStudents = allEnrollments.length;
  const totalRevenue = allEnrollments.reduce((sum, e) => sum + (e.amountPaid ?? 0), 0);

  const stats = {
    totalCourses,
    publishedCourses,
    draftCourses,
    totalStudents,
    totalRevenue,
  };

  return {
    meta,
    data,
    stats,
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

  // Fetch reviews
  const reviews = await prisma.courseReview.findMany({
    where: { courseId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  if (role === UserRole.ADMIN || isEnrolled) {
    return {
      ...course,
      isEnrolled,
      reviews,
      totalReviews,
      averageRating,
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
    reviews,
    totalReviews,
    averageRating,
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

const createCourseReview = async (
  courseId: string,
  userId: string,
  payload: { rating: number; comment?: string }
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!enrollment || (enrollment.paymentStatus !== "PAID" && enrollment.paymentStatus !== "FREE")) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You must be enrolled in this course to leave a review"
    );
  }

  const existingReview = await prisma.courseReview.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingReview) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You have already reviewed this course"
    );
  }

  const result = await prisma.courseReview.create({
    data: {
      courseId,
      userId,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });

  return result;
};

const getCourseReviews = async (courseId: string) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const reviews = await prisma.courseReview.findMany({
    where: { courseId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
};

export const CourseService = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
  createCourseReview,
  getCourseReviews,
};
