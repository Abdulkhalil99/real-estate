export default function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-52 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-6 w-32 rounded" />
        <div className="skeleton h-4 w-48 rounded" />
        <div className="skeleton h-3 w-36 rounded" />
        <div className="flex gap-4">
          <div className="skeleton h-4 w-12 rounded" />
          <div className="skeleton h-4 w-12 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
