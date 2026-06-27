import { UserRole } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth";
import { ChatController } from "./chat.controller";

const router = Router();

router.get(
  "/tickets",
  auth(UserRole.ADMIN),
  ChatController.getTickets
);

router.get(
  "/tickets/my-ticket",
  auth(UserRole.USER),
  ChatController.getMyTicket
);


router.get(
  "/messages/:ticketId",
  auth(),
  ChatController.getMessages
);

router.patch(
  "/ticket/:ticketId/resolve",
  auth(UserRole.ADMIN),
  ChatController.resolveTicket
);

router.patch(
  "/ticket/:ticketId/read",
  auth(),
  ChatController.markTicketRead
);

export const ChatRoutes = router;
