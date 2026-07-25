import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200/50">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-base-content/60 mb-8">Page not found</p>
        <Link href="/" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
