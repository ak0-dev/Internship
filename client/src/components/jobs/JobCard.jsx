import { Link } from 'react-router-dom';

const JobCard = ({ job }) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            <Link to={`/jobs/${job._id}`} className="hover:text-indigo-600">
              {job.title}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-slate-600">{job.department} · {job.location}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {job.employmentType.replace('_', ' ')}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span>{job.experienceRequired} years experience</span>
        <Link to={`/jobs/${job._id}`} className="font-semibold text-indigo-600 hover:text-indigo-500">
          View details
        </Link>
      </div>
    </article>
  );
};

export default JobCard;
