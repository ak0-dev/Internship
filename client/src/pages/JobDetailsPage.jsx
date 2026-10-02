import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { closeJob, deleteJob, getJob, publishJob } from '../api/jobApi';
import ApplyToJobSection from '../components/applications/ApplyToJobSection';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const canManage = user?.role === 'ADMIN' || user?.role === 'RECRUITER';
  const canViewApplicants = user?.role === 'ADMIN' || (
    user?.role === 'RECRUITER' &&
    job?.createdBy?._id === user?._id
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const loadJob = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getJob(id);
      setJob(data.job);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load this job.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const changeStatus = async (action) => {
    setIsBusy(true);
    setError('');
    try {
      const data = await action(id);
      setJob(data.job);
    } catch (actionError) {
      setError(actionError.response?.data?.message || 'Unable to update this job.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this job? This action cannot be undone.')) {
      return;
    }

    setIsBusy(true);
    try {
      await deleteJob(id);
      navigate('/jobs', { replace: true });
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to delete this job.');
      setIsBusy(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading job..." />;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <article className="mx-auto max-w-4xl space-y-6">
        <Link to="/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">← Back to jobs</Link>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {job ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{job.department}</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">{job.title}</h1>
                <p className="mt-2 text-slate-600">{job.location} · {job.employmentType.replace('_', ' ')}</p>
              </div>
              {canManage && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{job.status}</span>
              )}
            </div>

            <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
              <div><p className="text-xs uppercase tracking-wide text-slate-500">Experience</p><p className="mt-1 font-semibold text-slate-900">{job.experienceRequired} years</p></div>
              <div><p className="text-xs uppercase tracking-wide text-slate-500">Salary</p><p className="mt-1 font-semibold text-slate-900">
                {job.salaryRange?.min != null || job.salaryRange?.max != null
                  ? `${job.salaryRange?.currency || 'USD'} ${job.salaryRange?.min ?? '—'} – ${job.salaryRange?.max ?? '—'}`
                  : 'Not specified'}
              </p></div>
              <div><p className="text-xs uppercase tracking-wide text-slate-500">Posted by</p><p className="mt-1 font-semibold text-slate-900">{job.createdBy?.name || 'Recruitment team'}</p></div>
            </div>

            {job.skills.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Skills</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.skills.map((skill) => <span key={skill} className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">{skill}</span>)}
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="text-xl font-semibold text-slate-900">Job description</h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{job.description}</p>
            </div>

            {canManage && (
              <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                <Link to={`/jobs/${job._id}/edit`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Edit job</Link>
                {canViewApplicants && (
                  <Link to={`/jobs/${job._id}/applications`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View applicants</Link>
                )}
                {canViewApplicants && (
                  <Link to={`/jobs/${job._id}/interviews`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View interviews</Link>
                )}
                {job.status === 'DRAFT' && (
                  <button type="button" disabled={isBusy} onClick={() => changeStatus(publishJob)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">Publish</button>
                )}
                {job.status === 'PUBLISHED' && (
                  <button type="button" disabled={isBusy} onClick={() => changeStatus(closeJob)} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400 disabled:opacity-50">Close job</button>
                )}
                <button type="button" disabled={isBusy} onClick={handleDelete} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Delete</button>
              </div>
            )}
          </section>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <h1 className="text-xl font-semibold text-slate-900">Job unavailable</h1>
            <p className="mt-2 text-sm text-slate-600">{error || 'This job may have been removed or is not available to your account.'}</p>
          </div>
        )}
        {user?.role === 'CANDIDATE' && job?.status === 'PUBLISHED' && (
          <ApplyToJobSection jobId={job._id} />
        )}
      </article>
    </main>
  );
};

export default JobDetailsPage;
