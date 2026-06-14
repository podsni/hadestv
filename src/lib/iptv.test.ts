import { describe, expect, test } from "bun:test";
import { buildChannelCatalog, filterChannels, getFacetOptions } from "./iptv";

const channels = [
  {
    id: "NewsNow.us",
    name: "News Now",
    country: "US",
    categories: ["news"],
    is_nsfw: false,
  },
  {
    id: "Blocked.us",
    name: "Blocked Channel",
    country: "US",
    categories: ["general"],
    is_nsfw: false,
  },
  {
    id: "Adult.us",
    name: "Adult Channel",
    country: "US",
    categories: ["xxx"],
    is_nsfw: true,
  },
  {
    id: "NoStream.id",
    name: "No Stream",
    country: "ID",
    categories: ["general"],
    is_nsfw: false,
  },
];

const streams = [
  {
    channel: "NewsNow.us",
    title: "News Now HD",
    url: "https://example.com/news.m3u8",
    quality: "720p",
    label: null,
    user_agent: null,
    referrer: null,
  },
  {
    channel: "Blocked.us",
    title: "Blocked",
    url: "https://example.com/blocked.m3u8",
    quality: "480p",
    label: null,
    user_agent: null,
    referrer: null,
  },
];

describe("iptv catalog", () => {
  test("builds a public catalog without blocklisted, nsfw, or streamless channels", () => {
    const catalog = buildChannelCatalog({
      channels,
      streams,
      logos: [{ channel: "NewsNow.us", url: "https://example.com/logo.png", in_use: true }],
      countries: [{ code: "US", name: "United States", flag: "🇺🇸", languages: ["eng"] }],
      categories: [{ id: "news", name: "News" }],
      languages: [{ code: "eng", name: "English" }],
      blocklist: [{ channel: "Blocked.us", reason: "dmca" }],
      limit: 20,
    });

    expect(catalog.channels).toHaveLength(1);
    expect(catalog.channels[0]).toMatchObject({
      id: "NewsNow.us",
      name: "News Now",
      countryName: "United States",
      countryFlag: "🇺🇸",
      categoryNames: ["News"],
      languageNames: ["English"],
      logo: "https://example.com/logo.png",
      streamCount: 1,
    });
    expect(catalog.safety.blocked).toBe(1);
    expect(catalog.safety.nsfw).toBe(1);
    expect(catalog.safety.streamless).toBe(1);
  });

  test("filters by query, country, category, language, and favorites", () => {
    const catalog = buildChannelCatalog({
      channels,
      streams,
      countries: [{ code: "US", name: "United States", flag: "🇺🇸", languages: ["eng"] }],
      categories: [{ id: "news", name: "News" }],
      languages: [{ code: "eng", name: "English" }],
      blocklist: [{ channel: "Blocked.us", reason: "dmca" }],
      limit: 20,
    });

    expect(filterChannels(catalog.channels, { query: "news", country: "US", category: "news", language: "eng" })).toHaveLength(1);
    expect(filterChannels(catalog.channels, { query: "music" })).toHaveLength(0);
    expect(filterChannels(catalog.channels, { favoritesOnly: true, favoriteIds: new Set(["NewsNow.us"]) })).toHaveLength(1);
    expect(filterChannels(catalog.channels, { favoritesOnly: true, favoriteIds: new Set() })).toHaveLength(0);
  });

  test("builds sorted unique facet options", () => {
    const catalog = buildChannelCatalog({
      channels,
      streams,
      countries: [{ code: "US", name: "United States", flag: "🇺🇸", languages: ["eng"] }],
      categories: [{ id: "news", name: "News" }],
      languages: [{ code: "eng", name: "English" }],
      blocklist: [{ channel: "Blocked.us", reason: "dmca" }],
      limit: 20,
    });

    expect(getFacetOptions(catalog.channels)).toEqual({
      countries: [{ code: "US", name: "United States", flag: "🇺🇸" }],
      categories: [{ id: "news", name: "News" }],
      languages: [{ code: "eng", name: "English" }],
    });
  });

  test("prioritizes more compatible streams and exposes a default channel", () => {
    const catalog = buildChannelCatalog({
      channels: [
        {
          id: "Risky.us",
          name: "Risky First",
          country: "US",
          categories: ["news"],
          is_nsfw: false,
        },
        {
          id: "Stable.us",
          name: "Stable TV",
          country: "US",
          categories: ["news"],
          is_nsfw: false,
        },
      ],
      streams: [
        {
          channel: "Risky.us",
          title: "Risky HTTP",
          url: "http://example.com/risky.m3u8",
          quality: "1080p",
          label: "Geo-blocked",
          user_agent: null,
          referrer: null,
        },
        {
          channel: "Stable.us",
          title: "Stable HTTPS",
          url: "https://example.com/stable.m3u8",
          quality: "720p",
          label: null,
          user_agent: null,
          referrer: null,
        },
        {
          channel: "Stable.us",
          title: "Stable Lower",
          url: "https://example.com/stable-low.m3u8",
          quality: "360p",
          label: "Not 24/7",
          user_agent: null,
          referrer: null,
        },
      ],
      countries: [{ code: "US", name: "United States", flag: "🇺🇸", languages: ["eng"] }],
      categories: [{ id: "news", name: "News" }],
      languages: [{ code: "eng", name: "English" }],
      blocklist: [],
      limit: 20,
    });

    expect(catalog.defaultChannelId).toBe("Stable.us");
    expect(catalog.channels[0]?.id).toBe("Stable.us");
    expect(catalog.channels[0]?.streams.map(stream => stream.title)).toEqual(["Stable HTTPS", "Stable Lower"]);
    expect(catalog.channels[0]?.streams[0]).toMatchObject({
      isSecure: true,
      isGeoBlocked: false,
      compatibility: "best",
    });
    expect(catalog.stats.secureStreams).toBe(2);
    expect(catalog.stats.limitedStreams).toBe(2);
  });
});
