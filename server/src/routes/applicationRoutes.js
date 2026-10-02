const express = require('express');
const { body, param, query } = require('express-validator');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const applicationController = require('../controllers/applicationController');

const router = express.Router();
const applicationStatuses = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED'];

router.use(protect);

router.post(
  '/',
  authorize('CANDIDATE'),
  [
    body('jobId').isMongoId().withMessage('A valid job ID is required'),
    body('coverLetter').optional({ nullable: true }).isString().withMessage('Cover letter must be text').isLength({ max: 3000 }).withMessage('Cover letter must be 3000 characters or fewer'),
  ],
  validate,
  applicationController.applyToJob
);

router.get('/my', authorize('CANDIDATE'), applicationController.getMyApplications);

router.get(
  '/job/:jobId',
  authorize('ADMIN', 'RECRUITER'),
  [
    param('jobId').isMongoId().withMessage('Invalid job ID'),
    query('status').optional().isIn(applicationStatuses).withMessage('Invalid application status'),
    query('search').optional().trim().isLength({ max: 120 }).withMessage('Search must be 120 characters or fewer'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validate,
  applicationController.getApplicationsForJob
);

router.get(
  '/:id',
  authorize('ADMIN', 'RECRUITER'),
  param('id').isMongoId().withMessage('Invalid application ID'),
  validate,
  applicationController.getApplicationById
);

router.patch(
  '/:id/status',
  authorize('ADMIN', 'RECRUITER'),
  [
    param('id').isMongoId().withMessage('Invalid application ID'),
    body('status').isIn(applicationStatuses).withMessage('Invalid application status'),
  ],
  validate,
  applicationController.updateApplicationStatus
);

module.exports = router;
