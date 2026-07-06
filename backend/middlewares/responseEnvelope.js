/**
 * responseEnvelope.js
 * Path: backend/middlewares/responseEnvelope.js
 * Description: Response envelope middleware for consistent API responses
 * Version: 5.0 - Fixed all TypeScript errors
 */

/**
 * Response Envelope Middleware
 * Wraps all successful responses in a consistent format
 */
const responseEnvelope = (req, res, next) => {
  // Store the original json method
  const originalJson = res.json;

  /**
   * Override json method to wrap responses
   */
  res.json = function (data) {
    // If response is already in our format, pass through
    if (data && typeof data === "object" && data.success !== undefined) {
      return originalJson.call(this, data);
    }

    // Build envelope
    const envelope = {
      success: true,
      data: data || null,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    };

    // Add pagination if available
    if (res.pagination) {
      envelope.pagination = res.pagination;
    }

    // Add metadata if available
    if (res.metadata) {
      envelope.metadata = res.metadata;
    }

    // Add request ID if available
    if (req.id) {
      envelope.requestId = req.id;
    }

    // Call original json with envelope
    return originalJson.call(this, envelope);
  };

  next();
};

/**
 * Helper function to set pagination on response
 */
function setPagination(res, pagination) {
  res.pagination = {
    total: pagination.total || 0,
    limit: pagination.limit || 20,
    offset: pagination.offset || 0,
    page: pagination.page || 1,
    totalPages: pagination.totalPages || 1,
  };
}

/**
 * Helper function to set metadata on response
 */
function setMetadata(res, metadata) {
  res.metadata = Object.assign({}, res.metadata, metadata);
}

/**
 * Helper function to send error response
 */
function sendError(res, error) {
  var statusCode = error.statusCode || error.status || 500;
  var message = error.message || "Internal Server Error";
  var code = error.code || "INTERNAL_SERVER_ERROR";
  var details = error.details || null;

  var response = {
    success: false,
    error: {
      code: code,
      message: message,
    },
    timestamp: new Date().toISOString(),
    path: (res.req && res.req.path) || "/",
    method: (res.req && res.req.method) || "GET",
  };

  if (details) {
    response.error.details = details;
  }

  if (process.env.NODE_ENV === "development" && error.stack) {
    response.error.stack = error.stack;
  }

  return res.status(statusCode).json(response);
}

/**
 * Helper function to send success response
 */
function sendSuccess(res, data, options) {
  options = options || {};

  if (options.pagination) {
    setPagination(res, options.pagination);
  }

  if (options.metadata) {
    setMetadata(res, options.metadata);
  }

  return res.json(data);
}

// Export functions
module.exports = responseEnvelope;
module.exports.setPagination = setPagination;
module.exports.setMetadata = setMetadata;
module.exports.sendError = sendError;
module.exports.sendSuccess = sendSuccess;
