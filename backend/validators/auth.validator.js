/**
 * auth.validator.js
 * Path: backend/validators/auth.validator.js
 * Description: Validation for authentication
 * Changes:
 * - M22: Fixed validation response to include proper message field
 * - Added standardized error format
 */

/**
 * Check if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if password is strong
 */
export const isStrongPassword = (password) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUppercase && hasLowercase && hasNumber;
};

/**
 * ✅ M22: Standardized validation response
 */
const createValidationResponse = (errors, data = {}) => {
  return {
    valid: errors.length === 0,
    errors,
    message: errors.length > 0 ? errors.map((e) => e.message).join(", ") : "Validation passed",
    data,
  };
};

/**
 * Validate registration data
 */
export const validateRegister = (body) => {
  const { name, email, password, username, nativeLanguage, learningGoal } = body;
  const errors = [];

  // Validate name
  if (!name) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters" });
  } else if (name.trim().length > 100) {
    errors.push({ field: "name", message: "Name must be less than 100 characters" });
  }

  // Validate username (optional but if provided, must be valid)
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

  // Validate email
  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  // Validate password
  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters" });
  } else if (!isStrongPassword(password)) {
    errors.push({
      field: "password",
      message: "Password must contain uppercase, lowercase, and number",
    });
  }

  // Validate native language (optional)
  if (nativeLanguage !== undefined && nativeLanguage !== null && nativeLanguage !== "") {
    const validLanguages = ["fa", "en", "de", "ar", "tr", "ru"];
    if (!validLanguages.includes(nativeLanguage)) {
      errors.push({
        field: "nativeLanguage",
        message: `Native language must be one of: ${validLanguages.join(", ")}`,
      });
    }
  }

  // Validate learning goal (optional)
  if (learningGoal !== undefined && learningGoal !== null && learningGoal !== "") {
    const validGoals = ["migration", "exam", "ausbildung", "university", "work", "general"];
    if (!validGoals.includes(learningGoal)) {
      errors.push({
        field: "learningGoal",
        message: `Learning goal must be one of: ${validGoals.join(", ")}`,
      });
    }
  }

  return createValidationResponse(errors, {
    name: name?.trim(),
    username: username?.trim(),
    email: email?.toLowerCase().trim(),
    password,
    nativeLanguage: nativeLanguage || "fa",
    learningGoal: learningGoal || "general",
  });
};

/**
 * Validate login data
 */
export const validateLogin = (body) => {
  const { email, password } = body;
  const errors = [];

  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  }

  return createValidationResponse(errors, {
    email: email?.toLowerCase().trim(),
    password,
  });
};

/**
 * Validate refresh token
 */
export const validateRefreshToken = (body) => {
  const { refreshToken } = body;
  const errors = [];

  if (!refreshToken) {
    errors.push({ field: "refreshToken", message: "Refresh token is required" });
  }

  return createValidationResponse(errors, { refreshToken });
};

/**
 * Validate forgot password request
 */
export const validateForgotPassword = (body) => {
  const { email } = body;
  const errors = [];

  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  return createValidationResponse(errors, {
    email: email?.toLowerCase().trim(),
  });
};

/**
 * Validate reset password
 */
export const validateResetPassword = (body) => {
  const { token, password } = body;
  const errors = [];

  if (!token) {
    errors.push({ field: "token", message: "Reset token is required" });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters" });
  }

  return createValidationResponse(errors, { token, password });
};

export default {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
  isValidEmail,
  isStrongPassword,
};
