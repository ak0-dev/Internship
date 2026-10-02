const asyncHandler = require('../utils/asyncHandler');
const applicationService = require('../services/applicationService');

const applyToJob = asyncHandler(async (req, res) => {
  const application = await applicationService.applyToJob({
    jobId: req.body.jobId,
    candidateId: req.user._id,
    coverLetter: req.body.coverLetter,
  });

  res.status(201).json({
    message: 'Application submitted successfully',
    application,
  });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.getMyApplications(req.user._id);
  res.status(200).json({ applications });
});

const getApplicationsForJob = asyncHandler(async (req, res) => {
  const result = await applicationService.getApplicationsForJob(req.params.jobId, req.user, req.query);
  res.status(200).json(result);
});

const getApplicationById = asyncHandler(async (req, res) => {
  const result = await applicationService.getApplicationById(req.params.id, req.user);
  res.status(200).json(result);
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    req.body.status,
    req.user
  );
  res.status(200).json({
    message: 'Application status updated successfully',
    application,
  });
});

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  getApplicationById,
  updateApplicationStatus,
};
