import { useState } from 'react';

const employmentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];

const emptyForm = {
  title: '',
  description: '',
  department: '',
  location: '',
  employmentType: 'FULL_TIME',
  experienceRequired: '0',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  skills: '',
};

const JobForm = ({ initialJob, onSubmit, submitLabel }) => {
  const [formData, setFormData] = useState(() => initialJob ? {
    title: initialJob.title || '',
    description: initialJob.description || '',
    department: initialJob.department || '',
    location: initialJob.location || '',
    employmentType: initialJob.employmentType || 'FULL_TIME',
    experienceRequired: String(initialJob.experienceRequired ?? 0),
    salaryMin: initialJob.salaryRange?.min ?? '',
    salaryMax: initialJob.salaryRange?.max ?? '',
    currency: initialJob.salaryRange?.currency || 'USD',
    skills: (initialJob.skills || []).join(', '),
  } : emptyForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const salaryRange = {
      currency: formData.currency,
      ...(formData.salaryMin !== '' ? { min: Number(formData.salaryMin) } : {}),
      ...(formData.salaryMax !== '' ? { max: Number(formData.salaryMax) } : {}),
    };
    const data = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      department: formData.department.trim(),
      location: formData.location.trim(),
      employmentType: formData.employmentType,
      experienceRequired: Number(formData.experienceRequired),
      salaryRange,
      skills: formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    };

    if (salaryRange.min != null && salaryRange.max != null && salaryRange.min > salaryRange.max) {
      setError('Minimum salary cannot exceed maximum salary.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(data);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to save the job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';
  const labelClassName = 'block text-sm font-medium text-slate-700';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className={labelClassName}>
          Job title
          <input name="title" value={formData.title} onChange={handleChange} className={inputClassName} maxLength={120} required />
        </label>
        <label className={labelClassName}>
          Department
          <input name="department" value={formData.department} onChange={handleChange} className={inputClassName} maxLength={100} required />
        </label>
        <label className={labelClassName}>
          Location
          <input name="location" value={formData.location} onChange={handleChange} className={inputClassName} maxLength={120} required />
        </label>
        <label className={labelClassName}>
          Employment type
          <select name="employmentType" value={formData.employmentType} onChange={handleChange} className={inputClassName} required>
            {employmentTypes.map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
          </select>
        </label>
        <label className={labelClassName}>
          Experience required (years)
          <input name="experienceRequired" type="number" min="0" max="50" step="0.5" value={formData.experienceRequired} onChange={handleChange} className={inputClassName} required />
        </label>
        <label className={labelClassName}>
          Skills (comma-separated)
          <input name="skills" value={formData.skills} onChange={handleChange} className={inputClassName} placeholder="React, Node.js, MongoDB" />
        </label>
      </div>

      <fieldset className="grid gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-3">
        <legend className="px-1 text-sm font-medium text-slate-700">Optional salary range</legend>
        <label className={labelClassName}>
          Minimum
          <input name="salaryMin" type="number" min="0" value={formData.salaryMin} onChange={handleChange} className={inputClassName} />
        </label>
        <label className={labelClassName}>
          Maximum
          <input name="salaryMax" type="number" min="0" value={formData.salaryMax} onChange={handleChange} className={inputClassName} />
        </label>
        <label className={labelClassName}>
          Currency
          <input name="currency" value={formData.currency} onChange={handleChange} className={inputClassName} pattern="[A-Za-z]{3}" title="Enter a 3-letter currency code, such as USD, INR, or EUR." required />
        </label>
      </fieldset>

      <label className={labelClassName}>
        Description
        <textarea name="description" value={formData.description} onChange={handleChange} className={`${inputClassName} min-h-40`} maxLength={10000} required />
      </label>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
