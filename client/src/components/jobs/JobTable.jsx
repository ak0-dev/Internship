import { Link } from 'react-router-dom';

const statusClassNames = {
  DRAFT: 'bg-amber-50 text-amber-700',
  PUBLISHED: 'bg-emerald-50 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-600',
};

const JobTable = ({ jobs, onPublish, onClose, onDelete, busyJobId }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Job</th>
            <th className="px-4 py-3 font-semibold">Location</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {jobs.map((job) => (
            <tr key={job._id} className="align-top">
              <td className="px-4 py-4">
                <Link to={`/jobs/${job._id}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                  {job.title}
                </Link>
                <p className="mt-1 text-slate-500">{job.department}</p>
              </td>
              <td className="px-4 py-4 text-slate-600">{job.location}</td>
              <td className="px-4 py-4 text-slate-600">{job.employmentType.replace('_', ' ')}</td>
              <td className="px-4 py-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassNames[job.status]}`}>
                  {job.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Link to={`/jobs/${job._id}/edit`} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Edit
                  </Link>
                  {job.status === 'DRAFT' && (
                    <button
                      type="button"
                      onClick={() => onPublish(job._id)}
                      disabled={busyJobId === job._id}
                      className="font-medium text-emerald-700 disabled:opacity-50"
                    >
                      Publish
                    </button>
                  )}
                  {job.status === 'PUBLISHED' && (
                    <button
                      type="button"
                      onClick={() => onClose(job._id)}
                      disabled={busyJobId === job._id}
                      className="font-medium text-amber-700 disabled:opacity-50"
                    >
                      Close
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(job._id)}
                    disabled={busyJobId === job._id}
                    className="font-medium text-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobTable;
