const express = require('express');
const { body, param, query } = require('express-validator');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const jobController = require('../controllers/jobController');

const router = express.Router();
const employmentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];
const jobStatuses = ['DRAFT', 'PUBLISHED', 'CLOSED'];

const validateJobFields = [
  body('title').trim().notEmpty().withMessage('Job title is required').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Job description is required').isLength({ max: 10000 }),
  body('department').trim().notEmpty().withMessage('Department is required').isLength({ max: 100 }),
  body('location').trim().notEmpty().withMessage('Location is required').isLength({ max: 120 }),
  body('employmentType').isIn(employmentTypes).withMessage('Invalid employment type'),
  body('experienceRequired').isFloat({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('salaryRange').optional().isObject().withMessage('Salary range must be an object'),
  body('salaryRange.min').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Minimum salary must be zero or greater'),
  body('salaryRange.max').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Maximum salary must be zero or greater'),
  body('salaryRange.currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('skills.*').optional().isString().trim().notEmpty().withMessage('Skills must be non-empty strings'),
];
const validateJobUpdateFields = [
  body('title').optional().isString().trim().notEmpty().withMessage('Job title cannot be empty').isLength({ max: 120 }).withMessage('Job title must be 120 characters or fewer'),
  body('description').optional().isString().trim().notEmpty().withMessage('Job description cannot be empty').isLength({ max: 10000 }).withMessage('Job description must be 10000 characters or fewer'),
  body('department').optional().isString().trim().notEmpty().withMessage('Department cannot be empty').isLength({ max: 100 }).withMessage('Department must be 100 characters or fewer'),
  body('location').optional().isString().trim().notEmpty().withMessage('Location cannot be empty').isLength({ max: 120 }).withMessage('Location must be 120 characters or fewer'),
  body('employmentType').optional().isIn(employmentTypes).withMessage('Invalid employment type'),
  body('experienceRequired').optional().isFloat({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('salaryRange').optional().custom((range) => {
    if (!range || typeof range !== 'object' || Array.isArray(range)) {
      throw new Error('Salary range must be an object');
    }
    return true;
  }),
  body('salaryRange.min').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Minimum salary must be zero or greater'),
  body('salaryRange.max').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Maximum salary must be zero or greater'),
  body('salaryRange.currency').optional().isString().matches(/^[A-Za-z]{3}$/).withMessage('Currency must be a 3-letter code'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('skills.*').optional().isString().trim().notEmpty().withMessage('Skills must be non-empty strings'),
];
const validateJobUpdate = [
  body().custom((value) => {
    const allowedFields = [
      'title',
      'description',
      'department',
      'location',
      'employmentType',
      'experienceRequired',
      'salaryRange',
      'skills',
    ];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Request body must be an object');
    }

    if (Object.keys(value).some((field) => !allowedFields.includes(field))) {
      throw new Error('Request contains unsupported job fields');
    }

    if (!allowedFields.some((field) => Object.prototype.hasOwnProperty.call(value, field))) {
      throw new Error('Provide at least one job field to update');
    }

    return true;
  }),
  body('salaryRange').optional().custom((range) => {
    if (range.min != null && range.max != null && Number(range.min) > Number(range.max)) {
      throw new Error('Salary minimum cannot exceed salary maximum');
    }
    return true;
  }),
];

const validateJobId = [
  param('id').isMongoId().withMessage('Invalid job ID'),
];

router.use(protect);

router.post(
  '/',
  authorize('ADMIN', 'RECRUITER'),
  validateJobFields,
  validate,
  jobController.createJob
);

router.get(
  '/',
  [
    query('search').optional().trim().isLength({ max: 120 }).withMessage('Search must be 120 characters or fewer'),
    query('location').optional().trim().isLength({ max: 120 }).withMessage('Location filter is too long'),
    query('department').optional().trim().isLength({ max: 100 }).withMessage('Department filter is too long'),
    query('employmentType').optional().isIn(employmentTypes).withMessage('Invalid employment type'),
    query('status').optional().isIn(jobStatuses).withMessage('Invalid job status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validate,
  jobController.listJobs
);

router.get('/:id', validateJobId, validate, jobController.getJob);

router.put(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  validateJobId,
  validateJobUpdateFields,
  validateJobUpdate,
  validate,
  jobController.updateJob
);

router.delete('/:id', authorize('ADMIN', 'RECRUITER'), validateJobId, validate, jobController.deleteJob);
router.patch('/:id/publish', authorize('ADMIN', 'RECRUITER'), validateJobId, validate, jobController.publishJob);
router.patch('/:id/close', authorize('ADMIN', 'RECRUITER'), validateJobId, validate, jobController.closeJob);

module.exports = router;
