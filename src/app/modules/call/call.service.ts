import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createCallRecord = async (data: { roomId: string; callerId: string; calleeId: string }) => {
  return await prisma.call.create({
    data: {
      roomId: data.roomId,
      callerId: data.callerId,
      calleeId: data.calleeId,
      status: 'ONGOING',
    },
  });
};

const updateCallStatus = async (roomId: string, status: string, duration?: number) => {
  return await prisma.call.update({
    where: { roomId },
    data: {
      status,
      endTime: new Date(),
      duration,
    },
  });
};

const createReport = async (data: { reporterId: string; reportedId: string; callId?: string; reason: string; description?: string }) => {
  return await prisma.report.create({
    data,
  });
};

const getCallHistory = async (userId: string) => {
  return await prisma.call.findMany({
    where: {
      OR: [
        { callerId: userId },
        { calleeId: userId },
      ],
    },
    include: {
      caller: { select: { name: true, profilePicture: true } },
      callee: { select: { name: true, profilePicture: true } },
    },
    orderBy: { startTime: 'desc' },
  });
};

const createReview = async (data: { reviewerId: string; revieweeId: string; rating: number; notes?: string }) => {
  return await prisma.review.create({
    data: {
      reviewerId: data.reviewerId,
      revieweeId: data.revieweeId,
      rating: Number(data.rating),
      notes: data.notes,
    },
  });
};

const getAllReports = async () => {
  return await prisma.report.findMany({
    include: {
      reporter: { select: { id: true, name: true, email: true, profilePicture: true } },
      reported: { select: { id: true, name: true, email: true, profilePicture: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getSingleReport = async (id: string) => {
  return await prisma.report.findUniqueOrThrow({
    where: { id },
    include: {
      reporter: { select: { id: true, name: true, email: true, profilePicture: true } },
      reported: { select: { id: true, name: true, email: true, profilePicture: true } },
    },
  });
};

const getAllReviews = async () => {
  return await prisma.review.findMany({
    include: {
      reviewer: { select: { id: true, name: true, email: true, profilePicture: true } },
      reviewee: { select: { id: true, name: true, email: true, profilePicture: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getSingleReview = async (id: string) => {
  return await prisma.review.findUniqueOrThrow({
    where: { id },
    include: {
      reviewer: { select: { id: true, name: true, email: true, profilePicture: true } },
      reviewee: { select: { id: true, name: true, email: true, profilePicture: true } },
    },
  });
};

const suspendUser = async (userId: string, status: 'SUSPENDED' | 'ACTIVE', reason?: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      status,
      suspensionReason: status === 'SUSPENDED' ? reason || 'Violated community guidelines' : null,
      suspendedAt: status === 'SUSPENDED' ? new Date() : null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      suspensionReason: true,
      suspendedAt: true,
    }
  });
};

export const CallService = {
  createCallRecord,
  updateCallStatus,
  createReport,
  getCallHistory,
  createReview,
  getAllReports,
  getSingleReport,
  getAllReviews,
  getSingleReview,
  suspendUser,
};
