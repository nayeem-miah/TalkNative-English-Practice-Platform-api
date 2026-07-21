/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnnouncementStatus, NotificationType } from "@prisma/client";
import { prisma } from "../../prisma/prisma";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";
import emailSender from "../../utils/emailSender";
import { getAnnouncementTemplate } from "../../utils/emailTemplates";
import { sendNotification } from "../../utils/sendNotification";

const createAnnouncement = async (payload: any) => {
  const result = await prisma.announcement.create({
    data: payload,
  });

  if (result.status === AnnouncementStatus.PUBLISHED) {
    prisma.user.findMany({ select: { id: true, email: true, name: true } })
      .then((users) => {
        users.forEach((user) => {
          const html = getAnnouncementTemplate(user.name, result.title, result.content);
          emailSender(`New Announcement: ${result.title}`, user.email, html)
            .catch(err => console.error(`Failed to send announcement email to ${user.email}`, err));
          sendNotification({
            userId:  user.id,
            type:    NotificationType.ANNOUNCEMENT,
            title:   `📢 ${result.title}`,
            message: result.content.substring(0, 100) + (result.content.length > 100 ? "..." : ""),
            link:    `/announcements`,
          }).catch(err => console.error(`Failed to send notification to ${user.id}`, err));
        });
      })
      .catch(err => console.error("Failed to fetch users for announcement", err));
  }

  return result;
};

const getAllAnnouncements = async (query: Record<string, any>) => {
  const qb = new PrismaQueryBuilder(query)
    .filter()
    .search(["title", "category"])
    .sort()
    .fields()
    .paginate();

  const prismaQuery = qb.build();

  const [data, total] = await Promise.all([
    prisma.announcement.findMany(prismaQuery as any),
    prisma.announcement.count({ where: prismaQuery.where }),
  ]);

  return {
    meta: qb.getMeta(total),
    data,
  };
};

const getFeed = async () => {
  return await prisma.announcement.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const deleteAnnouncement = async (id: string) => {
  return await prisma.announcement.delete({
    where: {
      id,
    },
  });
};

const updateAnnouncement = async (id: string, payload: any) => {
  return await prisma.announcement.update({
    where: {
      id,
    },
    data: payload,
  });
};

export const AnnouncementService = {
  createAnnouncement,
  getAllAnnouncements,
  getFeed,
  deleteAnnouncement,
  updateAnnouncement,
};
