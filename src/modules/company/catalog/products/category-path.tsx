interface CategoryPathProps {
  segments: string[];
}

export function CategoryPath({ segments }: CategoryPathProps) {
  return (
    <span className="inline-flex flex-wrap items-center gap-0.5 text-sm">
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className="inline-flex items-center gap-0.5">
          <span className="text-primary">{segment}</span>
          {index < segments.length - 1 && (
            <span className="select-none text-muted-foreground">{" >"}</span>
          )}
        </span>
      ))}
    </span>
  );
}
