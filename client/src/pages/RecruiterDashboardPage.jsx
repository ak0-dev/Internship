import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRecruiterDashboard } from '../api/dashboardApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RecruitmentStats from '../components/dashboard/RecruitmentStats';
import { useAuth } from '../context/AuthContext';

const RecruiterDashboardPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    let isCurrent = true;
    getRecruiterDashboard()
      .then(({ statistics: result }) => {
        if (isCurrent) setStatistics(result);
      })
      .catch((loadError) => {
        if (isCurrent) setError(loadError.response?.data?.message || 'Unable to load dashboard statistics.');
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
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Recruiter</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Recruitment dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Overview of your jobs, applicants, and interviews.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/jobs" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Manage jobs</Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </header>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading ? <LoadingSpinner text="Loading dashboard..." /> : statistics && <RecruitmentStats statistics={statistics} />}
      </div>
    </main>
  );
};

export default RecruiterDashboardPage;
