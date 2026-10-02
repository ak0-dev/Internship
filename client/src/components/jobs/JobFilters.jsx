const employmentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];

const controlClassName = 'min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

const JobFilters = ({ filters, onChange, canManage }) => {
  const update = (event) => {
    onChange({ ...filters, [event.target.name]: event.target.value, page: 1 });
  };

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
      <input
        aria-label="Search by job title"
        name="search"
        value={filters.search}
        onChange={update}
        placeholder="Search job titles"
        className={controlClassName}
      />
      <input
        aria-label="Filter by location"
        name="location"
        value={filters.location}
        onChange={update}
        placeholder="Location"
        className={controlClassName}
      />
      <input
        aria-label="Filter by department"
        name="department"
        value={filters.department}
        onChange={update}
        placeholder="Department"
        className={controlClassName}
      />
      <select
        aria-label="Filter by employment type"
        name="employmentType"
        value={filters.employmentType}
        onChange={update}
        className={controlClassName}
      >
        <option value="">All employment types</option>
        {employmentTypes.map((type) => (
          <option key={type} value={type}>{type.replace('_', ' ')}</option>
        ))}
      </select>
      {canManage ? (
        <select
          aria-label="Filter by status"
          name="status"
          value={filters.status}
          onChange={update}
          className={controlClassName}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CLOSED">Closed</option>
        </select>
      ) : <span className="hidden lg:block" />}
    </div>
  );
};

export default JobFilters;
