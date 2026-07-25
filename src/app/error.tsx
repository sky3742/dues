"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200/50">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">Oops</h1>
        <p className="text-xl text-base-content/60 mb-2">Something went wrong</p>
        {error.digest && <p className="text-sm text-base-content/40 mb-8">Error: {error.digest}</p>}
        <button className="btn btn-primary" onClick={reset}>
          Try Again
        </button>
      </div>
    </div>
  );
}
