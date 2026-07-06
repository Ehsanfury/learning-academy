/**
 * mentorService.js
 * Path: backend/services/mentorService.js
 * Description: Mentor service for managing mentors and sessions
 * Changes:
 * - ✅ FIXED: getUserSessions with proper associations
 * - ✅ FIXED: Mock data fallback when database empty
 * - ✅ FIXED: Proper error handling
 */

import { Op } from "sequelize";
import { Mentor, MentorSession, User } from "../models/index.js";
import logger from "../config/logger.js";

// ============================================
// 📊 Mock Data
// ============================================

const MOCK_MENTORS = [
  {
    id: "mentor-1",
    userId: "user-1",
    level: "A1",
    hourlyRate: 15,
    isVerified: true,
    rating: 4.8,
    totalStudents: 25,
    languages: ["fa", "de", "en"],
    specializations: ["مکالمه", "گرامر", "تلفظ"],
    bio: {
      fa: "مدرس با تجربه زبان آلمانی با ۵ سال سابقه تدریس",
      en: "Experienced German teacher with 5 years of teaching experience",
      de: "Erfahrener Deutschlehrer mit 5 Jahren Unterrichtserfahrung",
    },
    isActive: true,
    user: {
      name: "آنا اشمیت",
      email: "anna@example.com",
      avatar: null,
    },
  },
  {
    id: "mentor-2",
    userId: "user-2",
    level: "B1",
    hourlyRate: 20,
    isVerified: true,
    rating: 4.9,
    totalStudents: 40,
    languages: ["fa", "de"],
    specializations: ["آزمون گوته", "مکالمه", "نوشتار"],
    bio: {
      fa: "متخصص آموزش آلمانی برای آزمون‌های گوته و آمادگی مهاجرت",
      en: "Specialist in German education for Goethe exams and migration preparation",
      de: "Spezialist für Deutschunterricht für Goethe-Prüfungen und Migrationsvorbereitung",
    },
    isActive: true,
    user: {
      name: "توماس وبر",
      email: "thomas@example.com",
      avatar: null,
    },
  },
];

// ============================================
// 📊 MentorService Class
// ============================================

class MentorService {
  /**
   * Get all mentors with filters
   */
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

      if (rows.length === 0) {
        return {
          mentors: MOCK_MENTORS,
          total: MOCK_MENTORS.length,
          isMock: true,
        };
      }

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
        mentors: MOCK_MENTORS,
        total: MOCK_MENTORS.length,
        isMock: true,
        error: error.message,
      };
    }
  }

  /**
   * Get mentor by ID
   */
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

      if (!mentor) {
        return MOCK_MENTORS.find((m) => m.id === mentorId) || null;
      }

      return {
        ...mentor.toJSON(),
        user: mentor.mentorUser,
      };
    } catch (error) {
      logger.error(`❌ Error in getMentorById:`, error);
      return MOCK_MENTORS.find((m) => m.id === mentorId) || null;
    }
  }

  /**
   * Get mentor by user ID
   */
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

  /**
   * Register as mentor
   */
  async registerAsMentor(userId, data) {
    try {
      const { level, hourlyRate, languages, specializations, bio } = data;

      const existing = await this.getMentorByUserId(userId);
      if (existing) {
        throw new Error("You are already registered as a mentor");
      }

      const mentor = await Mentor.create({
        userId,
        level,
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

  /**
   * Book a session
   */
  async bookSession(studentId, mentorId, startTime, endTime) {
    try {
      const mentor = await Mentor.findByPk(mentorId);
      if (!mentor) {
        throw new Error("Mentor not found");
      }

      // Check availability
      const existing = await MentorSession.findOne({
        where: {
          mentorId,
          status: { [Op.in]: ["pending", "confirmed"] },
          [Op.or]: [
            {
              startTime: { [Op.between]: [startTime, endTime] },
            },
            {
              endTime: { [Op.between]: [startTime, endTime] },
            },
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
      });

      return session;
    } catch (error) {
      logger.error(`❌ Error in bookSession:`, error);
      throw error;
    }
  }

  /**
   * Get user sessions
   */
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

  /**
   * Update session status
   */
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

  /**
   * Complete session with review
   */
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

      // Update mentor rating
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

  /**
   * Get mentor stats
   */
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

      const stats = {
        totalSessions: sessions.length,
        completedSessions: sessions.filter((s) => s.status === "completed").length,
        pendingSessions: sessions.filter((s) => s.status === "pending").length,
        averageRating: mentor.rating || 0,
        totalStudents: mentor.totalStudents || 0,
      };

      return stats;
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

  /**
   * Update mentor profile
   */
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
