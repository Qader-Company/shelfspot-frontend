interface TimelineStepCardProps {
  description: string;
  title: string;
}

export function TimelineStepCard({
  description,
  title,
}: TimelineStepCardProps) {
  return (
    <article className="rounded-[20px] border-2 border-primary bg-card px-5 py-5 shadow-none sm:rounded-[28px] sm:px-7 sm:py-6">
      <div className="flex flex-col gap-3 text-center">
        <h3 className="text-[clamp(1.125rem,2vw,1.75rem)] leading-[1.4] font-semibold text-foreground">
          {title}
        </h3>

        <p className="text-[clamp(0.875rem,1.35vw,1.125rem)] leading-[1.6] font-regular text-foreground/80">
          {description}
        </p>
      </div>
    </article>
  );
}
