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

export const CallService = {
  createCallRecord,
  updateCallStatus,
  createReport,
  getCallHistory,
};
