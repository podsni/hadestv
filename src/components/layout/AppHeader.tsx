import { CheckCircle2, ShieldCheck, Tv } from "lucide-react";

import type { ChannelCatalog } from "@/lib/iptv";

export function AppHeader({ catalog }: { catalog: ChannelCatalog }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-sidebar/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-sidebar/80">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-3 py-3 md:gap-4 md:px-6 md:py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/20 md:size-11">
            <Tv className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-lg font-bold tracking-tight text-transparent md:text-xl">
              HadesTV
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              Streaming TV publik dari seluruh dunia
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1.5 md:gap-2 md:px-3 md:py-1.5">
            <ShieldCheck className="size-3.5 text-primary md:size-4" aria-hidden="true" />
            <span className="font-medium tabular-nums">{catalog.safety.blocked + catalog.safety.nsfw}</span>
            <span className="hidden text-muted-foreground sm:inline">disaring</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1.5 md:gap-2 md:px-3 md:py-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500 md:size-4" aria-hidden="true" />
            <span className="font-medium tabular-nums">{catalog.stats.totalChannels}</span>
            <span className="hidden text-muted-foreground sm:inline">channel</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1.5 md:gap-2 md:px-3 md:py-1.5">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="font-medium tabular-nums">{catalog.stats.secureStreams}</span>
            <span className="hidden text-muted-foreground sm:inline">HTTPS</span>
          </span>
        </div>
      </div>
    </header>
  );
}
