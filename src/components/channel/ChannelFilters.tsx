import { Globe2, Languages, ListFilter, Search, SlidersHorizontal, Star } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "all";

export type FilterState = {
  query: string;
  country: string;
  category: string;
  language: string;
  favoritesOnly: boolean;
};

export function ChannelFilters({
  filters,
  resultCount,
  visibleCount,
  countries,
  categories,
  languages,
  onFiltersChange,
  onReset,
}: {
  filters: FilterState;
  resultCount: number;
  visibleCount: number;
  countries: { code: string; name: string; flag: string }[];
  categories: { id: string; name: string }[];
  languages: { code: string; name: string }[];
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}) {
  function updateFilter(patch: Partial<FilterState>) {
    onFiltersChange({ ...filters, ...patch });
  }

  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-sm md:p-4">
      <div className="mb-3 flex items-center justify-between gap-2 md:mb-4 md:gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold md:text-base">Cari channel</h2>
          <p className="hidden text-sm text-muted-foreground sm:block">Search, filter, dan favorit lokal.</p>
        </div>
        <Button
          type="button"
          variant={filters.favoritesOnly ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter({ favoritesOnly: !filters.favoritesOnly })}
          aria-pressed={filters.favoritesOnly}
          aria-label={filters.favoritesOnly ? "Tampilkan semua channel" : "Tampilkan hanya favorit"}
        >
          <Star className={filters.favoritesOnly ? "size-4 fill-current" : "size-4"} aria-hidden="true" />
          <span className="hidden sm:inline">Favorit</span>
        </Button>
      </div>

      <div className="space-y-2.5 md:space-y-3">
        <label className="relative block">
          <span className="sr-only">Cari nama channel</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={event => updateFilter({ query: event.target.value })}
            placeholder="Cari channel..."
            className="h-10 pl-9 md:h-11"
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <FilterSelect
            icon={<Globe2 className="size-4" aria-hidden="true" />}
            label="Negara"
            value={filters.country}
            placeholder="Negara"
            options={countries.map(item => ({
              value: item.code,
              label: `${item.flag} ${item.name}`,
            }))}
            onChange={value => updateFilter({ country: value })}
          />
          <FilterSelect
            icon={<ListFilter className="size-4" aria-hidden="true" />}
            label="Kategori"
            value={filters.category}
            placeholder="Kategori"
            options={categories.map(item => ({
              value: item.id,
              label: item.name,
            }))}
            onChange={value => updateFilter({ category: value })}
          />
          <FilterSelect
            icon={<Languages className="size-4" aria-hidden="true" />}
            label="Bahasa"
            value={filters.language}
            placeholder="Bahasa"
            options={languages.map(item => ({
              value: item.code,
              label: item.name,
            }))}
            onChange={value => updateFilter({ language: value })}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground md:mt-4 md:gap-3 md:text-sm">
        <span>
          {resultCount} hasil
          {resultCount > visibleCount ? `, tampil ${visibleCount}` : ""}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
    </section>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value || ALL_VALUE} onValueChange={next => onChange(next === ALL_VALUE ? "" : next)}>
      <SelectTrigger className="h-11 w-full justify-start">
        <span className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="sr-only">{label}</span>
          <SelectValue placeholder={placeholder} />
        </span>
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value={ALL_VALUE}>Semua {label.toLowerCase()}</SelectItem>
        {options.slice(0, 80).map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function createEmptyFilters(): FilterState {
  return {
    query: "",
    country: "",
    category: "",
    language: "",
    favoritesOnly: false,
  };
}
