const mongoose = require('mongoose');
const Job = require('../models/Job');

const editableFields = [
  'title',
  'description',
  'department',
  'location',
  'employmentType',
  'experienceRequired',
  'salaryRange',
  'skills',
];

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getJobScope = (user) => (
  user.role === 'RECRUITER' ? { createdBy: user._id } : {}
);

const assertValidJobId = (jobId) => {
  if (!mongoose.isValidObjectId(jobId)) {
    throw createHttpError('Invalid job ID', 400);
  }
};

const findJobForUser = async (jobId, user) => {
  assertValidJobId(jobId);

  const job = await Job.findById(jobId).populate('createdBy', 'name email');

  if (!job) {
    throw createHttpError('Job not found', 404);
  }

  if (user.role === 'CANDIDATE') {
    if (job.status !== 'PUBLISHED') {
      throw createHttpError('Job not found', 404);
    }
    return job;
  }

  if (user.role === 'RECRUITER' && job.createdBy._id.toString() !== user._id.toString()) {
    throw createHttpError('You do not have permission to access this job', 403);
  }

  return job;
};

const buildJobData = (input) => {
  const data = {};

  for (const field of editableFields) {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      data[field] = input[field];
    }
  }

  if (typeof data.skills === 'string') {
    data.skills = data.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return data;
};

const createJob = async (input, user) => {
  const job = await Job.create({
    ...buildJobData(input),
    createdBy: user._id,
    status: 'DRAFT',
  });

  return Job.findById(job._id).populate('createdBy', 'name email');
};

const listJobs = async (query, user) => {
  const currentPage = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);
  const filter = { ...getJobScope(user) };

  if (user.role === 'CANDIDATE') {
    filter.status = 'PUBLISHED';
  } else if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const escapedSearch = escapeRegExp(query.search);
    filter.title = { $regex: escapedSearch, $options: 'i' };
  }

  for (const field of ['location', 'department', 'employmentType']) {
    if (query[field]) {
      filter[field] = query[field];
    }
  }

  const totalJobs = await Job.countDocuments(filter);
  const jobs = await Job.find(filter)
    .populate('createdBy', 'name')
    .sort({ createdAt: -1, _id: -1 })
    .skip((currentPage - 1) * limit)
    .limit(limit);

  return {
    jobs,
    pagination: {
      currentPage,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
      limit,
    },
  };
};

const getJobById = (jobId, user) => findJobForUser(jobId, user);

const updateJob = async (jobId, input, user) => {
  const job = await findJobForUser(jobId, user);
  const data = buildJobData(input);

  Object.assign(job, data);
  await job.save();

  return Job.findById(job._id).populate('createdBy', 'name email');
};

const deleteJob = async (jobId, user) => {
  const job = await findJobForUser(jobId, user);
  await job.deleteOne();
};

const updateJobStatus = async (jobId, status, user) => {
  const job = await findJobForUser(jobId, user);

  const allowedTransitions = {
    DRAFT: 'PUBLISHED',
    PUBLISHED: 'CLOSED',
  };

  if (allowedTransitions[job.status] !== status) {
    throw createHttpError(`Invalid job status transition: ${job.status} to ${status}`, 400);
  }

  job.status = status;
  await job.save();
  return Job.findById(job._id).populate('createdBy', 'name email');
};

module.exports = {
  createJob,
  listJobs,
  getJobById,
  updateJob,
  deleteJob,
  updateJobStatus,
};
