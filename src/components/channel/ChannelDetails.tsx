import { CalendarDays, Fullscreen, Heart, RefreshCw } from "lucide-react";
import type { MutableRefObject } from "react";

import { Button } from "@/components/ui/button";
import type { PublicChannel } from "@/lib/iptv";
import { ChannelLogo } from "./ChannelLogo";

export function ChannelDetails({
  channel,
  streamIndex,
  isFavorite,
  isRefreshing,
  videoRef,
  onStreamChange,
  onToggleFavorite,
  onRefreshCatalog,
}: {
  channel: PublicChannel | null;
  streamIndex: number;
  isFavorite: boolean;
  isRefreshing: boolean;
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  onStreamChange: (index: number) => void;
  onToggleFavorite: () => void;
  onRefreshCatalog: () => void;
}) {
  if (!channel) {
    return null;
  }

  return (
    <div className="space-y-3 p-3 md:space-y-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ChannelLogo channel={channel} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold md:text-2xl">{channel.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              {channel.countryFlag} {channel.countryName} · {channel.languageNames.slice(0, 2).join(", ") || "Bahasa tidak tersedia"} ·{" "}
              {channel.categoryNames.join(", ") || "Kategori tidak tersedia"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={isFavorite ? "default" : "outline"}
            onClick={onToggleFavorite}
            aria-label={isFavorite ? `Hapus ${channel.name} dari favorit` : `Simpan ${channel.name} ke favorit`}
          >
            <Heart className={isFavorite ? "size-4 fill-current" : "size-4"} aria-hidden="true" />
            <span className="hidden sm:inline">{isFavorite ? "Tersimpan" : "Favorit"}</span>
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => videoRef.current?.requestFullscreen()}>
            <Fullscreen className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Fullscreen</span>
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onRefreshCatalog} disabled={isRefreshing}>
            <RefreshCw className={isRefreshing ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_280px]">
        <div className="rounded-md border border-border bg-background p-3">
          <h3 className="mb-2 text-sm font-medium">Stream alternatif ({channel.streams.length})</h3>
          <div className="flex flex-wrap gap-2">
            {channel.streams.map((stream, index) => (
              <Button
                key={`${stream.url}-${index}`}
                type="button"
                size="sm"
                variant={index === streamIndex ? "default" : "outline"}
                onClick={() => onStreamChange(index)}
                className="flex-col items-start gap-0 px-2 py-1.5 h-auto"
              >
                <span className="text-xs font-semibold">{stream.quality}</span>
                <span className="text-[10px] opacity-70">{stream.compatibility === "best" ? "✓ Optimal" : "⚠ Terbatas"}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-background p-3">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="size-4" aria-hidden="true" />
            Jadwal acara
          </h3>
          <p className="text-xs text-muted-foreground md:text-sm">Jadwal belum tersedia untuk channel ini.</p>
        </div>
      </div>
    </div>
  );
}
