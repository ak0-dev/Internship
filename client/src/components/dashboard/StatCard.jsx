const StatCard = ({ label, value, description }) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value ?? 0}</p>
      {description && <p className="mt-2 text-xs text-slate-500">{description}</p>}
    </article>
  );
};

export default StatCard;
