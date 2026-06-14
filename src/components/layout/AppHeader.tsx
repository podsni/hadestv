import { CheckCircle2, ShieldCheck, Tv } from "lucide-react";

import type { ChannelCatalog } from "@/lib/iptv";

export function AppHeader({ catalog }: { catalog: ChannelCatalog }) {
  return (
    <header className="border-b border-border/80 bg-sidebar/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-3 py-4 md:gap-5 md:px-6 md:py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground md:size-11">
            <Tv className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-normal md:text-xl">HadesTV</h1>
            <p className="text-xs text-muted-foreground md:text-sm">Streaming TV publik tanpa login, berbasis iptv-org.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 md:gap-2 md:px-3 md:py-2">
            <ShieldCheck className="size-3.5 text-primary md:size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{catalog.safety.blocked + catalog.safety.nsfw} disaring</span>
            <span className="sm:hidden">{catalog.safety.blocked + catalog.safety.nsfw}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 md:gap-2 md:px-3 md:py-2">
            <CheckCircle2 className="size-3.5 text-emerald-500 md:size-4" aria-hidden="true" />
            {catalog.stats.totalChannels} <span className="hidden xs:inline">channel</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            {catalog.stats.secureStreams} HTTPS
          </span>
        </div>
      </div>
    </header>
  );
}
