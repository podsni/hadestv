import { FEATURED_CATEGORIES } from "@/lib/featured";

export function CategoryChips({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <div className="-mx-3 overflow-x-auto px-3 md:mx-0 md:px-0">
      <div className="flex gap-2 pb-1">
        {FEATURED_CATEGORIES.map(cat => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background hover:border-primary/40 hover:bg-accent"
              }`}
              aria-pressed={isActive}
            >
              <span aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
