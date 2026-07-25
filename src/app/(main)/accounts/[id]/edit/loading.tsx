export default function EditAccountLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="h-9 w-44 bg-base-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-56 bg-base-200 rounded animate-pulse" />
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-6 space-y-4">
            <div className="h-5 w-24 bg-base-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-base-200 rounded animate-pulse" />
            <div className="h-5 w-24 bg-base-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-base-200 rounded animate-pulse" />
            <div className="h-5 w-32 bg-base-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-base-200 rounded animate-pulse" />
            <div className="flex justify-end gap-2 pt-4">
              <div className="h-10 w-20 bg-base-200 rounded animate-pulse" />
              <div className="h-10 w-28 bg-base-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
