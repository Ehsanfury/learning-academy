/**
 * response.js
 * Path: backend/utils/response.js
 * Description: Standardized API response helpers
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const success = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination info
 * @param {number} pagination.page - Current page
 * @param {number} pagination.limit - Items per page
 * @param {number} pagination.total - Total items
 * @param {number} pagination.totalPages - Total pages
 * @param {string} message - Success message
 */
export const paginated = (
  res,
  data,
  { page = 1, limit = 20, total = 0, totalPages = 1 },
  message = "Success"
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages: parseInt(totalPages),
      },
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} errors - Additional error details
 */
export const error = (res, message = "Error", statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {*} data - Created data
 * @param {string} message - Success message
 */
export const created = (res, data, message = "Created successfully") => {
  return success(res, data, message, 201);
};

/**
 * Send no content response
 * @param {Object} res - Express response object
 */
export const noContent = (res) => {
  return res.status(204).send();
};

/**
 * Send bad request response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} errors - Additional error details
 */
export const badRequest = (res, message = "Bad request", errors = null) => {
  return error(res, message, 400, errors);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const unauthorized = (res, message = "Unauthorized") => {
  return error(res, message, 401);
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const forbidden = (res, message = "Forbidden") => {
  return error(res, message, 403);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const notFound = (res, message = "Not found") => {
  return error(res, message, 404);
};

/**
 * Send conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const conflict = (res, message = "Conflict") => {
  return error(res, message, 409);
};

export default {
  success,
  paginated,
  error,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
};
