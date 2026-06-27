/* eslint-disable prefer-const */
import { Socket } from "socket.io";
import { prisma } from "../../prisma/prisma";

export const handleChatSockets = (socket: Socket) => {

  socket.on("joinTicket", (ticketId: string) => {
    socket.join(`ticket_${ticketId}`);
  });

  socket.on("leaveTicket", (ticketId: string) => {
    socket.leave(`ticket_${ticketId}`);
  });

  socket.on("sendMessage", async (data: { ticketId: string; senderId: string; senderModel: string; content: string }) => {
    try {
      let { ticketId, senderId, senderModel, content } = data;

      if (!ticketId && senderModel === "USER") {
        const ticket = await prisma.ticket.create({
          data: {
            userId: senderId,
            lastMessage: content,
          }
        });
        ticketId = ticket.id;
      } else if (ticketId) {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: {
            lastMessage: content,
            unreadCount: { increment: 1 },
            updatedAt: new Date(),
          },
        });
      }

      const message = await prisma.message.create({
        data: {
          ticketId,
          senderId,
          senderModel,
          content,
        },
      });

      socket.nsp.to(`ticket_${ticketId}`).emit("newMessage", message);

      socket.nsp.to("admin_support").emit("ticketUpdated", { ticketId, message });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("typingStart", (data: { ticketId: string; senderId: string }) => {
    socket.to(`ticket_${data.ticketId}`).emit("typingStart", data);
  });

  socket.on("typingStop", (data: { ticketId: string; senderId: string }) => {
    socket.to(`ticket_${data.ticketId}`).emit("typingStop", data);
  });

  socket.on("userStatusChange", (data: { userId: string; status: "online" | "offline" }) => {
    // Broadcast user status to admins or specific rooms
    socket.broadcast.emit("userStatusChange", data);
  });
};
