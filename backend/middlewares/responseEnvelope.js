/**
 * responseEnvelope.js
 * Path: backend/middlewares/responseEnvelope.js
 * Description: Standardized API response wrapper
 * Changes:
 * - ✅ FIXED: Converted to ES Modules (export default)
 */

/**
 * Send success response
 */
export const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send error response
 */
export const sendError = (res, message = "Error", statusCode = 500, errors = null) => {
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
 * Send paginated response
 */
export const setPagination = (res, data, total, limit, offset, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
      currentPage: Math.floor(offset / limit) + 1,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send response with metadata
 */
export const setMetadata = (res, data, metadata = {}, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    metadata,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Main response envelope function
 */
const responseEnvelope = {
  sendSuccess,
  sendError,
  setPagination,
  setMetadata,
};

export default responseEnvelope;
