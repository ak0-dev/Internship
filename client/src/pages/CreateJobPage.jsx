import { Link, useNavigate } from 'react-router-dom';
import { createJob } from '../api/jobApi';
import JobForm from '../components/jobs/JobForm';

const CreateJobPage = () => {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    const result = await createJob(data);
    navigate(`/jobs/${result.job._id}`);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <div>
          <Link to="/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">← Back to jobs</Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Create job</h1>
          <p className="mt-1 text-sm text-slate-600">New postings start as drafts. Publish them when they are ready.</p>
        </div>
        <JobForm onSubmit={handleCreate} submitLabel="Create draft" />
      </div>
    </main>
  );
};

export default CreateJobPage;
