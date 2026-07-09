interface TimelineStepCardProps {
  description: string;
  title: string;
}

export function TimelineStepCard({
  description,
  title,
}: TimelineStepCardProps) {
  return (
    <article className="rounded-[28px] border-2 border-primary bg-card px-7 py-6 shadow-none">
      <div className="flex flex-col gap-3 text-center">
        <h3 className="text-display-sm font-semibold text-foreground">
          {title}
        </h3>

        <p className="text-lg font-regular leading-[1.5] text-foreground/80">
          {description}
        </p>
      </div>
    </article>
  );
}
