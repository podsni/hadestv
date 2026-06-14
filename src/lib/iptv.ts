export type RawChannel = {
  id: string;
  name: string;
  country: string | null;
  categories: string[];
  is_nsfw?: boolean;
};

export type RawStream = {
  channel: string | null;
  title: string | null;
  url: string;
  quality: string | null;
  label: string | null;
  user_agent: string | null;
  referrer: string | null;
};

export type RawLogo = {
  channel: string | null;
  url: string;
  in_use?: boolean;
};

export type RawCountry = {
  code: string;
  name: string;
  flag: string;
  languages: string[];
};

export type RawCategory = {
  id: string;
  name: string;
};

export type RawLanguage = {
  code: string;
  name: string;
};

export type RawBlocklistEntry = {
  channel: string;
  reason: string;
};

export type ChannelStream = {
  title: string;
  url: string;
  quality: string;
  label: string | null;
  userAgent: string | null;
  referrer: string | null;
  compatibility: "best" | "limited";
  isSecure: boolean;
  isGeoBlocked: boolean;
  score: number;
};

export type PublicChannel = {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  categoryIds: string[];
  categoryNames: string[];
  languageCodes: string[];
  languageNames: string[];
  logo: string | null;
  streams: ChannelStream[];
  streamCount: number;
};

export type ChannelCatalog = {
  channels: PublicChannel[];
  defaultChannelId: string | null;
  generatedAt: string;
  safety: {
    blocked: number;
    nsfw: number;
    streamless: number;
  };
  stats: {
    totalChannels: number;
    totalStreams: number;
    secureStreams: number;
    limitedStreams: number;
  };
};

export type CatalogInput = {
  channels: RawChannel[];
  streams: RawStream[];
  logos?: RawLogo[];
  countries?: RawCountry[];
  categories?: RawCategory[];
  languages?: RawLanguage[];
  blocklist?: RawBlocklistEntry[];
  limit?: number;
  priorityCountries?: string[];
};

export type ChannelFilters = {
  query?: string;
  country?: string;
  category?: string;
  language?: string;
  favoritesOnly?: boolean;
  favoriteIds?: Set<string>;
};

const FALLBACK_LABEL = "Unknown";

export function buildChannelCatalog(input: CatalogInput): ChannelCatalog {
  const blocklistedIds = new Set((input.blocklist ?? []).map(entry => entry.channel));
  const streamStats = createStreamStats();
  const streamsByChannel = groupStreamsByChannel(input.streams, streamStats);
  const logosByChannel = new Map(
    (input.logos ?? [])
      .filter(logo => logo.channel && logo.url && logo.in_use !== false)
      .map(logo => [logo.channel as string, logo.url]),
  );
  const countriesByCode = new Map((input.countries ?? []).map(country => [country.code, country]));
  const categoriesById = new Map((input.categories ?? []).map(category => [category.id, category]));
  const languagesByCode = new Map((input.languages ?? []).map(language => [language.code, language]));

  let blocked = 0;
  let nsfw = 0;
  let streamless = 0;

  const channels: PublicChannel[] = [];

  for (const channel of input.channels) {
    if (blocklistedIds.has(channel.id)) {
      blocked += 1;
      continue;
    }

    if (channel.is_nsfw) {
      nsfw += 1;
      continue;
    }

    const streams = streamsByChannel.get(channel.id) ?? [];
    if (streams.length === 0) {
      streamless += 1;
      continue;
    }

    const country = channel.country ? countriesByCode.get(channel.country) : undefined;
    const languageCodes = country?.languages ?? [];

    channels.push({
      id: channel.id,
      name: channel.name,
      countryCode: channel.country ?? "",
      countryName: country?.name ?? channel.country ?? FALLBACK_LABEL,
      countryFlag: country?.flag ?? "",
      categoryIds: channel.categories,
      categoryNames: channel.categories.map(categoryId => categoriesById.get(categoryId)?.name ?? titleCase(categoryId)),
      languageCodes,
      languageNames: languageCodes.map(code => languagesByCode.get(code)?.name ?? code),
      logo: logosByChannel.get(channel.id) ?? null,
      streams,
      streamCount: streams.length,
    });

    if (input.limit && channels.length >= input.limit) {
      break;
    }
  }

  const prioritySet = new Set(input.priorityCountries ?? []);
  channels.sort((left, right) => {
    const leftPriority = prioritySet.has(left.countryCode) ? 1 : 0;
    const rightPriority = prioritySet.has(right.countryCode) ? 1 : 0;
    if (leftPriority !== rightPriority) {
      return rightPriority - leftPriority;
    }
    return getChannelScore(right) - getChannelScore(left) || left.name.localeCompare(right.name);
  });

  return {
    channels,
    defaultChannelId: channels[0]?.id ?? null,
    generatedAt: new Date().toISOString(),
    safety: { blocked, nsfw, streamless },
    stats: {
      totalChannels: channels.length,
      totalStreams: streamStats.totalStreams,
      secureStreams: streamStats.secureStreams,
      limitedStreams: streamStats.limitedStreams,
    },
  };
}

export function filterChannels(channels: PublicChannel[], filters: ChannelFilters): PublicChannel[] {
  const query = filters.query?.trim().toLowerCase();
  const hasQuery = !!query;
  const hasCountry = !!filters.country;
  const hasCategory = !!filters.category;
  const hasLanguage = !!filters.language;
  const hasFavoritesOnly = !!filters.favoritesOnly;
  const favoriteIds = filters.favoriteIds;

  // Early-exit when no filter is applied
  if (!hasQuery && !hasCountry && !hasCategory && !hasLanguage && !hasFavoritesOnly) {
    return channels;
  }

  const matches: PublicChannel[] = [];

  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];

    if (hasFavoritesOnly && (!favoriteIds || !favoriteIds.has(channel.id))) {
      continue;
    }

    if (hasCountry && channel.countryCode !== filters.country) {
      continue;
    }

    if (hasCategory && !channel.categoryIds.includes(filters.category!)) {
      continue;
    }

    if (hasLanguage && !channel.languageCodes.includes(filters.language!)) {
      continue;
    }

    if (hasQuery) {
      const haystack = (channel as PublicChannel & { _searchKey?: string })._searchKey ?? buildSearchKey(channel);
      if (!haystack.includes(query)) {
        continue;
      }
    }

    matches.push(channel);
  }

  return matches;
}

let searchKeyCache: WeakMap<PublicChannel, string> | null = null;

function getSearchKeyCache(): WeakMap<PublicChannel, string> {
  if (typeof WeakMap === "undefined") {
    // Fallback for environments without WeakMap
    return {
      get: (obj: PublicChannel) => (obj as PublicChannel & { _searchKey?: string })._searchKey ?? null,
      set: (obj: PublicChannel, key: string) => {
        (obj as PublicChannel & { _searchKey?: string })._searchKey = key;
      },
      has: () => true,
      delete: () => true,
    } as unknown as WeakMap<PublicChannel, string>;
  }
  if (!searchKeyCache) {
    searchKeyCache = new WeakMap();
  }
  return searchKeyCache;
}

function buildSearchKey(channel: PublicChannel): string {
  const key = `${channel.name} ${channel.countryName} ${channel.countryCode} ${channel.categoryNames.join(" ")} ${channel.languageNames.join(" ")}`.toLowerCase();
  getSearchKeyCache().set(channel, key);
  return key;
}

export function getFacetOptions(channels: PublicChannel[]) {
  const countries = new Map<string, { code: string; name: string; flag: string }>();
  const categories = new Map<string, { id: string; name: string }>();
  const languages = new Map<string, { code: string; name: string }>();

  for (const channel of channels) {
    if (channel.countryCode) {
      countries.set(channel.countryCode, {
        code: channel.countryCode,
        name: channel.countryName,
        flag: channel.countryFlag,
      });
    }

    channel.categoryIds.forEach((id, index) => {
      categories.set(id, { id, name: channel.categoryNames[index] ?? titleCase(id) });
    });

    channel.languageCodes.forEach((code, index) => {
      languages.set(code, { code, name: channel.languageNames[index] ?? code });
    });
  }

  return {
    countries: sortByName([...countries.values()]),
    categories: sortByName([...categories.values()]),
    languages: sortByName([...languages.values()]),
  };
}

function groupStreamsByChannel(streams: RawStream[], stats: ReturnType<typeof createStreamStats>) {
  const groups = new Map<string, ChannelStream[]>();

  for (const stream of streams) {
    if (!stream.channel || !stream.url) {
      continue;
    }

    const channelStreams = groups.get(stream.channel) ?? [];
    const normalizedStream = normalizeStream(stream);
    channelStreams.push(normalizedStream);
    channelStreams.sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));
    groups.set(stream.channel, channelStreams);

    stats.totalStreams += 1;
    if (normalizedStream.isSecure) {
      stats.secureStreams += 1;
    }
    if (normalizedStream.compatibility === "limited") {
      stats.limitedStreams += 1;
    }
  }

  return groups;
}

function normalizeStream(stream: RawStream): ChannelStream {
  const label = stream.label;
  const isSecure = stream.url.startsWith("https://");
  const isGeoBlocked = /geo[\s-]?blocked/i.test(label ?? "");
  const isLimited = isGeoBlocked || /not\s*24\/7/i.test(label ?? "") || !isSecure;

  return {
      title: stream.title ?? "Primary stream",
      url: stream.url,
      quality: stream.quality ?? "Auto",
      label,
      userAgent: stream.user_agent,
      referrer: stream.referrer,
      compatibility: isLimited ? "limited" : "best",
      isSecure,
      isGeoBlocked,
      score: scoreStream(stream, { isSecure, isGeoBlocked, isLimited }),
  };
}

function scoreStream(
  stream: RawStream,
  flags: {
    isSecure: boolean;
    isGeoBlocked: boolean;
    isLimited: boolean;
  },
) {
  let score = 0;

  if (flags.isSecure) score += 60;
  if (/\.m3u8($|\?)/i.test(stream.url)) score += 25;
  if (!flags.isLimited) score += 30;
  if (flags.isGeoBlocked) score -= 80;
  if (!flags.isSecure) score -= 30;
  if (/not\s*24\/7/i.test(stream.label ?? "")) score -= 15;
  if (stream.referrer || stream.user_agent) score -= 5;

  const qualityMatch = stream.quality?.match(/(\d{3,4})p/i);
  if (qualityMatch?.[1]) {
    score += Math.min(Number(qualityMatch[1]) / 20, 60);
  }

  return score;
}

function getChannelScore(channel: PublicChannel) {
  const bestStreamScore = channel.streams[0]?.score ?? 0;
  const metadataScore = (channel.logo ? 5 : 0) + (channel.categoryIds.length > 0 ? 2 : 0) + (channel.languageCodes.length > 0 ? 2 : 0);
  return bestStreamScore + metadataScore;
}

function createStreamStats() {
  return {
    totalStreams: 0,
    secureStreams: 0,
    limitedStreams: 0,
  };
}

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sortByName<T extends { name: string }>(items: T[]) {
  return items.sort((left, right) => left.name.localeCompare(right.name));
}
