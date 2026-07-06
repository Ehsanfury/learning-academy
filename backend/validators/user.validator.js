/**
 * user.validator.js
 * Path: backend/validators/user.validator.js
 * Description: Validation for users
 * Changes:
 * - Standardized error format
 * - Added detailed error messages
 * - Added validateUserData
 */

const VALID_LANGUAGES = ["fa", "en", "de", "ar", "tr", "ru"];
const VALID_GOALS = ["migration", "exam", "ausbildung", "university", "work", "general"];

/**
 * Validate user ID
 * @param {string} userId - User ID
 * @returns {Object} - { valid, errors }
 */
export const validateUserId = (userId) => {
  const errors = [];

  if (!userId) {
    errors.push({ field: "userId", message: "User ID is required" });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate update profile data
 * @param {Object} body - Request body
 * @returns {Object} - { valid, errors, data }
 */
export const validateUpdateProfile = (body) => {
  const {
    name,
    username,
    firstName,
    lastName,
    avatar,
    bio,
    language,
    nativeLanguage,
    learningGoal,
    dailyGoal,
    soundEnabled,
    notifications,
    streakReminder,
    autoPlayAudio,
  } = body;
  const errors = [];

  // Validate name (optional)
  if (name !== undefined && name !== null && name !== "") {
    if (typeof name !== "string") {
      errors.push({ field: "name", message: "Name must be a string" });
    } else if (name.trim().length < 2) {
      errors.push({ field: "name", message: "Name must be at least 2 characters" });
    } else if (name.trim().length > 100) {
      errors.push({ field: "name", message: "Name must be less than 100 characters" });
    }
  }

  // Validate username (optional)
  if (username !== undefined && username !== null && username !== "") {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      errors.push({
        field: "username",
        message:
          "Username must be 3-30 characters and contain only letters, numbers, and underscore",
      });
    }
  }

  // Validate firstName (optional)
  if (firstName !== undefined && firstName !== null && firstName !== "") {
    if (typeof firstName !== "string") {
      errors.push({ field: "firstName", message: "First name must be a string" });
    } else if (firstName.trim().length > 50) {
      errors.push({ field: "firstName", message: "First name must be less than 50 characters" });
    }
  }

  // Validate lastName (optional)
  if (lastName !== undefined && lastName !== null && lastName !== "") {
    if (typeof lastName !== "string") {
      errors.push({ field: "lastName", message: "Last name must be a string" });
    } else if (lastName.trim().length > 50) {
      errors.push({ field: "lastName", message: "Last name must be less than 50 characters" });
    }
  }

  // Validate avatar (optional)
  if (avatar !== undefined && avatar !== null && avatar !== "") {
    if (typeof avatar !== "string") {
      errors.push({ field: "avatar", message: "Avatar must be a string" });
    } else if (avatar.length > 500) {
      errors.push({ field: "avatar", message: "Avatar URL must be less than 500 characters" });
    }
  }

  // Validate bio (optional)
  if (bio !== undefined && bio !== null && bio !== "") {
    if (typeof bio !== "string") {
      errors.push({ field: "bio", message: "Bio must be a string" });
    } else if (bio.length > 500) {
      errors.push({ field: "bio", message: "Bio must be less than 500 characters" });
    }
  }

  // Validate language (optional)
  if (language !== undefined && language !== null && language !== "") {
    if (typeof language !== "string") {
      errors.push({ field: "language", message: "Language must be a string" });
    }
  }

  // Validate native language (optional)
  if (nativeLanguage !== undefined && nativeLanguage !== null && nativeLanguage !== "") {
    if (!VALID_LANGUAGES.includes(nativeLanguage)) {
      errors.push({
        field: "nativeLanguage",
        message: `Native language must be one of: ${VALID_LANGUAGES.join(", ")}`,
      });
    }
  }

  // Validate learning goal (optional)
  if (learningGoal !== undefined && learningGoal !== null && learningGoal !== "") {
    if (!VALID_GOALS.includes(learningGoal)) {
      errors.push({
        field: "learningGoal",
        message: `Learning goal must be one of: ${VALID_GOALS.join(", ")}`,
      });
    }
  }

  // Validate daily goal (optional)
  if (dailyGoal !== undefined) {
    const numericGoal = Number(dailyGoal);
    if (isNaN(numericGoal) || numericGoal < 1 || numericGoal > 1000) {
      errors.push({ field: "dailyGoal", message: "Daily goal must be between 1 and 1000" });
    }
  }

  // Validate boolean settings (optional)
  const booleanFields = [
    { field: "soundEnabled", value: soundEnabled },
    { field: "notifications", value: notifications },
    { field: "streakReminder", value: streakReminder },
    { field: "autoPlayAudio", value: autoPlayAudio },
  ];

  for (const { field, value } of booleanFields) {
    if (value !== undefined && value !== null && typeof value !== "boolean") {
      errors.push({ field, message: `${field} must be a boolean` });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      name: name?.trim(),
      username: username?.trim(),
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      avatar: avatar?.trim(),
      bio: bio?.trim(),
      language,
      nativeLanguage,
      learningGoal,
      dailyGoal: dailyGoal !== undefined ? Number(dailyGoal) : undefined,
      soundEnabled,
      notifications,
      streakReminder,
      autoPlayAudio,
    },
  };
};

/**
 * Validate change password data
 * @param {Object} body - Request body
 * @returns {Object} - { valid, errors, data }
 */
export const validateChangePassword = (body) => {
  const { currentPassword, newPassword } = body;
  const errors = [];

  if (!currentPassword) {
    errors.push({ field: "currentPassword", message: "Current password is required" });
  }

  if (!newPassword) {
    errors.push({ field: "newPassword", message: "New password is required" });
  } else if (newPassword.length < 8) {
    errors.push({ field: "newPassword", message: "New password must be at least 8 characters" });
  } else if (!/[A-Z]/.test(newPassword)) {
    errors.push({
      field: "newPassword",
      message: "New password must contain at least one uppercase letter",
    });
  } else if (!/[a-z]/.test(newPassword)) {
    errors.push({
      field: "newPassword",
      message: "New password must contain at least one lowercase letter",
    });
  } else if (!/[0-9]/.test(newPassword)) {
    errors.push({ field: "newPassword", message: "New password must contain at least one number" });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      currentPassword,
      newPassword,
    },
  };
};

/**
 * Validate user data for create/update
 * @param {Object} body - Request body
 * @returns {Object} - { valid, errors, data }
 */
export const validateUserData = (body) => {
  const { name, email, password, username, role } = body;
  const errors = [];

  // Validate name
  if (!name) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters" });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!emailRegex.test(email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  // Validate password (optional for update)
  if (password !== undefined) {
    if (password.length < 8) {
      errors.push({ field: "password", message: "Password must be at least 8 characters" });
    }
  }

  // Validate username (optional)
  if (username !== undefined && username !== null && username !== "") {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      errors.push({
        field: "username",
        message:
          "Username must be 3-30 characters and contain only letters, numbers, and underscore",
      });
    }
  }

  // Validate role (optional)
  if (role !== undefined && !["user", "admin"].includes(role)) {
    errors.push({ field: "role", message: "Role must be 'user' or 'admin'" });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      name: name?.trim(),
      email: email?.toLowerCase().trim(),
      password,
      username: username?.trim(),
      role,
    },
  };
};

export default {
  validateUserId,
  validateUpdateProfile,
  validateChangePassword,
  validateUserData,
  VALID_LANGUAGES,
  VALID_GOALS,
};
