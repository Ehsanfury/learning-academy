/**
 * UserAchievement.js
 * German Academy
 * User-Achievement relation model
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const UserAchievement = sequelize.define(
  "UserAchievement",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },

    achievementId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "achievement_id",
    },

    // Achievement earned time
    earnedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "earned_at",
    },

    // Has the user viewed this achievement?
    isViewed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_viewed",
    },
  },
  {
    tableName: "user_achievements",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "achievement_id"],
        name: "unique_user_achievement",
      },
      {
        fields: ["user_id", "earned_at"],
        name: "idx_user_earned_at",
      },
      {
        fields: ["is_viewed"],
        name: "idx_is_viewed",
      },
    ],
  }
);

// ============================================
// 📚 Static Methods
// ============================================

/**
 * Get all achievements for a user
 */
UserAchievement.findByUser = async function (userId) {
  return this.findAll({
    where: { userId },
    order: [["earnedAt", "DESC"]],
    include: [
      {
        association: "achievement",
      },
    ],
  });
};

/**
 * Get unviewed achievements for a user
 */
UserAchievement.findUnviewedByUser = async function (userId) {
  return this.findAll({
    where: {
      userId,
      isViewed: false,
    },
    include: [
      {
        association: "achievement",
      },
    ],
  });
};

/**
 * Mark achievement as viewed
 */
UserAchievement.markAsViewed = async function (userId, achievementId) {
  return this.update(
    { isViewed: true },
    {
      where: {
        userId,
        achievementId,
      },
    }
  );
};

/**
 * Count achievements for a user
 */
UserAchievement.countByUser = async function (userId) {
  return this.count({
    where: { userId },
  });
};

export default UserAchievement;
