interface CreateRequestStepPanelProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function CreateRequestStepPanel({
  eyebrow,
  title,
  description,
}: CreateRequestStepPanelProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-5 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-normal text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-xl font-bold text-foreground">{title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </section>
  );
}
