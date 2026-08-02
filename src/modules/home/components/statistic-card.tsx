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
      <p className="text-display-md leading-none font-bold text-foreground sm:text-display-lg">
        {hasPlusPrefix ? <span className="text-primary">+</span> : null}
        <span>{digits}</span>
        {hasPercentSuffix ? <span className="text-primary">%</span> : null}
      </p>

      <p className="max-w-[220px] text-sm font-medium text-foreground sm:text-md">
        {label}
      </p>
    </article>
  );
}
