/**
 * models/index.js
 * Path: backend/models/index.js
 * Description: Central export for all models
 * Changes:
 * - ✅ FIXED: SystemSetting properly exported
 * - ✅ FIXED: All associations
 */

import sequelize from "../config/db.js";
import User from "./User.js";
import Lesson from "./Lesson.js";
import LessonProgress from "./LessonProgress.js";
import WordProgress from "./WordProgress.js";
import Achievement from "./Achievement.js";
import UserAchievement from "./UserAchievement.js";
import AIConversation from "./AIConversation.js";
import Mentor from "./Mentor.js";
import MentorSession from "./MentorSession.js";
import Notification from "./Notification.js";
import UserNotification from "./UserNotification.js";
import Vocabulary from "./Vocabulary.js";
import Story from "./Story.js";
import StoryProgress from "./StoryProgress.js";
import Scenario from "./Scenario.js";
import XPHistory from "./XPHistory.js";
import UserRefreshToken from "./UserRefreshToken.js";
import Exercise from "./Exercise.js";
import ScenarioSession from "./ScenarioSession.js";
import Ticket from "./Ticket.js";
import PageView from "./PageView.js";
import SystemSetting from "./SystemSetting.js";

// ============================================
// 📊 Associations
// ============================================

// User ↔ Ticket
User.hasMany(Ticket, {
  foreignKey: "userId",
  as: "tickets",
});
Ticket.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// User ↔ PageView
User.hasMany(PageView, {
  foreignKey: "userId",
  as: "pageViews",
});
PageView.belongsTo(User, {
  foreignKey: "userId",
  as: "pageViewUser",
});

// User ↔ SystemSetting
SystemSetting.belongsTo(User, {
  foreignKey: "updatedBy",
  as: "updatedByUser",
});
User.hasMany(SystemSetting, {
  foreignKey: "updatedBy",
  as: "systemSettings",
});

// User ↔ Notification (through UserNotification)
User.belongsToMany(Notification, {
  through: UserNotification,
  foreignKey: "userId",
  otherKey: "notificationId",
  as: "userNotificationList",
});
Notification.belongsToMany(User, {
  through: UserNotification,
  foreignKey: "notificationId",
  otherKey: "userId",
  as: "notificationUserList",
});

// Notification ↔ UserNotification
Notification.hasMany(UserNotification, {
  foreignKey: "notificationId",
  as: "userNotificationEntries",
});
UserNotification.belongsTo(Notification, {
  foreignKey: "notificationId",
  as: "notification",
});

// User ↔ UserNotification
User.hasMany(UserNotification, {
  foreignKey: "userId",
  as: "userNotificationEntries",
});
UserNotification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// User ↔ Achievement (through UserAchievement)
User.belongsToMany(Achievement, {
  through: UserAchievement,
  foreignKey: "userId",
  otherKey: "achievementId",
  as: "achievements",
});
Achievement.belongsToMany(User, {
  through: UserAchievement,
  foreignKey: "achievementId",
  otherKey: "userId",
  as: "users",
});

// UserAchievement ↔ Achievement
UserAchievement.belongsTo(Achievement, {
  foreignKey: "achievementId",
  as: "achievement",
});
Achievement.hasMany(UserAchievement, {
  foreignKey: "achievementId",
  as: "userAchievements",
});

// UserAchievement ↔ User
UserAchievement.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
User.hasMany(UserAchievement, {
  foreignKey: "userId",
  as: "userAchievementEntries",
});

// User ↔ Exercise
User.hasMany(Exercise, {
  foreignKey: "userId",
  as: "userExercises",
});
Exercise.belongsTo(User, {
  foreignKey: "userId",
  as: "exerciseOwner",
});

// User ↔ ScenarioSession
User.hasMany(ScenarioSession, {
  foreignKey: "userId",
  as: "userScenarioSessions",
});
ScenarioSession.belongsTo(User, {
  foreignKey: "userId",
  as: "scenarioSessionUser",
});

// User ↔ LessonProgress
User.hasMany(LessonProgress, {
  foreignKey: "userId",
  as: "userLessonProgresses",
});
LessonProgress.belongsTo(User, {
  foreignKey: "userId",
  as: "lessonProgressUser",
});

// Lesson ↔ LessonProgress
Lesson.hasMany(LessonProgress, {
  foreignKey: "lessonId",
  as: "lessonProgresses",
});
LessonProgress.belongsTo(Lesson, {
  foreignKey: "lessonId",
  as: "progressLesson",
});

// User ↔ WordProgress
User.hasMany(WordProgress, {
  foreignKey: "userId",
  as: "userWordProgresses",
});
WordProgress.belongsTo(User, {
  foreignKey: "userId",
  as: "wordProgressUser",
});

// WordProgress ↔ Vocabulary
WordProgress.belongsTo(Vocabulary, {
  foreignKey: "wordId",
  as: "vocabulary",
});
Vocabulary.hasMany(WordProgress, {
  foreignKey: "wordId",
  as: "progresses",
});

// User ↔ AIConversation
User.hasMany(AIConversation, {
  foreignKey: "userId",
  as: "userAIConversations",
});
AIConversation.belongsTo(User, {
  foreignKey: "userId",
  as: "aiConversationUser",
});

// User ↔ Mentor
User.hasOne(Mentor, {
  foreignKey: "userId",
  as: "userMentor",
});
Mentor.belongsTo(User, {
  foreignKey: "userId",
  as: "mentorUser",
});

// Mentor ↔ MentorSession
Mentor.hasMany(MentorSession, {
  foreignKey: "mentorId",
  as: "mentorSessions",
});
MentorSession.belongsTo(Mentor, {
  foreignKey: "mentorId",
  as: "sessionMentor",
});

// User ↔ MentorSession (as student)
User.hasMany(MentorSession, {
  foreignKey: "studentId",
  as: "userStudentSessions",
});
MentorSession.belongsTo(User, {
  foreignKey: "studentId",
  as: "studentUser",
});

// User ↔ StoryProgress
User.hasMany(StoryProgress, {
  foreignKey: "userId",
  as: "userStoryProgresses",
});
StoryProgress.belongsTo(User, {
  foreignKey: "userId",
  as: "storyProgressUser",
});

// Story ↔ StoryProgress
Story.hasMany(StoryProgress, {
  foreignKey: "storyId",
  as: "storyProgresses",
});
StoryProgress.belongsTo(Story, {
  foreignKey: "storyId",
  as: "progressStory",
});

// User ↔ XPHistory
User.hasMany(XPHistory, {
  foreignKey: "userId",
  as: "userXPHistories",
});
XPHistory.belongsTo(User, {
  foreignKey: "userId",
  as: "xpHistoryUser",
});

// User ↔ UserRefreshToken
User.hasMany(UserRefreshToken, {
  foreignKey: "userId",
  as: "userRefreshTokens",
});
UserRefreshToken.belongsTo(User, {
  foreignKey: "userId",
  as: "refreshTokenUser",
});

// ============================================
// 📤 Named Exports
// ============================================

export {
  sequelize,
  User,
  Lesson,
  LessonProgress,
  WordProgress,
  Achievement,
  UserAchievement,
  AIConversation,
  Mentor,
  MentorSession,
  Notification,
  UserNotification,
  Vocabulary,
  Story,
  StoryProgress,
  Scenario,
  XPHistory,
  UserRefreshToken,
  Exercise,
  ScenarioSession,
  Ticket,
  PageView,
  SystemSetting,
};

// ============================================
// 📤 Default Export
// ============================================

export default {
  sequelize,
  User,
  Lesson,
  LessonProgress,
  WordProgress,
  Achievement,
  UserAchievement,
  AIConversation,
  Mentor,
  MentorSession,
  Notification,
  UserNotification,
  Vocabulary,
  Story,
  StoryProgress,
  Scenario,
  XPHistory,
  UserRefreshToken,
  Exercise,
  ScenarioSession,
  Ticket,
  PageView,
  SystemSetting,
};
