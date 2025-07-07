import { body, param, query, validationResult } from 'express-validator';

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('voterId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Voter ID must be between 3 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Voter ID must contain only uppercase letters and numbers'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must contain only letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        throw new Error('You must be at least 18 years old to register');
      }
      return true;
    }),
  
  body('phone')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Election creation validation
export const validateElectionCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Candidate validation
export const validateCandidate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('party')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Party must be between 2 and 50 characters'),
  
  body('symbol')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Symbol must be between 1 and 10 characters'),
  
  body('aadharId')
    .trim()
    .matches(/^\d{4}-\d{4}-\d{4}$/)
    .withMessage('Aadhar ID must be in format XXXX-XXXX-XXXX'),
  
  handleValidationErrors
];

// Vote validation
export const validateVote = [
  body('electionId')
    .isMongoId()
    .withMessage('Please provide a valid election ID'),
  
  body('candidateId')
    .notEmpty()
    .withMessage('Candidate ID is required'),
  
  handleValidationErrors
];

// ID parameter validation
export const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid ID'),
  
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
]; 