/**
 * MentorSession.js
 * German Academy
 Mentoring sessions model
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
      type: DataTypes.UUID,
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
      type: DataTypes.ENUM("pending", "active", "completed", "cancelled"),
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
  },
  {
    tableName: "mentor_sessions",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["mentor_id"],
        name: "idx_sessions_mentor",
      },
      {
        fields: ["student_id"],
        name: "idx_sessions_student",
      },
      {
        fields: ["status"],
        name: "idx_sessions_status",
      },
      {
        fields: ["start_time"],
        name: "idx_sessions_start_time",
      },
    ],
  },
);

export default MentorSession;
