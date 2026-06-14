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
import { parseM3u, type ParsedM3uEntry } from "../lib/m3u";

const IPTV_API_BASE = process.env.IPTV_API_BASE ?? "https://iptv-org.github.io/api";
const FREE_TV_PLAYLIST = process.env.FREE_TV_PLAYLIST ?? "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8";
const CACHE_TTL_MS = Number(process.env.CHANNEL_CACHE_TTL_MS ?? 1000 * 60 * 30);
const DEFAULT_CHANNEL_LIMIT = Number(process.env.CHANNEL_LIMIT ?? 2000);
const PRIORITY_COUNTRIES = ["ID", "MY", "SG", "TH", "PH", "VN", "BN"]; // Southeast Asia priority

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

  // Fetch iptv-org and Free-TV in parallel; Free-TV is best-effort.
  const [iptvData, freeTvPlaylist] = await Promise.all([
    Promise.all([
      fetchIptvJson<RawChannel[]>("channels.json"),
      fetchIptvJson<RawStream[]>("streams.json"),
      fetchIptvJson<RawLogo[]>("logos.json"),
      fetchIptvJson<RawCountry[]>("countries.json"),
      fetchIptvJson<RawCategory[]>("categories.json"),
      fetchIptvJson<RawLanguage[]>("languages.json"),
      fetchIptvJson<RawBlocklistEntry[]>("blocklist.json"),
    ]).catch(err => {
      console.error("[catalog] iptv-org fetch failed:", err);
      throw err;
    }),
    fetchFreeTvPlaylist().catch(err => {
      console.warn("[catalog] Free-TV playlist failed:", err);
      return null;
    }),
  ]);

  const [channels, streams, logos, countries, categories, languages, blocklist] = iptvData;
  const freeTvEntries = freeTvPlaylist ? parseM3u(freeTvPlaylist) : [];

  // Merge Free-TV: add any channels (and their streams) that aren't already present
  const existingIds = new Set(channels.map(ch => ch.id));
  const { extraChannels, extraStreams, extraLogos } = mergeFreeTv(freeTvEntries, existingIds);

  const payload = buildChannelCatalog({
    channels: [...channels, ...extraChannels],
    streams: [...streams, ...extraStreams],
    logos: [...logos, ...extraLogos],
    countries,
    categories,
    languages,
    blocklist,
    priorityCountries: PRIORITY_COUNTRIES,
  });

  channelCache = {
    expiresAt: now + CACHE_TTL_MS,
    payload,
  };

  return sliceCatalog(payload, safeLimit, query);
}

function mergeFreeTv(entries: ParsedM3uEntry[], existingIds: Set<string>) {
  const extraChannels: RawChannel[] = [];
  const extraStreams: RawStream[] = [];
  const extraLogos: RawLogo[] = [];
  const seenInFreeTv = new Set<string>();

  for (const entry of entries) {
    const { channel, stream } = entry;
    if (existingIds.has(channel.id) || seenInFreeTv.has(channel.id)) continue;
    seenInFreeTv.add(channel.id);

    extraChannels.push({
      id: channel.id,
      name: channel.name,
      country: channel.country,
      categories: channel.categories,
      is_nsfw: false,
    });
    extraStreams.push({
      channel: channel.id,
      title: stream.title,
      url: stream.url,
      quality: null,
      label: "Free-TV",
      user_agent: stream.userAgent,
      referrer: stream.referrer,
    });
    if (channel.logo) {
      extraLogos.push({
        channel: channel.id,
        url: channel.logo,
        in_use: true,
      });
    }
  }

  return { extraChannels, extraStreams, extraLogos };
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

async function fetchFreeTvPlaylist(): Promise<string | null> {
  try {
    const response = await fetch(FREE_TV_PLAYLIST, {
      headers: { Accept: "audio/x-mpegurl, application/vnd.apple.mpegurl, */*" },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}
