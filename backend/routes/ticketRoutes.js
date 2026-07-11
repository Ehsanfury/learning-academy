/**
 * ticketRoutes.js
 * Path: backend/routes/ticketRoutes.js
 * Description: Support ticket routes for users
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import Ticket from "../models/Ticket.js";
import { success, notFound, badRequest } from "../utils/response.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// Create new ticket
// POST /api/tickets
// ============================================
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { subject, message, category, priority, page } = req.body;

    if (!subject || !message) {
      return badRequest(res, "Subject and message are required");
    }

    const ticket = await Ticket.create({
      userId: req.user.id,
      subject: subject.trim(),
      message: message.trim(),
      category: category || "other",
      priority: priority || "medium",
      page: page || null,
      userAgent: req.get("user-agent"),
    });

    return success(res, ticket, "Ticket created successfully", 201);
  })
);

// ============================================
// Get user's tickets
// GET /api/tickets
// ============================================
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const tickets = await Ticket.findAll({
      where: { userId: req.user.id, isActive: true },
      order: [["createdAt", "DESC"]],
    });

    return success(res, tickets);
  })
);

// ============================================
// Get a single ticket
// GET /api/tickets/:id
// ============================================
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const ticket = await Ticket.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!ticket) {
      return notFound(res, `Ticket with id "${req.params.id}" not found`);
    }

    return success(res, ticket);
  })
);

// ============================================
// Close ticket by user
// PUT /api/tickets/:id/close
// ============================================
router.put(
  "/:id/close",
  asyncHandler(async (req, res) => {
    const ticket = await Ticket.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!ticket) {
      return notFound(res, `Ticket with id "${req.params.id}" not found`);
    }

    await ticket.update({ status: "closed" });

    return success(res, ticket, "Ticket closed");
  })
);

export default router;
