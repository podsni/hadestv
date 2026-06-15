import { type LucideIcon, Tv } from "lucide-react";

import { ChannelLogo } from "@/components/channel/ChannelLogo";
import type { PublicChannel } from "@/lib/iptv";

export function CategoryShelf({
  title,
  subtitle,
  icon: Icon = Tv,
  channels,
  onSelect,
  accentClass = "from-primary/10 via-card to-card",
  iconClass = "bg-primary text-primary-foreground",
  max,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  channels: PublicChannel[];
  onSelect: (channel: PublicChannel) => void;
  accentClass?: string;
  iconClass?: string;
  max?: number;
}) {
  if (channels.length === 0) return null;

  const visible = max ? channels.slice(0, max) : channels;

  return (
    <section
      className={`rounded-lg border border-border bg-gradient-to-br ${accentClass} p-3 shadow-sm md:p-4`}
    >
      <div className="mb-2.5 flex items-center justify-between md:mb-3">
        <div className="flex items-center gap-2">
          <div className={`grid size-7 place-items-center rounded-md md:size-8 ${iconClass}`}>
            <Icon className="size-3.5 md:size-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight md:text-base">{title}</h2>
            {subtitle ? (
              <p className="hidden text-xs text-muted-foreground sm:block">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{channels.length} channel</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6">
        {visible.map(channel => (
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
