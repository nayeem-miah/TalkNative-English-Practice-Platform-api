import { Socket } from 'socket.io';
import { RedisHelper } from '../../utils/redis';
import { getSocketIO } from '../../utils/socket';
import { CallService } from './call.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WAITING_USERS_KEY = 'matchmaking_queue';
const ACTIVE_CALLS_KEY = 'active_calls';

// In-memory mapping for this instance to handle cleanup
const socketToUser = new Map<string, string>();

export const handleCallSockets = (socket: Socket) => {
  const io = getSocketIO();

  socket.on('join_matchmaking', async (userData: { userId: string; name: string }) => {
    const userId = userData.userId;
    socketToUser.set(socket.id, userId);
    
    // Each user joins their own room for targeted messaging across servers
    socket.join(`user_${userId}`);

    console.log(`🔍 User ${userId} (${userData.name}) joined matchmaking queue.`);

    // Get another user from the queue who is actually online
    let partnerId: string | null = null;
    let isPartnerOnline = false;

    while (true) {
      partnerId = await RedisHelper.client.sPop(WAITING_USERS_KEY);
      if (!partnerId) break; // Queue is empty

      if (partnerId === userId) continue; // Skip self

      // Verify that this partner is currently connected/online
      const activeSockets = await io.in(`user_${partnerId}`).fetchSockets();
      if (activeSockets.length > 0) {
        isPartnerOnline = true;
        break; // Match found with an online partner!
      } else {
        console.log(`🧹 Cleaned up offline user ${partnerId} from queue.`);
      }
    }

    if (isPartnerOnline && partnerId) {
      // Match found!
      // Add a timestamp to ensure roomId is always unique, even if the same two users match again!
      const roomId = `call_${userId}_${partnerId}_${Date.now()}`;
      
      // Store active call mapping in Redis
      await RedisHelper.client.hSet(ACTIVE_CALLS_KEY, userId, roomId);
      await RedisHelper.client.hSet(ACTIVE_CALLS_KEY, partnerId, roomId);

      // Create database record safely
      try {
        await CallService.createCallRecord({
          roomId,
          callerId: userId,
          calleeId: partnerId
        });
      } catch (dbError) {
        console.error("❌ Failed to create call record in database:", dbError);
      }


      // Fetch user profile details from database
      const userProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, profilePicture: true, nativeLanguage: true }
      });

      const partnerProfile = await prisma.user.findUnique({
        where: { id: partnerId },
        select: { name: true, profilePicture: true, nativeLanguage: true }
      });

      // Join current socket to the call room
      socket.join(roomId);
      
      // Auto-join all socket instances of both users to the call room on the server side
      // to prevent WebRTC signaling race conditions where one user sends the offer
      // before the other has joined the room.
      io.in(`user_${userId}`).socketsJoin(roomId);
      io.in(`user_${partnerId}`).socketsJoin(roomId);
      console.log(`📡 Auto-joined user_${userId} and user_${partnerId} sockets to room ${roomId}`);
      
      // Tell the partner's socket (wherever it is) to join the room
      // This requires the Redis Adapter to work across multiple instances
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

      console.log(`✅ Match found: ${userId} <-> ${partnerId} in room ${roomId}`);
    } else {
      // No partner found, add current user to queue
      await RedisHelper.client.sAdd(WAITING_USERS_KEY, userId);
      console.log(`⏳ User ${userId} added to queue.`);
    }
  });

  // Partner joins the room after receiving match_found
  socket.on('join_call_room', (data: { roomId: string }) => {
    socket.join(data.roomId);
    console.log(`📞 Socket ${socket.id} joined call room ${data.roomId}`);
  });

  // WebRTC Signaling
  socket.on('signal', (data: { roomId: string; signal: any; to: string }) => {
    socket.to(data.roomId).emit('signal', {
      from: socket.id,
      signal: data.signal
    });
  });

  socket.on('leave_call', async (data: { roomId: string; userId: string }) => {
    socket.leave(data.roomId);
    await RedisHelper.client.hDel(ACTIVE_CALLS_KEY, data.userId);
    
    // Update DB status
    await CallService.updateCallStatus(data.roomId, 'COMPLETED');

    socket.to(data.roomId).emit('partner_left');
    console.log(`🚪 User ${data.userId} left call ${data.roomId}`);
  });

  socket.on('disconnect', async () => {
    const userId = socketToUser.get(socket.id);
    if (userId) {
      console.log(`🔌 Cleaning up for user ${userId}`);
      // Remove from queue if they were waiting
      await RedisHelper.client.sRem(WAITING_USERS_KEY, userId);
      
      // Handle mid-call disconnect
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
