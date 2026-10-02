import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getApplication, updateApplicationStatus } from '../api/applicationApi';
import InterviewList from '../components/interviews/InterviewList';
import LoadingSpinner from '../components/common/LoadingSpinner';

const statuses = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED'];

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadApplication = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getApplication(id);
      setApplication(result.application);
      setInterviews(result.interviews);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load this application.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleStatusChange = async (event) => {
    const nextStatus = event.target.value;
    setIsUpdating(true);
    setError('');
    try {
      const result = await updateApplicationStatus(id, nextStatus);
      setApplication((current) => ({ ...current, status: result.application.status }));
    } catch (updateError) {
      setError(updateError.response?.data?.message || 'Unable to update application status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading application..." />;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <Link
            to={application?.job?._id ? `/jobs/${application.job._id}/applications` : '/jobs'}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            ← Back to applicants
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Application details</h1>
        </header>

        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {application ? (
          <>
            <section className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Candidate</h2>
                <p className="mt-2 text-xl font-semibold text-slate-900">{application.candidate?.name || 'Candidate'}</p>
                <p className="mt-1 text-sm text-slate-600">{application.candidate?.email}</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Applied job</h2>
                {application.job ? (
                  <>
                    <Link to={`/jobs/${application.job._id}`} className="mt-2 inline-block text-xl font-semibold text-indigo-600 hover:text-indigo-500">
                      {application.job.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600">{application.job.department} · {application.job.location}</p>
                  </>
                ) : <p className="mt-2 text-slate-700">Job unavailable</p>}
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Applied on</h2>
                <p className="mt-2 text-slate-800">{new Date(application.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label htmlFor="application-status" className="text-sm font-semibold uppercase tracking-wide text-slate-500">Application status</label>
                <select
                  id="application-status"
                  value={application.status}
                  onChange={handleStatusChange}
                  disabled={isUpdating}
                  className="mt-2 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:opacity-50"
                >
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Cover letter</h2>
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 leading-6 text-slate-700">
                  {application.coverLetter || 'No cover letter provided.'}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Interviews</h2>
              {interviews.length ? (
                <InterviewList interviews={interviews.map((interview) => ({
                  ...interview,
                  application: {
                    job: application.job,
                    candidate: application.candidate,
                  },
                }))} />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm text-slate-600">
                  No interviews scheduled for this application.
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-700">Application could not be found.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ApplicationDetailsPage;
