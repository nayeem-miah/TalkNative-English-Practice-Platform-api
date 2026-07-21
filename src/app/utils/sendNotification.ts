/* eslint-disable no-empty */
import { NotificationType } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { getSocketIO } from "./socket";

interface SendNotificationPayload {
  userId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export const sendNotification = async (payload: SendNotificationPayload) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId:   payload.userId,
        senderId: payload.senderId ?? null,
        type:     payload.type,
        title:    payload.title,
        message:  payload.message,
        link:     payload.link ?? null,
      },
    });

    try {
      const io = getSocketIO();
      io.to(`user:${payload.userId}`).emit("notification", notification);
    } catch {
    }

    return notification;
  } catch (err) {
    console.error("[Notification] Failed to send notification:", err);
  }
};
