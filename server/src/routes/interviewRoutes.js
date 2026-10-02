const express = require('express');
const { body, param } = require('express-validator');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const interviewController = require('../controllers/interviewController');

const router = express.Router();
const interviewModes = ['ONLINE', 'IN_PERSON'];
const editableFields = ['scheduledAt', 'duration', 'mode', 'meetingLink', 'location', 'notes'];

const validateCreateFields = [
  body('application').isMongoId().withMessage('A valid application ID is required'),
  body('scheduledAt')
    .isISO8601()
    .withMessage('A valid interview date and time are required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Interview must be scheduled for a future date');
      }
      return true;
    }),
  body('duration').isFloat({ gt: 0 }).withMessage('Interview duration must be positive'),
  body('mode').isIn(interviewModes).withMessage('Invalid interview mode'),
  body('meetingLink').optional().isString().withMessage('Meeting link must be text'),
  body('location').optional().isString().withMessage('Location must be text'),
  body('notes').optional().isString().withMessage('Notes must be text').isLength({ max: 2000 }).withMessage('Notes must be 2000 characters or fewer'),
  body().custom((value) => {
    if (value.mode === 'ONLINE' && !value.meetingLink?.trim()) {
      throw new Error('Meeting link is required for online interviews');
    }
    if (value.mode === 'IN_PERSON' && !value.location?.trim()) {
      throw new Error('Location is required for in-person interviews');
    }
    return true;
  }),
];

const validateUpdateFields = [
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('A valid interview date and time are required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Interview must be scheduled for a future date');
      }
      return true;
    }),
  body('duration').optional().isFloat({ gt: 0 }).withMessage('Interview duration must be positive'),
  body('mode').optional().isIn(interviewModes).withMessage('Invalid interview mode'),
  body('meetingLink').optional().isString().withMessage('Meeting link must be text'),
  body('location').optional().isString().withMessage('Location must be text'),
  body('notes').optional().isString().withMessage('Notes must be text').isLength({ max: 2000 }).withMessage('Notes must be 2000 characters or fewer'),
];

const validateInterviewUpdate = [
  body().custom((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Request body must be an object');
    }
    if (!Object.keys(value).length) {
      throw new Error('Provide at least one interview field to update');
    }
    if (Object.keys(value).some((field) => !editableFields.includes(field))) {
      throw new Error('Request contains unsupported interview fields');
    }
    return true;
  }),
];

router.use(protect);

router.post(
  '/',
  authorize('ADMIN', 'RECRUITER'),
  validateCreateFields,
  validate,
  interviewController.createInterview
);

router.get('/my', authorize('CANDIDATE'), interviewController.getMyInterviews);

router.get(
  '/job/:jobId',
  authorize('ADMIN', 'RECRUITER'),
  param('jobId').isMongoId().withMessage('Invalid job ID'),
  validate,
  interviewController.getInterviewsForJob
);

router.put(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  param('id').isMongoId().withMessage('Invalid interview ID'),
  validateUpdateFields,
  validateInterviewUpdate,
  validate,
  interviewController.updateInterview
);

router.patch(
  '/:id/cancel',
  authorize('ADMIN', 'RECRUITER'),
  param('id').isMongoId().withMessage('Invalid interview ID'),
  validate,
  interviewController.cancelInterview
);

module.exports = router;
