import { useState } from 'react';
import { createInterview } from '../../api/interviewApi';

const formatLocalDateTime = (date) => {
  const pad = (value) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const InterviewScheduleForm = ({ applicationId, onScheduled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    scheduledAt: '',
    duration: '30',
    mode: 'ONLINE',
    meetingLink: '',
    location: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minimumDateTime] = useState(() => formatLocalDateTime(new Date(Date.now() + 60000)));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const interview = await createInterview({
        application: applicationId,
        ...formData,
        duration: Number(formData.duration),
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
      });
      onScheduled?.(interview.interview);
      setIsOpen(false);
      setFormData((current) => ({ ...current, scheduledAt: '', meetingLink: '', location: '', notes: '' }));
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to schedule this interview.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="font-medium text-indigo-600 hover:text-indigo-500"
      >
        {isOpen ? 'Hide form' : 'Schedule interview'}
      </button>
      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-3 min-w-64 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <label className="block text-xs font-medium text-slate-700">
            Date and time
            <input
              type="datetime-local"
              name="scheduledAt"
              value={formData.scheduledAt}
              onChange={handleChange}
              min={minimumDateTime}
              required
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-medium text-slate-700">
              Duration (min)
              <input type="number" name="duration" min="1" value={formData.duration} onChange={handleChange} required className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm" />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Mode
              <select name="mode" value={formData.mode} onChange={handleChange} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm">
                <option value="ONLINE">Online</option>
                <option value="IN_PERSON">In person</option>
              </select>
            </label>
          </div>
          {formData.mode === 'ONLINE' ? (
            <label className="block text-xs font-medium text-slate-700">
              Meeting link
              <input name="meetingLink" type="url" value={formData.meetingLink} onChange={handleChange} required className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm" />
            </label>
          ) : (
            <label className="block text-xs font-medium text-slate-700">
              Location
              <input name="location" value={formData.location} onChange={handleChange} required className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm" />
            </label>
          )}
          <label className="block text-xs font-medium text-slate-700">
            Notes
            <textarea name="notes" value={formData.notes} onChange={handleChange} maxLength={2000} rows={2} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm" />
          </label>
          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
            {isSubmitting ? 'Scheduling...' : 'Confirm schedule'}
          </button>
        </form>
      )}
    </div>
  );
};

export default InterviewScheduleForm;
