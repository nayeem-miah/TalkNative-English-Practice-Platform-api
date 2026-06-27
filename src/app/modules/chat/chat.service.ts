/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../prisma/prisma";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";

const getTickets = async (query: Record<string, any>) => {
  const qb = new PrismaQueryBuilder(query)
    .filter()
    .sort()
    .fields()
    .paginate();

  const { where, orderBy, skip, take } = qb.build();

  const [data, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    meta: qb.getMeta(total),
    data,
  };
};

const getMessages = async (ticketId: string) => {
  return await prisma.message.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
  });
};

const resolveTicket = async (ticketId: string) => {
  return await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "RESOLVED" },
  });
};

const getMyTicket = async (userId: string) => {
  return await prisma.ticket.findFirst({
    where: { userId, status: "OPEN" },
    orderBy: { createdAt: "desc" },
  });
};

const markTicketRead = async (ticketId: string) => {
  return await prisma.ticket.update({
    where: { id: ticketId },
    data: { unreadCount: 0 },
  });
};

export const ChatService = {
  getTickets,
  getMessages,
  resolveTicket,
  getMyTicket,
  markTicketRead,
};
