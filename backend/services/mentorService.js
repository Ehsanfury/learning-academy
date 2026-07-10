/**
 * mentorService.js
 * Path: backend/services/mentorService.js
 * Description: Mentor service for managing mentors and sessions
 */

import { Op } from "sequelize";
import { Mentor, MentorSession, User } from "../models/index.js";
import logger from "../config/logger.js";

class MentorService {
  async getMentors({ level, language, limit = 20, offset = 0 }) {
    try {
      const where = { isActive: true };
      if (level) where.level = level;

      const { count, rows } = await Mentor.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: User,
            as: "mentorUser",
            attributes: ["id", "name", "email", "avatar"],
          },
        ],
        order: [["rating", "DESC"]],
      });

      const mentors = rows.map((mentor) => ({
        ...mentor.toJSON(),
        user: mentor.mentorUser,
      }));

      return {
        mentors,
        total: count,
        isMock: false,
      };
    } catch (error) {
      logger.error(`❌ Error in getMentors:`, error);
      return {
        mentors: [],
        total: 0,
        isMock: true,
        error: error.message,
      };
    }
  }

  async updateMentorById(mentorId, data) {
    try {
      const mentor = await Mentor.findByPk(mentorId);
      if (!mentor) return null;

      const allowedFields = [
        "name",
        "level",
        "hourlyRate",
        "languages",
        "specializations",
        "bio",
        "isVerified",
        "isActive",
        "rating",
        "totalStudents",
      ];
      const updateData = {};

      allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });

      await mentor.update(updateData);
      logger.info(`✅ Mentor updated: ${mentorId}`);
      return mentor;
    } catch (error) {
      logger.error(`❌ Error in updateMentorById:`, error);
      throw error;
    }
  }

  async getMentorById(mentorId) {
    try {
      const mentor = await Mentor.findByPk(mentorId, {
        include: [
          {
            model: User,
            as: "mentorUser",
            attributes: ["id", "name", "email", "avatar"],
          },
        ],
      });

      if (!mentor) return null;

      return {
        ...mentor.toJSON(),
        user: mentor.mentorUser,
      };
    } catch (error) {
      logger.error(`❌ Error in getMentorById:`, error);
      return null;
    }
  }

  async getMentorByUserId(userId) {
    try {
      const mentor = await Mentor.findOne({
        where: { userId, isActive: true },
        include: [
          {
            model: User,
            as: "mentorUser",
            attributes: ["id", "name", "email", "avatar"],
          },
        ],
      });

      return mentor;
    } catch (error) {
      logger.error(`❌ Error in getMentorByUserId:`, error);
      return null;
    }
  }

  async registerAsMentor(userId, data) {
    try {
      const { id, level, hourlyRate, languages, specializations, bio } = data;

      const existing = await this.getMentorByUserId(userId);
      if (existing) {
        throw new Error("You are already registered as a mentor");
      }

      const mentor = await Mentor.create({
        id: id || `mentor-${Date.now()}`,
        userId,
        level,
        name: data.name || "Mentor",
        hourlyRate: hourlyRate || 15,
        languages: languages || ["fa", "de"],
        specializations: specializations || [],
        bio: bio || { fa: "", en: "", de: "" },
        isActive: true,
      });

      return mentor;
    } catch (error) {
      logger.error(`❌ Error in registerAsMentor:`, error);
      throw error;
    }
  }

  async bookSession(studentId, mentorId, startTime, endTime) {
    try {
      const mentor = await Mentor.findByPk(mentorId);
      if (!mentor) {
        throw new Error("Mentor not found");
      }

      const existing = await MentorSession.findOne({
        where: {
          mentorId,
          status: { [Op.in]: ["pending", "confirmed"] },
          [Op.or]: [
            { startTime: { [Op.between]: [startTime, endTime] } },
            { endTime: { [Op.between]: [startTime, endTime] } },
          ],
        },
      });

      if (existing) {
        throw new Error("Time slot is not available");
      }

      const session = await MentorSession.create({
        mentorId,
        studentId,
        startTime,
        endTime,
        status: "pending",
        price: mentor.hourlyRate,
      });

      return session;
    } catch (error) {
      logger.error(`❌ Error in bookSession:`, error);
      throw error;
    }
  }

  async getUserSessions(userId, role = "student") {
    try {
      let where = {};
      let include = [];

      if (role === "student") {
        where.studentId = userId;
        include = [
          {
            model: Mentor,
            as: "sessionMentor",
            include: [
              {
                model: User,
                as: "mentorUser",
                attributes: ["id", "name", "email", "avatar"],
              },
            ],
          },
        ];
      } else {
        const mentor = await this.getMentorByUserId(userId);
        if (!mentor) {
          return [];
        }
        where.mentorId = mentor.id;
        include = [
          {
            model: User,
            as: "studentUser",
            attributes: ["id", "name", "email", "avatar"],
          },
        ];
      }

      const sessions = await MentorSession.findAll({
        where,
        include,
        order: [["startTime", "DESC"]],
      });

      return sessions;
    } catch (error) {
      logger.error(`❌ Error in getUserSessions:`, error);
      return [];
    }
  }

  async updateSessionStatus(sessionId, status, mentorId) {
    try {
      const session = await MentorSession.findOne({
        where: { id: sessionId, mentorId },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      await session.update({ status });
      return session;
    } catch (error) {
      logger.error(`❌ Error in updateSessionStatus:`, error);
      throw error;
    }
  }

  async completeSession(sessionId, studentId, review, rating) {
    try {
      const session = await MentorSession.findOne({
        where: { id: sessionId, studentId },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      await session.update({
        status: "completed",
        review,
        rating,
      });

      const mentor = await Mentor.findByPk(session.mentorId);
      if (mentor) {
        const allSessions = await MentorSession.findAll({
          where: {
            mentorId: session.mentorId,
            status: "completed",
            rating: { [Op.ne]: null },
          },
        });

        const avgRating =
          allSessions.length > 0
            ? allSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / allSessions.length
            : rating;

        await mentor.update({
          rating: avgRating,
          totalStudents: allSessions.length,
        });
      }

      return session;
    } catch (error) {
      logger.error(`❌ Error in completeSession:`, error);
      throw error;
    }
  }

  async getMentorStats(mentorId) {
    try {
      const mentor = await Mentor.findByPk(mentorId);
      if (!mentor) {
        return {
          totalSessions: 0,
          completedSessions: 0,
          pendingSessions: 0,
          averageRating: 0,
          totalStudents: 0,
        };
      }

      const sessions = await MentorSession.findAll({
        where: { mentorId },
      });

      return {
        totalSessions: sessions.length,
        completedSessions: sessions.filter((s) => s.status === "completed").length,
        pendingSessions: sessions.filter((s) => s.status === "pending").length,
        averageRating: mentor.rating || 0,
        totalStudents: mentor.totalStudents || 0,
      };
    } catch (error) {
      logger.error(`❌ Error in getMentorStats:`, error);
      return {
        totalSessions: 0,
        completedSessions: 0,
        pendingSessions: 0,
        averageRating: 0,
        totalStudents: 0,
      };
    }
  }

  async updateMentorProfile(userId, data) {
    try {
      const mentor = await this.getMentorByUserId(userId);
      if (!mentor) {
        throw new Error("You are not registered as a mentor");
      }

      const allowedFields = ["level", "hourlyRate", "languages", "specializations", "bio"];
      const updateData = {};

      allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });

      await mentor.update(updateData);
      return mentor;
    } catch (error) {
      logger.error(`❌ Error in updateMentorProfile:`, error);
      throw error;
    }
  }
}

export default new MentorService();
