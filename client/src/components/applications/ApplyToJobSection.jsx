import { useEffect, useState } from 'react';
import { applyToJob, getMyApplications } from '../../api/applicationApi';

const ApplyToJobSection = ({ jobId }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getMyApplications()
      .then(({ applications }) => {
        const existing = applications.find((item) => item.job?._id === jobId);
        if (isCurrent) setApplication(existing || null);
      })
      .catch((loadError) => {
        if (isCurrent) {
          setError(loadError.response?.data?.message || 'Unable to check your applications.');
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [jobId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const result = await applyToJob({ jobId, coverLetter });
      setApplication(result.application);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to submit your application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
      <h2 className="text-xl font-semibold text-slate-900">Apply for this job</h2>
      {loading ? (
        <p className="mt-3 text-sm text-slate-600">Checking your application status...</p>
      ) : application ? (
        <p className="mt-3 text-sm text-emerald-800">
          You have applied for this job. Current status: <strong>{application.status}</strong>.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Cover letter <span className="font-normal text-slate-500">(optional, up to 3000 characters)</span>
            <textarea
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              maxLength={3000}
              rows={5}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit application'}
          </button>
        </form>
      )}
    </section>
  );
};

export default ApplyToJobSection;
