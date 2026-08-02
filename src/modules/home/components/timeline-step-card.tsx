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
        <h3 className="text-xl font-semibold text-foreground sm:text-display-sm">
          {title}
        </h3>

        <p className="text-sm font-regular leading-[1.6] text-foreground/80 sm:text-lg sm:leading-[1.5]">
          {description}
        </p>
      </div>
    </article>
  );
}
