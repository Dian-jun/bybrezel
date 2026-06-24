export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="surface flex flex-col items-start gap-3 p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-lg text-sm text-stone-600">{description}</p>
    </div>
  );
}
