interface AboutVisualProps {
  placeholderLabel: string;
}

export function AboutVisual({ placeholderLabel }: AboutVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[576px] md:max-w-none">
      <div className="overflow-hidden rounded-[18px] border border-border/70 bg-card shadow-[0_20px_70px_-46px_rgba(4,2,2,0.18)]">
        <div className="flex h-[280px] flex-col justify-between bg-linear-to-br from-card via-accent/30 to-background p-5 sm:h-[320px] sm:p-6 lg:h-[340px]">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-3 w-16 rounded-full bg-primary/35" />
              <div className="h-2.5 w-28 rounded-full bg-muted" />
            </div>

            <div className="flex gap-1.5">
              <span className="size-2 rounded-full bg-primary/30" />
              <span className="size-2 rounded-full bg-muted" />
              <span className="size-2 rounded-full bg-muted" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="rounded-[16px] bg-card p-4 shadow-[0_14px_34px_-28px_rgba(4,2,2,0.22)]">
                <div className="mb-4 h-3 w-24 rounded-full bg-primary/25" />
                <div className="flex h-20 items-end gap-2">
                  <span className="h-6 w-5 rounded-t-full bg-primary/20" />
                  <span className="h-9 w-5 rounded-t-full bg-primary/35" />
                  <span className="h-12 w-5 rounded-t-full bg-primary/45" />
                  <span className="h-16 w-5 rounded-t-full bg-primary/60" />
                  <span className="h-11 w-5 rounded-t-full bg-primary/30" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="h-18 rounded-[16px] bg-card shadow-[0_14px_34px_-28px_rgba(4,2,2,0.22)]" />
                <div className="h-18 rounded-[16px] bg-card shadow-[0_14px_34px_-28px_rgba(4,2,2,0.22)]" />
                <div className="h-18 rounded-[16px] bg-card shadow-[0_14px_34px_-28px_rgba(4,2,2,0.22)]" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-24 rounded-[16px] bg-card shadow-[0_14px_34px_-28px_rgba(4,2,2,0.22)]" />
              <div className="h-24 rounded-[16px] bg-card shadow-[0_14px_34px_-28px_rgba(4,2,2,0.22)]" />
              <div className="flex h-24 items-center justify-center rounded-[16px] border border-dashed border-primary/30 bg-primary/5 px-4 text-center text-sm font-medium text-primary">
                {placeholderLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
