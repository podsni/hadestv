import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type SearchableOption = {
  value: string;
  label: string;
  hint?: string;
};

export function SearchableSelect({
  value,
  placeholder,
  icon,
  options,
  onChange,
  emptyLabel = "Tidak ada hasil",
  maxHeight = 320,
  allLabel,
}: {
  value: string;
  placeholder: string;
  icon?: React.ReactNode;
  options: SearchableOption[];
  onChange: (value: string) => void;
  emptyLabel?: string;
  maxHeight?: number;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      // Focus the search input after the popover opens
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
    return undefined;
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return options;
    }
    const needle = query.toLowerCase();
    return options.filter(
      option =>
        option.label.toLowerCase().includes(needle) ||
        option.value.toLowerCase().includes(needle) ||
        option.hint?.toLowerCase().includes(needle),
    );
  }, [options, query]);

  const selected = options.find(option => option.value === value);

  function selectOption(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(open => !open)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
          "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "md:h-11",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="truncate text-left">
            {selected ? selected.label : <span className="text-muted-foreground">{placeholder}</span>}
          </span>
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover shadow-lg"
          role="listbox"
        >
          <div className="sticky top-0 border-b border-border bg-popover p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={event => {
                  const next = event.target.value;
                  if (debounceRef.current) {
                    window.clearTimeout(debounceRef.current);
                  }
                  debounceRef.current = window.setTimeout(() => {
                    setQuery(next);
                  }, 80);
                }}
                placeholder="Cari..."
                className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                onKeyDown={event => {
                  if (event.key === "Escape") {
                    setOpen(false);
                    setQuery("");
                  } else if (event.key === "Enter" && filtered.length > 0) {
                    selectOption(filtered[0].value);
                  }
                }}
              />
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight }}>
            {allLabel ? (
              <button
                type="button"
                onClick={() => selectOption("")}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
                  !value && "bg-accent/50 font-medium",
                )}
              >
                <span className="flex-1 truncate">{allLabel}</span>
                {!value ? <Check className="size-4 text-primary" /> : null}
              </button>
            ) : null}
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyLabel}</div>
            ) : (
              filtered.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectOption(option.value)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
                    option.value === value && "bg-accent/50 font-medium",
                  )}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.value === value ? <Check className="size-4 shrink-0 text-primary" /> : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
