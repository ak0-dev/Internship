import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getJob, updateJob } from '../api/jobApi';
import JobForm from '../components/jobs/JobForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJob = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getJob(id);
      setJob(result.job);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load this job.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleUpdate = async (data) => {
    await updateJob(id, data);
    navigate(`/jobs/${id}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading job..." />;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <div>
          <Link to={`/jobs/${id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">← Back to job</Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Edit job</h1>
        </div>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {job && <JobForm key={job._id} initialJob={job} onSubmit={handleUpdate} submitLabel="Save changes" />}
      </div>
    </main>
  );
};

export default EditJobPage;
