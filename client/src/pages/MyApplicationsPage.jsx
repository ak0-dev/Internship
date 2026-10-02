import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../api/applicationApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const statusStyles = {
  APPLIED: 'bg-blue-50 text-blue-700',
  SHORTLISTED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  HIRED: 'bg-indigo-50 text-indigo-700',
};

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getMyApplications()
      .then(({ applications: result }) => {
        if (isCurrent) setApplications(result);
      })
      .catch((loadError) => {
        if (isCurrent) setError(loadError.response?.data?.message || 'Unable to load your applications.');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <Link to="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">← Dashboard</Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">My applications</h1>
          <p className="mt-1 text-sm text-slate-600">Track the status of your job applications.</p>
        </header>

        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading ? <LoadingSpinner text="Loading applications..." /> : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No applications yet</h2>
            <p className="mt-2 text-sm text-slate-600">Browse published jobs and apply to get started.</p>
            <Link to="/jobs" className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Browse jobs</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <article key={application._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
                <div>
                  {application.job ? (
                    <Link to={`/jobs/${application.job._id}`} className="text-lg font-semibold text-slate-900 hover:text-indigo-600">
                      {application.job.title}
                    </Link>
                  ) : <h2 className="text-lg font-semibold text-slate-900">Job no longer available</h2>}
                  {application.job && <p className="mt-1 text-sm text-slate-600">{application.job.department} · {application.job.location}</p>}
                  <p className="mt-2 text-xs text-slate-500">Applied {new Date(application.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[application.status] || 'bg-slate-100 text-slate-700'}`}>
                  {application.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyApplicationsPage;
