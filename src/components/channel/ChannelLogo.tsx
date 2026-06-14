import { useState } from "react";
import type { PublicChannel } from "@/lib/iptv";

export function ChannelLogo({ channel, size = "md" }: { channel: PublicChannel; size?: "md" | "lg" }) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = size === "lg" ? "size-14" : "size-11";
  const textClass = size === "lg" ? "text-lg" : "text-sm";

  if (channel.logo && !imageError) {
    return (
      <span className={`${sizeClass} grid shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-background`}>
        <img
          src={channel.logo}
          alt=""
          loading="lazy"
          className="max-h-full max-w-full object-contain p-1"
          onError={() => setImageError(true)}
        />
      </span>
    );
  }

  return (
    <span className={`${sizeClass} ${textClass} grid shrink-0 place-items-center rounded-md bg-secondary font-semibold text-secondary-foreground`}>
      {channel.name.slice(0, 2).toUpperCase()}
    </span>
  );
}
