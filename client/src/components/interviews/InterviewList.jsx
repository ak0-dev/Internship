const formatInterviewDate = (date) => new Date(date).toLocaleString();

const InterviewList = ({ interviews, canManage = false, busyId = '', onCancel }) => {
  return (
    <div className="space-y-4">
      {interviews.map((interview) => {
        const application = interview.application;
        const job = application?.job;
        const candidate = application?.candidate;

        return (
          <article key={interview._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{job?.title || 'Interview'}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {canManage ? `${candidate?.name || 'Candidate'} · ${candidate?.email || ''}` : `${job?.department || ''} · ${job?.location || ''}`}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                interview.status === 'SCHEDULED'
                  ? 'bg-blue-50 text-blue-700'
                  : interview.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
              }`}>
                {interview.status}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div><dt className="text-slate-500">When</dt><dd className="mt-1 font-medium text-slate-800">{formatInterviewDate(interview.scheduledAt)}</dd></div>
              <div><dt className="text-slate-500">Duration</dt><dd className="mt-1 font-medium text-slate-800">{interview.duration} minutes</dd></div>
              <div><dt className="text-slate-500">Mode</dt><dd className="mt-1 font-medium text-slate-800">{interview.mode.replace('_', ' ')}</dd></div>
              {interview.mode === 'ONLINE' && interview.meetingLink && (
                <div className="sm:col-span-3"><dt className="text-slate-500">Meeting link</dt><dd className="mt-1 break-all"><a href={interview.meetingLink} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:text-indigo-500">{interview.meetingLink}</a></dd></div>
              )}
              {interview.mode === 'IN_PERSON' && interview.location && (
                <div><dt className="text-slate-500">Location</dt><dd className="mt-1 font-medium text-slate-800">{interview.location}</dd></div>
              )}
              {interview.notes && <div className="sm:col-span-3"><dt className="text-slate-500">Notes</dt><dd className="mt-1 whitespace-pre-wrap text-slate-700">{interview.notes}</dd></div>}
            </dl>

            {canManage && interview.status === 'SCHEDULED' && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => onCancel(interview._id)}
                  disabled={busyId === interview._id}
                  className="text-sm font-semibold text-red-600 hover:text-red-500 disabled:opacity-50"
                >
                  {busyId === interview._id ? 'Cancelling...' : 'Cancel interview'}
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default InterviewList;
