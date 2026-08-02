interface StatisticCardProps {
  label: string;
  value: string;
}

export function StatisticCard({
  label,
  value,
}: StatisticCardProps) {
  const hasPercentSuffix = value.endsWith("%");
  const hasPlusPrefix = value.startsWith("+");
  const numericValue = hasPercentSuffix ? value.slice(0, -1) : value;
  const digits = hasPlusPrefix ? numericValue.slice(1) : numericValue;

  return (
    <article className="flex flex-col items-center gap-3 text-center">
      <p className="text-[clamp(2rem,3.4vw,3rem)] leading-none font-bold text-foreground">
        {hasPlusPrefix ? <span className="text-primary">+</span> : null}
        <span>{digits}</span>
        {hasPercentSuffix ? <span className="text-primary">%</span> : null}
      </p>

      <p className="max-w-[220px] text-[clamp(0.875rem,1.2vw,1rem)] font-medium text-foreground">
        {label}
      </p>
    </article>
  );
}
