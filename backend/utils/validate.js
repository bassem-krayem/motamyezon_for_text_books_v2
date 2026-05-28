import AppError from './appError.js';

const validate = (schema) => (req, res, next) => {
  // 1. Gather all request data pools
  const dataToValidate = {
    body: req.body,
    query: req.query,
    params: req.params,
    files: req.files,
  };

  // 2. Validate against Joi Schema
  // abortEarly: false collects all errors; stripUnknown: true drops unvalidated extra fields
  const { error, value } = schema.validate(dataToValidate, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    // Joi groups errors in an array called details. We extract and join them cleanly.
    const errorMessage = error.details
      .map((detail) => {
        // detail.path looks like ['body', 'firstName']. We remove 'body' for cleaner messages.
        const fieldName =
          detail.path.slice(1).join('.') || detail.path.join('.');
        return `${fieldName}: ${detail.message.replace(/"/g, '')}`;
      })
      .join(', ');

    return next(new AppError(errorMessage, 400));
  }

  // 3. Reassign sanitized, type-casted values back to the request
  req.body = value.body || {};
  req.query = value.query || {};
  req.params = value.params || {};
  req.files = value.files || {};

  next();
};

export default validate;
