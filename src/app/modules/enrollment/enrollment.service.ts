import { Enrollment, PaymentStatus } from "@prisma/client";
import { prisma } from "../../prisma/prisma";
import { stripe } from "../../utils/stripe";
import config from "../../config";
import ApiError from "../../errors/apiError";
import httpStatus from "http-status";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";

const enrollFreeCourse = async (userId: string, courseId: string): Promise<Enrollment> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  if (course.type !== "FREE") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This is a paid course. Please purchase to enroll."
    );
  }

  // Check if already enrolled with active status (PAID or FREE)
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (
    existingEnrollment &&
    (existingEnrollment.paymentStatus === PaymentStatus.PAID ||
      existingEnrollment.paymentStatus === PaymentStatus.FREE)
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You are already enrolled in this course");
  }

  const result = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    update: {
      paymentStatus: PaymentStatus.FREE,
      amountPaid: 0.0,
      transactionId: "FREE_COURSE",
    },
    create: {
      userId,
      courseId,
      paymentStatus: PaymentStatus.FREE,
      amountPaid: 0.0,
      transactionId: "FREE_COURSE",
    },
  });

  return result;
};

const createCheckoutSession = async (
  userId: string,
  userEmail: string,
  courseId: string
): Promise<{ checkoutUrl: string | null }> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  if (course.type !== "PAID") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This is a free course. Please enroll directly using the free enrollment option."
    );
  }

  // Check if already enrolled with active status
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (
    existingEnrollment &&
    (existingEnrollment.paymentStatus === PaymentStatus.PAID ||
      existingEnrollment.paymentStatus === PaymentStatus.FREE)
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You are already enrolled in this course");
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: course.description,
          },
          unit_amount: Math.round(course.price * 100), // in cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      paymentType: "COURSE_ENROLLMENT",
      userId,
      courseId,
    },
    success_url: `${config.stripe.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.stripe.frontendUrl}/payment/cancel`,
  });

  // Save the pending enrollment tracking the session ID
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    update: {
      paymentStatus: PaymentStatus.PENDING,
      transactionId: session.id,
    },
    create: {
      userId,
      courseId,
      paymentStatus: PaymentStatus.PENDING,
      transactionId: session.id,
    },
  });

  return { checkoutUrl: session.url };
};

const getMyCourses = async (userId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      paymentStatus: {
        in: [PaymentStatus.PAID, PaymentStatus.FREE],
      },
    },
    include: {
      course: {
        include: {
          _count: {
            select: { lessons: true },
          },
        },
      },
    },
    orderBy: {
      enrolledAt: "desc",
    },
  });

  return enrollments.map((enrollment) => enrollment.course);
};

const getAllEnrollments = async (query: Record<string, any>) => {
  const queryData = { sortBy: "enrolledAt", ...query };
  const enrollmentQuery = new PrismaQueryBuilder(queryData)
    .search(["transactionId"])
    .filter()
    .sort()
    .paginate();

  const { where, orderBy, skip, take } = enrollmentQuery.build();

  const [result, total] = await prisma.$transaction([
    prisma.enrollment.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            type: true,
          },
        },
      },
    }),
    prisma.enrollment.count({ where }),
  ]);

  const meta = enrollmentQuery.getMeta(total);

  return {
    meta,
    data: result,
  };
};

export const EnrollmentService = {
  enrollFreeCourse,
  createCheckoutSession,
  getMyCourses,
  getAllEnrollments,
};
