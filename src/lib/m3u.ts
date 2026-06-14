/**
 * Lightweight M3U / M3U8 parser for Free-TV/IPTV style playlists.
 */

export type ParsedM3uEntry = {
  channel: {
    id: string;
    name: string;
    country: string | null;
    logo: string | null;
    categories: string[];
  };
  stream: {
    url: string;
    quality: string | null;
    title: string;
    userAgent: string | null;
    referrer: string | null;
  };
};

const ATTR_REGEX = /([a-zA-Z-]+)="([^"]*)"/g;

function parseAttributes(line: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  let match: RegExpExecArray | null;
  ATTR_REGEX.lastIndex = 0;
  while ((match = ATTR_REGEX.exec(line)) !== null) {
    attrs[match[1].toLowerCase()] = match[2];
  }
  return attrs;
}

function slugifyChannelId(country: string | null, name: string): string {
  const safe = name
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  const suffix = country ? country.toUpperCase() : "ZZ";
  return `${safe || "channel"}.${suffix}`;
}

export function parseM3u(playlist: string): ParsedM3uEntry[] {
  const lines = playlist.split(/\r?\n/);
  const entries: ParsedM3uEntry[] = [];
  let pending: ParsedM3uEntry | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("#EXTM3U")) continue;

    if (line.startsWith("#EXTINF")) {
      const attrs = parseAttributes(line);
      const commaIdx = line.lastIndexOf(",");
      const displayName = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : attrs["tvg-name"] ?? "Unknown";

      const country = (attrs["tvg-country"] ?? "").toUpperCase() || null;
      const logo = attrs["tvg-logo"] ?? null;
      const tvgId = attrs["tvg-id"] ?? "";
      const id = tvgId ? tvgId.replace(/\s+/g, "") : slugifyChannelId(country, displayName);
      const groupTitle = attrs["group-title"] ?? "";
      const categories = groupTitle ? [groupTitle.toLowerCase().replace(/\s+/g, "_")] : ["general"];

      pending = {
        channel: { id, name: displayName, country, logo, categories },
        stream: { url: "", quality: null, title: displayName, userAgent: null, referrer: null },
      };
      continue;
    }

    if (line.startsWith("#")) continue;

    if (pending) {
      const isPlayable =
        line.startsWith("http") &&
        !line.includes("youtube.com") &&
        !line.includes("youtu.be") &&
        !line.includes("twitch.tv");
      if (isPlayable) {
        pending.stream.url = line;
        entries.push(pending);
      }
      pending = null;
    }
  }

  return entries;
}
