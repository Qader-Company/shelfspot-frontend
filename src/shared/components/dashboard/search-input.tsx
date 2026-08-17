"use client";

import { Search } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";

import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";

import type { DashboardSidebarItem } from "./types";

interface SearchInputProps extends Omit<ComponentProps<"input">, "type"> {
  items?: DashboardSidebarItem[];
  label: string;
  noResultsLabel?: string;
}

export function SearchInput({
  items,
  label,
  placeholder,
  noResultsLabel,
  className,
  value,
  onChange,
  onFocus,
  onKeyDown,
  ...inputProps
}: SearchInputProps) {
  const router = useRouter();
  const isGlobalSearch = items != null;
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const searchableItems = useMemo(
    () =>
      (items ?? [])
        .filter((item) => item.key !== "logout" && !item.disabled)
        .flatMap((item) => [
          { key: item.key, label: item.label, href: item.href },
          ...(item.children ?? []).map((child) => ({
            key: `${item.key}-${child.key}`,
            label: child.label,
            href: child.href,
          })),
        ]),
    [items],
  );

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return searchableItems;
    return searchableItems.filter((item) =>
      item.label.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query, searchableItems]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const selectResult = (index: number) => {
    const result = results[index];
    if (!result) return;
    setIsOpen(false);
    setQuery("");
    router.push(result.href);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <label className="relative block">
        <span className="sr-only">{label}</span>
        <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={isGlobalSearch ? query : value}
          placeholder={placeholder}
          autoComplete="off"
          aria-expanded={isGlobalSearch ? isOpen : undefined}
          aria-controls={
            isGlobalSearch ? "dashboard-global-search-results" : undefined
          }
          className="h-11 rounded-lg border-border bg-card ps-11 pe-4 text-sm shadow-none placeholder:text-muted-foreground"
          onFocus={(event) => {
            onFocus?.(event);
            if (isGlobalSearch) setIsOpen(true);
          }}
          onChange={(event) => {
            onChange?.(event);
            if (isGlobalSearch) {
              setQuery(event.target.value);
              setActiveIndex(0);
              setIsOpen(true);
            }
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || !isGlobalSearch) return;
            if (event.key === "Escape") {
              setIsOpen(false);
              event.currentTarget.blur();
            } else if (event.key === "ArrowDown" && results.length) {
              event.preventDefault();
              setActiveIndex((index) => (index + 1) % results.length);
            } else if (event.key === "ArrowUp" && results.length) {
              event.preventDefault();
              setActiveIndex(
                (index) => (index - 1 + results.length) % results.length,
              );
            } else if (event.key === "Enter" && isOpen && results.length) {
              event.preventDefault();
              selectResult(activeIndex);
            }
          }}
          {...inputProps}
        />
      </label>

      {isGlobalSearch && isOpen ? (
        <div
          id="dashboard-global-search-results"
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 max-h-80 overflow-y-auto rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg"
        >
          {results.length ? (
            <ul aria-label={label}>
              {results.map((item, index) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-10 items-center rounded-lg px-3 text-sm transition-colors hover:bg-muted",
                      index === activeIndex && "bg-muted",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                  >
                    <Search className="me-3 size-4 shrink-0 text-muted-foreground" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              {noResultsLabel}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
