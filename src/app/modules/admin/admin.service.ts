import { PaymentStatus } from "@prisma/client";
import { prisma } from "../../prisma/prisma";

const getDashboardOverview = async () => {
  // 1. Fetch Stats
  const totalCourses = await prisma.course.count();
  const totalEnrollments = await prisma.enrollment.count();
  
  const revenueAggregate = await prisma.enrollment.aggregate({
    where: {
      paymentStatus: PaymentStatus.PAID,
    },
    _sum: {
      amountPaid: true,
    },
  });
  const totalRevenue = revenueAggregate._sum.amountPaid || 0;

  // 2. Fetch Recent 5 Enrollments
  const recentEnrollments = await prisma.enrollment.findMany({
    orderBy: {
      enrolledAt: "desc",
    },
    take: 5,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  // 3. Fetch Active 5 Courses (latest created)
  const activeCourses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      _count: {
        select: {
          lessons: true,
        },
      },
    },
  });

  return {
    stats: {
      totalCourses,
      totalEnrollments,
      totalRevenue,
    },
    recentEnrollments,
    activeCourses,
  };
};

export const AdminService = {
  getDashboardOverview,
};
