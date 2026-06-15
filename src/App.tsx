import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Trophy, TrendingUp, Tv } from "lucide-react";

import { CategoryShelf } from "@/components/channel/CategoryShelf";
import { ChannelDetails } from "@/components/channel/ChannelDetails";
import { ChannelFilters, createEmptyFilters, type FilterState } from "@/components/channel/ChannelFilters";
import { ChannelList } from "@/components/channel/ChannelList";
import { AppHeader } from "@/components/layout/AppHeader";
import { StreamPlayer } from "@/components/player/StreamPlayer";
import { useChannelCatalog } from "@/hooks/useChannelCatalog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFavorites } from "@/hooks/useFavorites";
import { FEATURED_CHANNEL_IDS, FINANCE_CHANNEL_IDS, WORLD_CUP_CHANNEL_IDS } from "@/lib/featured";
import { filterChannels, getFacetOptions, type PublicChannel } from "@/lib/iptv";
import "./index.css";

const CHANNEL_BATCH_SIZE = 80;
const SEARCH_DEBOUNCE_MS = 200;

export function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [filters, setFilters] = useState<FilterState>(() => createEmptyFilters());
  const { catalog, catalogError, isLoadingCatalog, isRetrying, refreshCatalog } = useChannelCatalog(2000);
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [streamIndex, setStreamIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(CHANNEL_BATCH_SIZE);

  // Debounce search query so heavy filtering only runs after typing settles.
  // Also pass through useDeferredValue so React can deprioritize the filter render
  // if the user is still typing.
  const debouncedQuery = useDebouncedValue(filters.query, SEARCH_DEBOUNCE_MS);
  const deferredQuery = useDeferredValue(debouncedQuery);

  const channels = catalog.channels;
  const facets = useMemo(() => getFacetOptions(channels), [channels]);
  const filteredChannels = useMemo(
    () =>
      filterChannels(channels, {
        query: deferredQuery,
        country: filters.country,
        category: filters.category,
        language: filters.language,
        favoritesOnly: filters.favoritesOnly,
        favoriteIds,
      }),
    [channels, favoriteIds, deferredQuery, filters.country, filters.category, filters.language, filters.favoritesOnly],
  );
  const visibleChannels = filteredChannels.slice(0, visibleCount);
  const featuredChannels = useMemo(() => {
    const byId = new Map(channels.map(ch => [ch.id, ch]));
    const out: PublicChannel[] = [];
    for (const id of FEATURED_CHANNEL_IDS) {
      const ch = byId.get(id);
      if (ch) out.push(ch);
    }
    return out;
  }, [channels]);
  const worldCupChannels = useMemo(() => {
    const byId = new Map(channels.map(ch => [ch.id, ch]));
    const out: PublicChannel[] = [];
    for (const id of WORLD_CUP_CHANNEL_IDS) {
      const ch = byId.get(id);
      if (ch) out.push(ch);
    }
    return out;
  }, [channels]);
  const financeChannels = useMemo(() => {
    const byId = new Map(channels.map(ch => [ch.id, ch]));
    const out: PublicChannel[] = [];
    for (const id of FINANCE_CHANNEL_IDS) {
      const ch = byId.get(id);
      if (ch) out.push(ch);
    }
    return out;
  }, [channels]);
  const selectedChannel =
    channels.find(channel => channel.id === selectedId) ??
    channels.find(channel => channel.id === catalog.defaultChannelId) ??
    filteredChannels[0] ??
    channels[0] ??
    null;
  const activeStream = selectedChannel?.streams[streamIndex] ?? selectedChannel?.streams[0] ?? null;
  const hasMoreChannels = filteredChannels.length > visibleChannels.length;

  useEffect(() => {
    setVisibleCount(CHANNEL_BATCH_SIZE);
  }, [filters.country, filters.category, filters.language, filters.favoritesOnly, deferredQuery]);

  useEffect(() => {
    setSelectedId(current => {
      if (current && channels.some(channel => channel.id === current)) {
        return current;
      }
      return catalog.defaultChannelId ?? channels[0]?.id ?? null;
    });
  }, [catalog.defaultChannelId, channels]);

  useEffect(() => {
    setStreamIndex(0);
  }, [selectedChannel?.id]);

  function selectChannel(channel: PublicChannel) {
    setSelectedId(channel.id);
    setStreamIndex(0);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppHeader catalog={catalog} />

      <div className="mx-auto grid w-full max-w-[1500px] gap-4 px-3 py-4 md:gap-5 md:px-6 md:py-5 xl:grid-cols-[minmax(360px,420px)_1fr]">
        <aside className="order-2 space-y-3 md:space-y-4 xl:order-1">
          {worldCupChannels.length > 0 && !filters.favoritesOnly && !filters.country && !deferredQuery.trim() ? (
            <CategoryShelf
              title="Piala Dunia ⚽"
              subtitle="Siaran olahraga & liputan turnamen"
              icon={Trophy}
              channels={worldCupChannels}
              onSelect={selectChannel}
              accentClass="from-amber-500/15 via-card to-card"
              iconClass="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30"
              max={10}
            />
          ) : null}
          {featuredChannels.length > 0 && !filters.favoritesOnly && !filters.country && !deferredQuery.trim() ? (
            <CategoryShelf
              title="Channel pilihan dunia"
              subtitle="TV terbaik dari berbagai negara"
              icon={Tv}
              channels={featuredChannels}
              onSelect={selectChannel}
              accentClass="from-primary/10 via-card to-card"
              iconClass="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/30"
              max={12}
            />
          ) : null}
          {financeChannels.length > 0 && !filters.favoritesOnly && !filters.country && !deferredQuery.trim() ? (
            <CategoryShelf
              title="Ekonomi & Finansial"
              subtitle="Bloomberg, CNBC, dan pasar modal"
              icon={TrendingUp}
              channels={financeChannels}
              onSelect={selectChannel}
              accentClass="from-emerald-500/10 via-card to-card"
              iconClass="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30"
              max={8}
            />
          ) : null}
          <ChannelFilters
            filters={filters}
            resultCount={filteredChannels.length}
            visibleCount={visibleChannels.length}
            countries={facets.countries}
            categories={facets.categories}
            languages={facets.languages}
            onFiltersChange={setFilters}
            onReset={() => setFilters(createEmptyFilters())}
          />

          <ChannelList
            channels={visibleChannels}
            selectedId={selectedChannel?.id ?? null}
            favoriteIds={favoriteIds}
            isLoading={isLoadingCatalog}
            favoritesOnly={filters.favoritesOnly}
            hasMore={hasMoreChannels}
            nextBatchCount={Math.min(CHANNEL_BATCH_SIZE, filteredChannels.length - visibleChannels.length)}
            onSelect={selectChannel}
            onShowMore={() => setVisibleCount(count => count + CHANNEL_BATCH_SIZE)}
          />
        </aside>

        <section className="order-1 space-y-3 md:space-y-4 xl:order-2">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <StreamPlayer channel={selectedChannel} stream={activeStream} videoRef={videoRef} />

            {catalogError ? (
              <div className="mx-3 mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100 md:mx-4 md:mt-4">
                {catalogError}
              </div>
            ) : null}

            <ChannelDetails
              channel={selectedChannel}
              streamIndex={streamIndex}
              isFavorite={selectedChannel ? favoriteIds.has(selectedChannel.id) : false}
              isRefreshing={isLoadingCatalog}
              videoRef={videoRef}
              onStreamChange={setStreamIndex}
              onToggleFavorite={() => {
                if (selectedChannel) {
                  toggleFavorite(selectedChannel.id);
                }
              }}
              onRefreshCatalog={refreshCatalog}
            />
          </div>

          <footer className="rounded-lg border border-border bg-sidebar px-4 py-3 text-sm text-muted-foreground">
            Website ini mengindeks stream publik dari iptv-org. Hak siar dan konten tetap milik pemilik masing-masing channel.
            Data yang masuk blocklist atau NSFW disembunyikan sebelum tampil.
          </footer>
        </section>
      </div>
    </main>
  );
}

export default App;
