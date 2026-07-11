type PageTransitionProps = {
  children: React.ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  return <div className="animate-slide-up">{children}</div>;
}
