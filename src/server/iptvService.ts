import {
  buildChannelCatalog,
  type ChannelCatalog,
  type RawBlocklistEntry,
  type RawCategory,
  type RawChannel,
  type RawCountry,
  type RawLanguage,
  type RawLogo,
  type RawStream,
} from "../lib/iptv";

const IPTV_API_BASE = process.env.IPTV_API_BASE ?? "https://iptv-org.github.io/api";
const CACHE_TTL_MS = Number(process.env.CHANNEL_CACHE_TTL_MS ?? 1000 * 60 * 30);
const DEFAULT_CHANNEL_LIMIT = Number(process.env.CHANNEL_LIMIT ?? 1200);

let channelCache: { expiresAt: number; payload: ChannelCatalog } | null = null;

export async function getChannelCatalog({
  limit = DEFAULT_CHANNEL_LIMIT,
  refresh = false,
  query = "",
}: {
  limit?: number;
  refresh?: boolean;
  query?: string;
} = {}) {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 2000)) : DEFAULT_CHANNEL_LIMIT;
  const now = Date.now();

  if (!refresh && channelCache && channelCache.expiresAt > now) {
    return sliceCatalog(channelCache.payload, safeLimit, query);
  }

  const [channels, streams, logos, countries, categories, languages, blocklist] = await Promise.all([
    fetchIptvJson<RawChannel[]>("channels.json"),
    fetchIptvJson<RawStream[]>("streams.json"),
    fetchIptvJson<RawLogo[]>("logos.json"),
    fetchIptvJson<RawCountry[]>("countries.json"),
    fetchIptvJson<RawCategory[]>("categories.json"),
    fetchIptvJson<RawLanguage[]>("languages.json"),
    fetchIptvJson<RawBlocklistEntry[]>("blocklist.json"),
  ]);

  const payload = buildChannelCatalog({
    channels,
    streams,
    logos,
    countries,
    categories,
    languages,
    blocklist,
  });

  channelCache = {
    expiresAt: now + CACHE_TTL_MS,
    payload,
  };

  return sliceCatalog(payload, safeLimit, query);
}

function sliceCatalog(catalog: ChannelCatalog, limit: number, query = ""): ChannelCatalog {
  const normalizedQuery = query.trim().toLowerCase();
  const sourceChannels = normalizedQuery
    ? catalog.channels.filter(channel => channel.name.toLowerCase().includes(normalizedQuery))
    : catalog.channels;
  const channels = sourceChannels.slice(0, limit);
  return {
    ...catalog,
    channels,
    defaultChannelId: channels.some(channel => channel.id === catalog.defaultChannelId) ? catalog.defaultChannelId : channels[0]?.id ?? null,
    stats: {
      ...catalog.stats,
      totalChannels: channels.length,
    },
  };
}

async function fetchIptvJson<T>(path: string): Promise<T> {
  const response = await fetch(`${IPTV_API_BASE}/${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "hadestv/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`iptv-org ${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}
