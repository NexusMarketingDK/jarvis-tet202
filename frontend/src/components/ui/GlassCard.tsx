export function GlassCard({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass rounded-2xl p-6 ${className}`}>
      {title && <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-400">{title}</h2>}
      {children}
    </section>
  );
}
