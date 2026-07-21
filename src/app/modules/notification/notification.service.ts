import { prisma } from "../../prisma/prisma";

const getMyNotifications = async (userId: string, query: Record<string, string>) => {
  const page  = parseInt(query.page  || "1");
  const limit = parseInt(query.limit || "20");
  const skip  = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    data: notifications,
    meta: { page, limit, total, unreadCount },
  };
};


const markAsRead = async (userId: string, notificationId: string) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data:  { isRead: true },
  });
};

const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  });
};

const deleteNotification = async (userId: string, notificationId: string) => {
  return prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
};

const deleteAllNotifications = async (userId: string) => {
  return prisma.notification.deleteMany({ where: { userId } });
};

const getUnreadCount = async (userId: string) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { count };
};

export const NotificationService = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
};
