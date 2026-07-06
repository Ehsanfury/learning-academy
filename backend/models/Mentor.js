/**
 * Mentor.js
 * Path: backend/models/Mentor.js
 * Description: Mentor model for mentors who teach
 * Changes:
 * - ✅ FIXED: Proper JSONB defaults with Sequelize.literal
 * - ✅ FIXED: Added indexes for performance
 * - ✅ FIXED: Removed TODO comments
 */

import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/db.js";

const Mentor = sequelize.define(
  "Mentor",
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
    level: {
      type: DataTypes.ENUM("A1", "A2", "B1", "B2", "C1", "C2"),
      allowNull: false,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "hourly_rate",
      defaultValue: 15.0,
      validate: {
        min: 0,
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_verified",
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    totalStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "total_students",
    },
    availableHours: {
      type: DataTypes.JSONB,
      defaultValue: Sequelize.literal("'{}'::jsonb"),
      field: "available_hours",
    },
    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING(20)),
      defaultValue: ["fa", "de"],
    },
    specializations: {
      type: DataTypes.ARRAY(DataTypes.STRING(50)),
      defaultValue: [],
    },
    bio: {
      type: DataTypes.JSONB,
      defaultValue: Sequelize.literal("'{}'::jsonb"),
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "mentors",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id"],
        name: "idx_mentors_user",
      },
      {
        fields: ["level"],
        name: "idx_mentors_level",
      },
      {
        fields: ["is_active"],
        name: "idx_mentors_active",
      },
    ],
  }
);

export default Mentor;
