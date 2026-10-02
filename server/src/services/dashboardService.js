const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Job = require('../models/Job');

const getStatistics = async (jobFilter = {}) => {
  const isPlatformWide = Object.keys(jobFilter).length === 0;
  const jobs = await Job.find(jobFilter).select('_id');
  const jobIds = jobs.map((job) => job._id);
  const applicationMatch = isPlatformWide ? {} : { job: { $in: jobIds } };
  const interviewPipeline = isPlatformWide
    ? [{ $group: { _id: '$status', count: { $sum: 1 } } }]
    : [
      {
        $lookup: {
          from: 'applications',
          localField: 'application',
          foreignField: '_id',
          as: 'application',
        },
      },
      { $unwind: '$application' },
      { $match: { 'application.job': { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ];
  const [publishedJobs, applicationCounts, interviewCounts] = await Promise.all([
    Job.countDocuments({ ...jobFilter, status: 'PUBLISHED' }),
    Application.aggregate([
      { $match: applicationMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Interview.aggregate(interviewPipeline),
  ]);

  const applicationCountsByStatus = Object.fromEntries(
    applicationCounts.map(({ _id, count }) => [_id, count])
  );
  const interviewCountsByStatus = Object.fromEntries(
    interviewCounts.map(({ _id, count }) => [_id, count])
  );

  return {
    totalJobs: jobs.length,
    publishedJobs,
    totalApplications: Object.values(applicationCountsByStatus).reduce((total, count) => total + count, 0),
    shortlistedApplications: applicationCountsByStatus.SHORTLISTED || 0,
    rejectedApplications: applicationCountsByStatus.REJECTED || 0,
    hiredApplications: applicationCountsByStatus.HIRED || 0,
    scheduledInterviews: interviewCountsByStatus.SCHEDULED || 0,
    completedInterviews: interviewCountsByStatus.COMPLETED || 0,
  };
};

const getRecruiterDashboard = (recruiterId) => getStatistics({ createdBy: recruiterId });

const getAdminDashboard = () => getStatistics();

module.exports = {
  getRecruiterDashboard,
  getAdminDashboard,
};
