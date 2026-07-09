export function DashboardEmptyIllustration() {
  return (
    <div className="relative h-36 w-40 text-muted-foreground" aria-hidden="true">
      <div className="absolute start-5 top-8 h-28 w-20 -rotate-14 rounded-sm border border-current bg-card" />
      <div className="absolute start-12 top-1 h-6 w-16 -rotate-14 rounded-sm bg-primary/70" />
      <div className="absolute start-[4.5rem] top-11 h-28 w-24 rounded-sm border border-current bg-card" />
      <div className="absolute start-[5.95rem] top-8 h-5 w-16 rounded-sm bg-primary/70" />
      <span className="absolute start-[4.7rem] top-2 size-3 rounded-full border-2 border-primary" />
      <span className="absolute start-[7.8rem] top-5 size-3 rounded-full border-2 border-primary" />
    </div>
  );
}
