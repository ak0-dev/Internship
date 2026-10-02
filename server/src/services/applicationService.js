const mongoose = require('mongoose');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Job = require('../models/Job');
const User = require('../models/User');

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

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const applyToJob = async ({ jobId, candidateId, coverLetter = '' }) => {
  assertValidId(jobId, 'job');

  const job = await Job.findById(jobId);
  if (!job) {
    throw createHttpError('Job not found', 404);
  }
  if (job.status !== 'PUBLISHED') {
    throw createHttpError('Applications are only accepted for published jobs', 400);
  }

  const existingApplication = await Application.findOne({ job: job._id, candidate: candidateId });
  if (existingApplication) {
    throw createHttpError('You have already applied to this job', 409);
  }

  try {
    const application = await Application.create({
      job: job._id,
      candidate: candidateId,
      coverLetter,
    });
    return Application.findById(application._id)
      .populate('job', 'title department location employmentType status');
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError('You have already applied to this job', 409);
    }
    throw error;
  }
};

const getMyApplications = async (candidateId) => {
  return Application.find({ candidate: candidateId })
    .populate('job', 'title department location employmentType status')
    .sort({ createdAt: -1 });
};

const getApplicationsForJob = async (jobId, user, query = {}) => {
  assertValidId(jobId, 'job');

  const job = await Job.findById(jobId).select('title department location createdBy');
  if (!job) {
    throw createHttpError('Job not found', 404);
  }

  if (user.role === 'RECRUITER' && job.createdBy.toString() !== user._id.toString()) {
    throw createHttpError('You do not have permission to view applications for this job', 403);
  }

  const currentPage = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);
  const filter = { job: job._id };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const escapedSearch = escapeRegExp(query.search);
    const matchingCandidates = await User.find({
      role: 'CANDIDATE',
      $or: [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
      ],
    }).select('_id');
    filter.candidate = { $in: matchingCandidates.map((candidate) => candidate._id) };
  }

  const totalApplications = await Application.countDocuments(filter);
  const applications = await Application.find(filter)
    .populate('candidate', 'name email')
    .populate('job', 'title department location')
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * limit)
    .limit(limit);

  return {
    job: {
      _id: job._id,
      title: job.title,
      department: job.department,
      location: job.location,
    },
    applications,
    pagination: {
      currentPage,
      totalPages: Math.ceil(totalApplications / limit),
      totalApplications,
      limit,
    },
  };
};

const getApplicationById = async (applicationId, user) => {
  assertValidId(applicationId, 'application');

  const application = await Application.findById(applicationId)
    .populate('candidate', 'name email')
    .populate('job', 'title department location employmentType status createdBy');

  if (!application) {
    throw createHttpError('Application not found', 404);
  }

  if (
    user.role === 'RECRUITER' &&
    application.job.createdBy.toString() !== user._id.toString()
  ) {
    throw createHttpError('You do not have permission to view this application', 403);
  }

  const interviews = await Interview.find({ application: application._id })
    .select('scheduledAt duration mode meetingLink location notes status createdAt')
    .sort({ scheduledAt: 1 });

  return {
    application,
    interviews,
  };
};

const updateApplicationStatus = async (applicationId, status, user) => {
  assertValidId(applicationId, 'application');

  const application = await Application.findById(applicationId).populate('job', 'createdBy');
  if (!application) {
    throw createHttpError('Application not found', 404);
  }

  if (
    user.role === 'RECRUITER' &&
    application.job.createdBy.toString() !== user._id.toString()
  ) {
    throw createHttpError('You do not have permission to update this application', 403);
  }

  application.status = status;
  await application.save();

  return Application.findById(application._id)
    .populate('candidate', 'name email')
    .populate('job', 'title department location');
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  getApplicationById,
  updateApplicationStatus,
};
