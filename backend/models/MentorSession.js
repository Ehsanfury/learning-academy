/**
 * MentorSession.js
 * Path: backend/models/MentorSession.js
 * Description: Mentor session model
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const MentorSession = sequelize.define(
  "MentorSession",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    mentorId: {
      type: DataTypes.STRING(50), // ✅ Changed from UUID to STRING(50)
      allowNull: false,
      field: "mentor_id",
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "student_id",
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "start_time",
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "end_time",
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "completed", "cancelled"),
      defaultValue: "pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "refunded", "held"),
      defaultValue: "pending",
      field: "payment_status",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "mentor_sessions",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["mentor_id"],
        name: "idx_mentor_sessions_mentor",
      },
      {
        fields: ["student_id"],
        name: "idx_mentor_sessions_student",
      },
      {
        fields: ["status"],
        name: "idx_mentor_sessions_status",
      },
    ],
  }
);

export default MentorSession;
