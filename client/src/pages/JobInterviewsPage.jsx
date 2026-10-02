import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cancelInterview, getInterviewsForJob } from '../api/interviewApi';
import InterviewList from '../components/interviews/InterviewList';
import LoadingSpinner from '../components/common/LoadingSpinner';

const JobInterviewsPage = () => {
  const { jobId } = useParams();
  const [interviews, setInterviews] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getInterviewsForJob(jobId)
      .then((result) => {
        if (isCurrent) {
          setInterviews(result.interviews);
          setJob(result.job);
        }
      })
      .catch((loadError) => {
        if (isCurrent) setError(loadError.response?.data?.message || 'Unable to load job interviews.');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [jobId]);

  const handleCancel = async (interviewId) => {
    setBusyId(interviewId);
    setError('');
    try {
      const { interview } = await cancelInterview(interviewId);
      setInterviews((current) => current.map((item) => (
        item._id === interviewId ? { ...item, status: interview.status } : item
      )));
    } catch (cancelError) {
      setError(cancelError.response?.data?.message || 'Unable to cancel interview.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <Link to={`/jobs/${jobId}/applications`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">← Back to applicants</Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Job interviews</h1>
          {job && <p className="mt-1 text-sm text-slate-600">{job.title}</p>}
        </header>

        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading ? <LoadingSpinner text="Loading interviews..." /> : interviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No interviews scheduled</h2>
            <p className="mt-2 text-sm text-slate-600">Schedule an interview from the applicants page.</p>
          </div>
        ) : (
          <InterviewList
            interviews={interviews}
            canManage
            busyId={busyId}
            onCancel={handleCancel}
          />
        )}
      </div>
    </main>
  );
};

export default JobInterviewsPage;
