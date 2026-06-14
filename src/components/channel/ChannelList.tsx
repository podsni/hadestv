import { Heart, Loader2, Search } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { PublicChannel } from "@/lib/iptv";
import { ChannelLogo } from "./ChannelLogo";

export function ChannelList({
  channels,
  selectedId,
  favoriteIds,
  isLoading,
  favoritesOnly,
  hasMore,
  nextBatchCount,
  onSelect,
  onShowMore,
}: {
  channels: PublicChannel[];
  selectedId: string | null;
  favoriteIds: Set<string>;
  isLoading: boolean;
  favoritesOnly: boolean;
  hasMore: boolean;
  nextBatchCount: number;
  onSelect: (channel: PublicChannel) => void;
  onShowMore: () => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5 md:px-4 md:py-3">
        <h2 className="text-sm font-semibold md:text-base">Daftar channel</h2>
        {isLoading ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Memuat" /> : null}
      </div>

      <div className="max-h-[500px] overflow-y-auto p-1.5 md:max-h-[640px] md:p-2">
        {isLoading ? (
          <ChannelSkeleton />
        ) : channels.length > 0 ? (
          <>
            {channels.map(channel => (
              <button
                key={channel.id}
                type="button"
                onClick={() => onSelect(channel)}
                className={`flex w-full items-center gap-2.5 rounded-md p-2.5 text-left transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:gap-3 md:p-3 ${
                  selectedId === channel.id ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <ChannelLogo channel={channel} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{channel.name}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground md:gap-1.5">
                    <span className="shrink-0">{channel.countryFlag || "-"}</span>
                    <span className="truncate">{channel.countryName}</span>
                    <span aria-hidden="true">•</span>
                    <span className="truncate">{channel.categoryNames[0] ?? "General"}</span>
                    {channel.streamCount > 1 ? (
                      <>
                        <span aria-hidden="true">•</span>
                        <span>{channel.streamCount}</span>
                      </>
                    ) : null}
                  </span>
                </span>
                {favoriteIds.has(channel.id) ? <Heart className="size-4 shrink-0 fill-current text-primary" aria-hidden="true" /> : null}
              </button>
            ))}

            {hasMore ? (
              <div className="border-t border-border p-1.5 md:p-2">
                <Button type="button" variant="outline" className="w-full text-sm" onClick={onShowMore}>
                  Tampilkan {nextBatchCount} lagi
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            icon={<Search className="size-5" aria-hidden="true" />}
            title={favoritesOnly ? "Favorit masih kosong" : "Channel tidak ditemukan"}
            body={
              favoritesOnly
                ? "Tandai channel dengan tombol hati agar muncul di sini."
                : "Coba kata kunci lain atau reset filter negara, kategori, dan bahasa."
            }
          />
        )}
      </div>
    </section>
  );
}

function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="grid min-h-44 place-items-center px-4 py-8 text-center">
      <div className="max-w-xs">
        <div className="mx-auto mb-3 grid size-11 place-items-center rounded-lg bg-secondary text-secondary-foreground">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function ChannelSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-md p-3">
          <div className="size-11 animate-pulse rounded-md bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
