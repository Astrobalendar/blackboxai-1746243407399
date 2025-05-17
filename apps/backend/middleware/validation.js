const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    logger.warn('Validation failed', { errors: errors.array() });
    return res.status(400).json({
      status: 'error',
      error: 'Validation failed',
      details: errors.array()
    });
  };
};

const chartDataValidation = [
  body('dateOfBirth').isISO8601().withMessage('Invalid date format (YYYY-MM-DD)'),
  body('timeOfBirth').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('locationName').isString().notEmpty(),
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 })
];

module.exports = {
  validate,
  chartDataValidation
};
