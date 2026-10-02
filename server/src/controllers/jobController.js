const asyncHandler = require('../utils/asyncHandler');
const jobService = require('../services/jobService');

const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(req.body, req.user);
  res.status(201).json({ job });
});

const listJobs = asyncHandler(async (req, res) => {
  const result = await jobService.listJobs(req.query, req.user);
  res.status(200).json(result);
});

const getJob = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id, req.user);
  res.status(200).json({ job });
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.body, req.user);
  res.status(200).json({ job });
});

const deleteJob = asyncHandler(async (req, res) => {
  await jobService.deleteJob(req.params.id, req.user);
  res.status(200).json({ message: 'Job deleted successfully' });
});

const publishJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJobStatus(req.params.id, 'PUBLISHED', req.user);
  res.status(200).json({ job });
});

const closeJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJobStatus(req.params.id, 'CLOSED', req.user);
  res.status(200).json({ job });
});

module.exports = {
  createJob,
  listJobs,
  getJob,
  updateJob,
  deleteJob,
  publishJob,
  closeJob,
};
