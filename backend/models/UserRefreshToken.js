/**
 * UserRefreshToken.js
 * Path: backend/models/UserRefreshToken.js
 * Description: User refresh token model for storing hashed refresh tokens
 * Changes:
 * - ✅ New model for secure refresh token storage
 * - ✅ Stores hashed tokens (not plaintext)
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const UserRefreshToken = sequelize.define(
  "UserRefreshToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Hashed refresh token",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_refresh_tokens",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["expires_at"],
      },
      {
        fields: ["is_revoked"],
      },
    ],
  }
);

// ============================================
// 🔗 Associations
// ============================================

UserRefreshToken.associate = (models) => {
  UserRefreshToken.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
};

export default UserRefreshToken;
