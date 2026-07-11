"use client";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="animate-slide-up">{children}</div>;
}
