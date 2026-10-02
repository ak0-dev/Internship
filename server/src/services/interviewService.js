const mongoose = require('mongoose');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Job = require('../models/Job');

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertValidId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(`Invalid ${label} ID`, 400);
  }
};

const getApplicationForManager = async (applicationId, user) => {
  assertValidId(applicationId, 'application');
  const application = await Application.findById(applicationId).populate('job', 'title createdBy');

  if (!application) {
    throw createHttpError('Application not found', 404);
  }

  if (
    user.role === 'RECRUITER' &&
    application.job.createdBy.toString() !== user._id.toString()
  ) {
    throw createHttpError('You do not have permission to manage this application', 403);
  }

  return application;
};

const getInterviewForManager = async (interviewId, user) => {
  assertValidId(interviewId, 'interview');
  const interview = await Interview.findById(interviewId)
    .populate({
      path: 'application',
      select: 'candidate job',
      populate: [
        { path: 'candidate', select: 'name email' },
        { path: 'job', select: 'title department location createdBy' },
      ],
    });

  if (!interview) {
    throw createHttpError('Interview not found', 404);
  }

  if (
    user.role === 'RECRUITER' &&
    interview.application.job.createdBy.toString() !== user._id.toString()
  ) {
    throw createHttpError('You do not have permission to manage this interview', 403);
  }

  return interview;
};

const validateSchedule = ({ scheduledAt, duration, mode, meetingLink, location }, { requireFuture }) => {
  const date = new Date(scheduledAt);

  if (Number.isNaN(date.getTime())) {
    throw createHttpError('A valid interview date and time are required', 400);
  }
  if (requireFuture && date <= new Date()) {
    throw createHttpError('Interview must be scheduled for a future date', 400);
  }
  if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) {
    throw createHttpError('Interview duration must be positive', 400);
  }
  if (mode === 'ONLINE' && !meetingLink?.trim()) {
    throw createHttpError('Meeting link is required for online interviews', 400);
  }
  if (mode === 'IN_PERSON' && !location?.trim()) {
    throw createHttpError('Location is required for in-person interviews', 400);
  }
};

const populateInterview = (interviewQuery) => interviewQuery
  .populate({
    path: 'application',
    select: 'candidate job status',
    populate: [
      { path: 'candidate', select: 'name email' },
      { path: 'job', select: 'title department location createdBy' },
    ],
  })
  .populate('scheduledBy', 'name email');

const createInterview = async (input, user) => {
  const application = await getApplicationForManager(input.application, user);
  validateSchedule(input, { requireFuture: true });

  const interview = await Interview.create({
    ...input,
    scheduledAt: new Date(input.scheduledAt),
    application: application._id,
    scheduledBy: user._id,
  });

  return populateInterview(Interview.findById(interview._id));
};

const getMyInterviews = async (candidateId) => {
  const applications = await Application.find({ candidate: candidateId }).select('_id');
  return populateInterview(
    Interview.find({ application: { $in: applications.map((application) => application._id) } })
      .sort({ scheduledAt: 1 })
  );
};

const getInterviewsForJob = async (jobId, user) => {
  assertValidId(jobId, 'job');
  const job = await Job.findById(jobId).select('title createdBy');

  if (!job) {
    throw createHttpError('Job not found', 404);
  }
  if (user.role === 'RECRUITER' && job.createdBy.toString() !== user._id.toString()) {
    throw createHttpError('You do not have permission to view interviews for this job', 403);
  }

  const applications = await Application.find({ job: job._id }).select('_id');
  const interviews = await populateInterview(
    Interview.find({ application: { $in: applications.map((application) => application._id) } })
      .sort({ scheduledAt: 1 })
  );

  return {
    job: { _id: job._id, title: job.title },
    interviews,
  };
};

const updateInterview = async (interviewId, input, user) => {
  const interview = await getInterviewForManager(interviewId, user);
  const updatedSchedule = {
    scheduledAt: input.scheduledAt ?? interview.scheduledAt,
    duration: input.duration ?? interview.duration,
    mode: input.mode ?? interview.mode,
    meetingLink: input.meetingLink ?? interview.meetingLink,
    location: input.location ?? interview.location,
  };

  validateSchedule(updatedSchedule, {
    requireFuture: Object.prototype.hasOwnProperty.call(input, 'scheduledAt'),
  });

  Object.assign(interview, input);
  if (input.scheduledAt) interview.scheduledAt = new Date(input.scheduledAt);
  await interview.save();

  return populateInterview(Interview.findById(interview._id));
};

const cancelInterview = async (interviewId, user) => {
  const interview = await getInterviewForManager(interviewId, user);

  if (interview.status === 'CANCELLED') {
    throw createHttpError('Interview is already cancelled', 400);
  }

  interview.status = 'CANCELLED';
  await interview.save();
  return populateInterview(Interview.findById(interview._id));
};

module.exports = {
  createInterview,
  getMyInterviews,
  getInterviewsForJob,
  updateInterview,
  cancelInterview,
};
