import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyInterviews } from '../api/interviewApi';
import InterviewList from '../components/interviews/InterviewList';
import LoadingSpinner from '../components/common/LoadingSpinner';

const InterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getMyInterviews()
      .then(({ interviews: result }) => {
        if (isCurrent) setInterviews(result);
      })
      .catch((loadError) => {
        if (isCurrent) setError(loadError.response?.data?.message || 'Unable to load your interviews.');
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
          <h1 className="mt-2 text-3xl font-bold text-slate-900">My interviews</h1>
          <p className="mt-1 text-sm text-slate-600">View your upcoming and past interview details.</p>
        </header>

        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading ? <LoadingSpinner text="Loading interviews..." /> : interviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No interviews scheduled</h2>
            <p className="mt-2 text-sm text-slate-600">Scheduled interviews will appear here.</p>
          </div>
        ) : <InterviewList interviews={interviews} />}
      </div>
    </main>
  );
};

export default InterviewsPage;
