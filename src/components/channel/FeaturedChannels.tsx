import { Tv } from "lucide-react";

import { ChannelLogo } from "@/components/channel/ChannelLogo";
import type { PublicChannel } from "@/lib/iptv";

export function FeaturedChannels({
  channels,
  onSelect,
}: {
  channels: PublicChannel[];
  onSelect: (channel: PublicChannel) => void;
}) {
  if (channels.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-gradient-to-br from-card via-card to-primary/5 p-3 shadow-sm md:p-4">
      <div className="mb-2.5 flex items-center justify-between md:mb-3">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground md:size-8">
            <Tv className="size-3.5 md:size-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight md:text-base">Channel pilihan</h2>
            <p className="hidden text-xs text-muted-foreground sm:block">TV terbaik dunia & dunia olahraga</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{channels.length} channel</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6">
        {channels.map(channel => (
          <button
            key={channel.id}
            type="button"
            onClick={() => onSelect(channel)}
            className="group flex flex-col items-center gap-1.5 rounded-md border border-transparent bg-background/60 p-2 text-center transition hover:border-primary/40 hover:bg-accent hover:shadow-sm"
            aria-label={`Pilih ${channel.name}`}
          >
            <div className="flex h-12 w-full items-center justify-center">
              <ChannelLogo channel={channel} size="md" />
            </div>
            <span className="line-clamp-2 text-[10px] font-medium leading-tight text-foreground md:text-xs">
              {channel.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
