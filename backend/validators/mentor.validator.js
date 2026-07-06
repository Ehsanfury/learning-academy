/**
 * mentor.validator.js
 * Path: backend/validators/mentor.validator.js
 * Description: Validation for mentor endpoints
 */

/**
 * Validate mentor registration data
 */
export const validateMentorRegistration = (body) => {
  const { level, hourlyRate, availableHours, languages, specializations, bio } = body;
  const errors = [];

  // Validate level
  const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  if (!level) {
    errors.push({ field: "level", message: "Level is required" });
  } else if (!validLevels.includes(level.toUpperCase())) {
    errors.push({
      field: "level",
      message: `Level must be one of: ${validLevels.join(", ")}`,
    });
  }

  // Validate hourlyRate
  if (hourlyRate === undefined || hourlyRate === null) {
    errors.push({ field: "hourlyRate", message: "Hourly rate is required" });
  } else if (isNaN(Number(hourlyRate)) || Number(hourlyRate) <= 0) {
    errors.push({ field: "hourlyRate", message: "Hourly rate must be a positive number" });
  }

  // Validate availableHours (optional)
  if (availableHours && typeof availableHours !== "object") {
    errors.push({ field: "availableHours", message: "Available hours must be an object" });
  }

  // Validate languages (optional)
  if (languages && !Array.isArray(languages)) {
    errors.push({ field: "languages", message: "Languages must be an array" });
  }

  // Validate specializations (optional)
  if (specializations && !Array.isArray(specializations)) {
    errors.push({ field: "specializations", message: "Specializations must be an array" });
  }

  // Validate bio (optional)
  if (bio && typeof bio !== "object") {
    errors.push({ field: "bio", message: "Bio must be an object" });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      level: level?.toUpperCase(),
      hourlyRate: Number(hourlyRate),
      availableHours: availableHours || {},
      languages: languages || ["fa", "de"],
      specializations: specializations || [],
      bio: bio || {},
    },
  };
};

/**
 * Validate session booking
 */
export const validateBookSession = (body) => {
  const { startTime, endTime } = body;
  const errors = [];

  if (!startTime) {
    errors.push({ field: "startTime", message: "Start time is required" });
  } else {
    const date = new Date(startTime);
    if (isNaN(date.getTime())) {
      errors.push({ field: "startTime", message: "Invalid start time format" });
    }
  }

  if (!endTime) {
    errors.push({ field: "endTime", message: "End time is required" });
  } else {
    const date = new Date(endTime);
    if (isNaN(date.getTime())) {
      errors.push({ field: "endTime", message: "Invalid end time format" });
    }
  }

  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      errors.push({ field: "endTime", message: "End time must be after start time" });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: { startTime, endTime },
  };
};

/**
 * Validate session status update
 */
export const validateSessionStatus = (body) => {
  const { status } = body;
  const errors = [];

  const validStatuses = ["accepted", "cancelled"];
  if (!status) {
    errors.push({ field: "status", message: "Status is required" });
  } else if (!validStatuses.includes(status)) {
    errors.push({
      field: "status",
      message: `Status must be one of: ${validStatuses.join(", ")}`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: { status },
  };
};

/**
 * Validate session completion (review)
 */
export const validateSessionCompletion = (body) => {
  const { review, rating } = body;
  const errors = [];

  if (!rating) {
    errors.push({ field: "rating", message: "Rating is required" });
  } else if (isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    errors.push({ field: "rating", message: "Rating must be between 1 and 5" });
  }

  if (review && typeof review !== "string") {
    errors.push({ field: "review", message: "Review must be a string" });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      rating: Number(rating),
      review: review || null,
    },
  };
};

export default {
  validateMentorRegistration,
  validateBookSession,
  validateSessionStatus,
  validateSessionCompletion,
};
