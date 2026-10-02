import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getApplicationsForJob, updateApplicationStatus } from '../api/applicationApi';
import InterviewScheduleForm from '../components/interviews/InterviewScheduleForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const statuses = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED'];
const emptyPagination = { currentPage: 1, totalPages: 0, totalApplications: 0 };

const JobApplicationsPage = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState(emptyPagination);
  const [page, setPage] = useState(1);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getApplicationsForJob(jobId, { search, status, page, limit: 10 });
      const resultApplications = result.applications || [];
      setApplications(resultApplications);
      setJob(result.job || null);
      setPagination(result.pagination || {
        ...emptyPagination,
        currentPage: page,
        totalApplications: resultApplications.length,
      });
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load applicants.');
    } finally {
      setLoading(false);
    }
  }, [jobId, search, status, page]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleStatusChange = async (applicationId, status) => {
    setBusyId(applicationId);
    setError('');
    try {
      const { application } = await updateApplicationStatus(applicationId, status);
      setApplications((current) => current.map((item) => (
        item._id === applicationId ? { ...item, status: application.status } : item
      )));
    } catch (updateError) {
      setError(updateError.response?.data?.message || 'Unable to update application status.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <Link to={job ? `/jobs/${jobId}` : '/jobs'} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">← Back to job</Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Applicants</h1>
          {job && <p className="mt-1 text-sm text-slate-600">{job.title} · {job.department}</p>}
          {job && <Link to={`/jobs/${jobId}/interviews`} className="mt-3 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-500">View interviews →</Link>}
        </header>

        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_220px_auto] sm:items-center">
          <input
            type="search"
            aria-label="Search applicants by name or email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search name or email"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <select
            aria-label="Filter applications by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All statuses</option>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <p className="text-sm text-slate-600">{pagination.totalApplications} application{pagination.totalApplications === 1 ? '' : 's'}</p>
        </section>

        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading ? <LoadingSpinner text="Loading applicants..." /> : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-slate-900">{pagination.totalApplications ? 'No matching applicants' : 'No applicants yet'}</h2>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Candidate</th>
                  <th className="px-4 py-3 font-semibold">Applied</th>
                  <th className="px-4 py-3 font-semibold">Cover letter</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Interview</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((application) => (
                  <tr key={application._id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{application.candidate?.name || 'Candidate'}</p>
                      <p className="mt-1 text-slate-500">{application.candidate?.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{new Date(application.createdAt).toLocaleDateString()}</td>
                    <td className="max-w-sm whitespace-pre-wrap px-4 py-4 text-slate-600">{application.coverLetter || '—'}</td>
                    <td className="px-4 py-4">
                      <select
                        aria-label={`Status for ${application.candidate?.name || 'candidate'}`}
                        value={application.status}
                        disabled={busyId === application._id}
                        onChange={(event) => handleStatusChange(application._id, event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 disabled:opacity-50"
                      >
                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <InterviewScheduleForm applicationId={application._id} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <Link to={`/applications/${application._id}`} className="font-semibold text-indigo-600 hover:text-indigo-500">View details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && pagination.totalPages > 1 && (
          <nav aria-label="Applicant pagination" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm text-slate-600">Page {pagination.currentPage} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.currentPage <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
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

export default JobApplicationsPage;
