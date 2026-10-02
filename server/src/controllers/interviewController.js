const asyncHandler = require('../utils/asyncHandler');
const interviewService = require('../services/interviewService');

const createInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.createInterview(req.body, req.user);
  res.status(201).json({ interview });
});

const getMyInterviews = asyncHandler(async (req, res) => {
  const interviews = await interviewService.getMyInterviews(req.user._id);
  res.status(200).json({ interviews });
});

const getInterviewsForJob = asyncHandler(async (req, res) => {
  const result = await interviewService.getInterviewsForJob(req.params.jobId, req.user);
  res.status(200).json(result);
});

const updateInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.updateInterview(req.params.id, req.body, req.user);
  res.status(200).json({ interview });
});

const cancelInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.cancelInterview(req.params.id, req.user);
  res.status(200).json({ interview });
});

module.exports = {
  createInterview,
  getMyInterviews,
  getInterviewsForJob,
  updateInterview,
  cancelInterview,
};
