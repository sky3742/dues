export default function AccountsLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-9 w-32 bg-base-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-48 bg-base-200 rounded animate-pulse" />
        </div>
        <div className="h-9 w-28 bg-base-200 rounded animate-pulse" />
      </div>

      <div className="grid gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card bg-base-100 shadow-sm border-l-4 border-base-200">
            <div className="card-body p-3">
              <div className="flex justify-between">
                <div className="h-5 w-36 bg-base-200 rounded animate-pulse" />
                <div className="flex gap-1">
                  <div className="h-8 w-14 bg-base-200 rounded animate-pulse" />
                  <div className="h-8 w-14 bg-base-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-48 bg-base-200 rounded animate-pulse mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
