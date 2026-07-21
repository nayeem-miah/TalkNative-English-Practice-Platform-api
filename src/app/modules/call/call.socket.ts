/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotificationType, PrismaClient } from '@prisma/client';
import { Socket } from 'socket.io';
import { RedisHelper } from '../../utils/redis';
import { sendNotification } from '../../utils/sendNotification';
import { getSocketIO } from '../../utils/socket';
import { CallService } from './call.service';

const prisma = new PrismaClient();

const WAITING_USERS_KEY = 'matchmaking_queue';
const ACTIVE_CALLS_KEY = 'active_calls';


const socketToUser = new Map<string, string>();

export const handleCallSockets = (socket: Socket) => {
  const io = getSocketIO();

  socket.on('join_matchmaking', async (userData: { userId: string; name: string }) => {
    const userId = userData.userId;
    socketToUser.set(socket.id, userId);

    socket.join(`user_${userId}`);

    console.log(`🔍 User ${userId} (${userData.name}) joined matchmaking queue.`);
    let partnerId: string | null = null;
    let isPartnerOnline = false;

    while (true) {
      partnerId = await RedisHelper.client.sPop(WAITING_USERS_KEY);
      if (!partnerId) break;

      if (partnerId === userId) continue;

      const activeSockets = await io.in(`user_${partnerId}`).fetchSockets();
      if (activeSockets.length > 0) {
        isPartnerOnline = true;
        break;
      } else {
        console.log(`🧹 Cleaned up offline user ${partnerId} from queue.`);
      }
    }

    if (isPartnerOnline && partnerId) {
      const roomId = `call_${userId}_${partnerId}_${Date.now()}`;

      await RedisHelper.client.hSet(ACTIVE_CALLS_KEY, userId, roomId);
      await RedisHelper.client.hSet(ACTIVE_CALLS_KEY, partnerId, roomId);

      try {
        await CallService.createCallRecord({
          roomId,
          callerId: userId,
          calleeId: partnerId
        });
      } catch (dbError) {
        console.error("❌ Failed to create call record in database:", dbError);
      }


      const userProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, profilePicture: true, nativeLanguage: true }
      });

      const partnerProfile = await prisma.user.findUnique({
        where: { id: partnerId },
        select: { name: true, profilePicture: true, nativeLanguage: true }
      });

      socket.join(roomId);
      io.in(`user_${userId}`).socketsJoin(roomId);
      io.in(`user_${partnerId}`).socketsJoin(roomId);
      console.log(`📡 Auto-joined user_${userId} and user_${partnerId} sockets to room ${roomId}`);

      // Tell the partner's socket to join the room
      io.to(`user_${partnerId}`).emit('match_found', {
        roomId,
        partnerId: userId,
        partnerName: userProfile?.name || "Partner",
        partnerAvatar: userProfile?.profilePicture || "",
        partnerLanguage: userProfile?.nativeLanguage || "Bengali",
        members: [userId, partnerId]
      });

      // Emit to current user
      socket.emit('match_found', {
        roomId,
        partnerId: partnerId,
        partnerName: partnerProfile?.name || "Partner",
        partnerAvatar: partnerProfile?.profilePicture || "",
        partnerLanguage: partnerProfile?.nativeLanguage || "Bengali",
        members: [userId, partnerId]
      });

      await Promise.allSettled([
        sendNotification({
          userId:   partnerId,
          senderId: userId,
          type:     NotificationType.CALL,
          title:    `📞 Incoming Call from ${userProfile?.name || 'Someone'}`,
          message:  'You have been matched for an English practice call!',
          link:     `/call/${roomId}`,
        }),
        sendNotification({
          userId:   userId,
          senderId: partnerId,
          type:     NotificationType.CALL,
          title:    `📞 Call matched with ${partnerProfile?.name || 'Someone'}`,
          message:  'You have been matched for an English practice call!',
          link:     `/call/${roomId}`,
        }),
      ]);

      console.log(`✅ Match found: ${userId} <-> ${partnerId} in room ${roomId}`);
    } else {
      await RedisHelper.client.sAdd(WAITING_USERS_KEY, userId);
      console.log(`⏳ User ${userId} added to queue.`);
    }
  });


  socket.on('join_call_room', (data: { roomId: string }) => {
    socket.join(data.roomId);
    console.log(`📞 Socket ${socket.id} joined call room ${data.roomId}`);
  });


  socket.on('signal', (data: { roomId: string; signal: any; to: string }) => {
    socket.to(data.roomId).emit('signal', {
      from: socket.id,
      signal: data.signal
    });
  });

  socket.on('leave_call', async (data: { roomId: string; userId: string }) => {
    socket.leave(data.roomId);
    await RedisHelper.client.hDel(ACTIVE_CALLS_KEY, data.userId);

    await CallService.updateCallStatus(data.roomId, 'COMPLETED');

    socket.to(data.roomId).emit('partner_left');
    console.log(`🚪 User ${data.userId} left call ${data.roomId}`);
  });

  socket.on('disconnect', async () => {
    const userId = socketToUser.get(socket.id);
    if (userId) {
      console.log(`🔌 Cleaning up for user ${userId}`);
      await RedisHelper.client.sRem(WAITING_USERS_KEY, userId);

      const roomId = await RedisHelper.client.hGet(ACTIVE_CALLS_KEY, userId);
      if (roomId) {
        socket.to(roomId).emit('partner_left');
        await RedisHelper.client.hDel(ACTIVE_CALLS_KEY, userId);
        await CallService.updateCallStatus(roomId, 'CANCELLED');
      }

      socketToUser.delete(socket.id);
    }
  });
};
