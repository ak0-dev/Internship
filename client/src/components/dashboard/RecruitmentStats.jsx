import StatCard from './StatCard';

const RecruitmentStats = ({ statistics }) => {
  const stats = [
    ['Total jobs', statistics.totalJobs],
    ['Published jobs', statistics.publishedJobs],
    ['Total applications', statistics.totalApplications],
    ['Shortlisted', statistics.shortlistedApplications],
    ['Rejected', statistics.rejectedApplications],
    ['Hired', statistics.hiredApplications],
    ['Scheduled interviews', statistics.scheduledInterviews],
    ['Completed interviews', statistics.completedInterviews],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(([label, value]) => <StatCard key={label} label={label} value={value} />)}
    </div>
  );
};

export default RecruitmentStats;
