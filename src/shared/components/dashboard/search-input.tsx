import { Search } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";

interface SearchInputProps extends Omit<ComponentProps<"input">, "type"> {
  label: string;
}

export function SearchInput({ className, label, ...props }: SearchInputProps) {
  return (
    <label className={cn("relative block w-full", className)}>
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        className="h-11 rounded-lg border-border bg-card ps-11 pe-4 text-sm shadow-none placeholder:text-muted-foreground"
        {...props}
      />
    </label>
  );
}
