/**
 * models/index.js
 * Path: backend/models/index.js
 * Description: Central export for all models
 */

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
import ScenarioSession from "./ScenarioSession.js";
import XPHistory from "./XPHistory.js";
import UserRefreshToken from "./UserRefreshToken.js";
import Exercise from "./Exercise.js";

// ============================================
// 📊 Associations
// ============================================

// ============================================
// ✅ Lesson ↔ Vocabulary
// ============================================
Lesson.hasMany(Vocabulary, {
  foreignKey: "lessonId",
  as: "vocabularyItems",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Vocabulary.belongsTo(Lesson, {
  foreignKey: "lessonId",
  as: "lesson",
});

// ============================================
// ✅ WordProgress ↔ Vocabulary
// ============================================
WordProgress.belongsTo(Vocabulary, {
  foreignKey: "wordId",
  as: "vocabulary",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Vocabulary.hasMany(WordProgress, {
  foreignKey: "wordId",
  as: "progresses",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ============================================
// User ↔ WordProgress
// ============================================
User.hasMany(WordProgress, {
  foreignKey: "userId",
  as: "userWordProgresses",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
WordProgress.belongsTo(User, {
  foreignKey: "userId",
  as: "wordProgressUser",
});

// ============================================
// User ↔ Exercise
// ============================================
User.hasMany(Exercise, {
  foreignKey: "userId",
  as: "userExercises",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Exercise.belongsTo(User, {
  foreignKey: "userId",
  as: "exerciseOwner",
});

// ============================================
// User ↔ ScenarioSession
// ============================================
User.hasMany(ScenarioSession, {
  foreignKey: "userId",
  as: "userScenarioSessions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ScenarioSession.belongsTo(User, {
  foreignKey: "userId",
  as: "scenarioSessionUser",
});

// ============================================
// Scenario ↔ ScenarioSession
// ============================================
Scenario.hasMany(ScenarioSession, {
  foreignKey: "scenarioId",
  as: "scenarioSessions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ScenarioSession.belongsTo(Scenario, {
  foreignKey: "scenarioId",
  as: "scenario",
});

// ============================================
// User ↔ LessonProgress
// ============================================
User.hasMany(LessonProgress, {
  foreignKey: "userId",
  as: "userLessonProgresses",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
LessonProgress.belongsTo(User, {
  foreignKey: "userId",
  as: "lessonProgressUser",
});

// ============================================
// Lesson ↔ LessonProgress
// ============================================
Lesson.hasMany(LessonProgress, {
  foreignKey: "lessonId",
  as: "lessonProgresses",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
LessonProgress.belongsTo(Lesson, {
  foreignKey: "lessonId",
  as: "progressLesson",
});

// ============================================
// User ↔ UserAchievement
// ============================================
User.hasMany(UserAchievement, {
  foreignKey: "userId",
  as: "userAchievements",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
UserAchievement.belongsTo(User, {
  foreignKey: "userId",
  as: "achievementUser",
});

// ============================================
// Achievement ↔ UserAchievement
// ============================================
Achievement.hasMany(UserAchievement, {
  foreignKey: "achievementId",
  as: "achievementUserAchievements",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
UserAchievement.belongsTo(Achievement, {
  foreignKey: "achievementId",
  as: "userAchievement",
});

// ============================================
// User ↔ AIConversation
// ============================================
User.hasMany(AIConversation, {
  foreignKey: "userId",
  as: "userAIConversations",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
AIConversation.belongsTo(User, {
  foreignKey: "userId",
  as: "aiConversationUser",
});

// ============================================
// User ↔ Mentor
// ============================================
User.hasOne(Mentor, {
  foreignKey: "userId",
  as: "userMentor",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Mentor.belongsTo(User, {
  foreignKey: "userId",
  as: "mentorUser",
});

// ============================================
// Mentor ↔ MentorSession
// ============================================
Mentor.hasMany(MentorSession, {
  foreignKey: "mentorId",
  as: "mentorSessions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
MentorSession.belongsTo(Mentor, {
  foreignKey: "mentorId",
  as: "sessionMentor",
});

// ============================================
// User ↔ MentorSession (as student)
// ============================================
User.hasMany(MentorSession, {
  foreignKey: "studentId",
  as: "userStudentSessions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
MentorSession.belongsTo(User, {
  foreignKey: "studentId",
  as: "studentUser",
});

// ============================================
// User ↔ StoryProgress
// ============================================
User.hasMany(StoryProgress, {
  foreignKey: "userId",
  as: "userStoryProgresses",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
StoryProgress.belongsTo(User, {
  foreignKey: "userId",
  as: "storyProgressUser",
});

// ============================================
// Story ↔ StoryProgress
// ============================================
Story.hasMany(StoryProgress, {
  foreignKey: "storyId",
  as: "storyProgresses",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
StoryProgress.belongsTo(Story, {
  foreignKey: "storyId",
  as: "progressStory",
});

// ============================================
// User ↔ XPHistory
// ============================================
User.hasMany(XPHistory, {
  foreignKey: "userId",
  as: "userXPHistories",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
XPHistory.belongsTo(User, {
  foreignKey: "userId",
  as: "xpHistoryUser",
});

// ============================================
// User ↔ UserRefreshToken
// ============================================
User.hasMany(UserRefreshToken, {
  foreignKey: "userId",
  as: "userRefreshTokens",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
UserRefreshToken.belongsTo(User, {
  foreignKey: "userId",
  as: "refreshTokenUser",
});

// ============================================
// 📤 Named Exports
// ============================================

export {
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
  ScenarioSession,
  XPHistory,
  UserRefreshToken,
  Exercise,
};

export default {
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
  ScenarioSession,
  XPHistory,
  UserRefreshToken,
  Exercise,
};
