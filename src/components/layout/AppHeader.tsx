import { CheckCircle2, ShieldCheck, Tv } from "lucide-react";

import type { ChannelCatalog } from "@/lib/iptv";

export function AppHeader({ catalog }: { catalog: ChannelCatalog }) {
  return (
    <header className="border-b border-border/80 bg-sidebar/95">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Tv className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-normal">HadesTV</h1>
            <p className="text-sm text-muted-foreground">Streaming TV publik tanpa login, berbasis iptv-org.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            {catalog.safety.blocked + catalog.safety.nsfw} disaring
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
            {catalog.stats.totalChannels} channel
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            {catalog.stats.secureStreams} HTTPS stream
          </span>
        </div>
      </div>
    </header>
  );
}
