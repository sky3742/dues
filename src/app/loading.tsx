export default function DashboardLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="h-9 w-40 bg-base-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-64 bg-base-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="h-4 w-16 bg-base-200 rounded animate-pulse mb-1" />
              <div className="h-7 w-10 bg-base-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card bg-base-100 shadow-sm border-l-4 border-base-200">
            <div className="card-body p-3">
              <div className="flex justify-between">
                <div className="h-5 w-32 bg-base-200 rounded animate-pulse" />
                <div className="h-5 w-20 bg-base-200 rounded animate-pulse" />
              </div>
              <div className="flex justify-between mt-2">
                <div className="h-4 w-28 bg-base-200 rounded animate-pulse" />
                <div className="h-8 w-24 bg-base-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
