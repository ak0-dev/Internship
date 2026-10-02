import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { closeJob, deleteJob, getJobs, publishJob } from '../api/jobApi';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';
import JobTable from '../components/jobs/JobTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const initialFilters = {
  search: '',
  location: '',
  department: '',
  employmentType: '',
  status: '',
  page: 1,
  limit: 10,
};

const JobsPage = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'RECRUITER';
  const [filters, setFilters] = useState(initialFilters);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0, totalJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyJobId, setBusyJobId] = useState('');

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getJobs(filters);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load jobs.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const performAction = async (jobId, action) => {
    setBusyJobId(jobId);
    setActionError('');
    try {
      await action(jobId);
      await loadJobs();
    } catch (actionFailure) {
      setActionError(actionFailure.response?.data?.message || 'Unable to update this job.');
    } finally {
      setBusyJobId('');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job? This action cannot be undone.')) {
      return;
    }
    await performAction(jobId, deleteJob);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">← Dashboard</Link>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Jobs</h1>
            <p className="mt-1 text-sm text-slate-600">
              {canManage ? 'Manage your job postings.' : 'Browse currently published roles.'}
            </p>
          </div>
          {canManage && (
            <Link to="/jobs/new" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
              Create job
            </Link>
          )}
        </header>

        <JobFilters filters={filters} onChange={setFilters} canManage={canManage} />

        {actionError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {loading ? (
          <LoadingSpinner text="Loading jobs..." />
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No jobs found</h2>
            <p className="mt-2 text-sm text-slate-600">Try changing your filters or search terms.</p>
          </div>
        ) : canManage ? (
          <JobTable
            jobs={jobs}
            busyJobId={busyJobId}
            onPublish={(jobId) => performAction(jobId, publishJob)}
            onClose={(jobId) => performAction(jobId, closeJob)}
            onDelete={handleDelete}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => <JobCard key={job._id} job={job} />)}
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <nav aria-label="Job pagination" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm text-slate-600">
              Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalJobs} jobs
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.currentPage <= 1}
                onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </div>
    </main>
  );
};

export default JobsPage;
