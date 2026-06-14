import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { ChannelDetails } from "@/components/channel/ChannelDetails";
import { ChannelFilters, createEmptyFilters, type FilterState } from "@/components/channel/ChannelFilters";
import { ChannelList } from "@/components/channel/ChannelList";
import { AppHeader } from "@/components/layout/AppHeader";
import { StreamPlayer } from "@/components/player/StreamPlayer";
import { useChannelCatalog } from "@/hooks/useChannelCatalog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFavorites } from "@/hooks/useFavorites";
import { filterChannels, getFacetOptions, type PublicChannel } from "@/lib/iptv";
import "./index.css";

const CHANNEL_BATCH_SIZE = 80;
const SEARCH_DEBOUNCE_MS = 200;

export function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [filters, setFilters] = useState<FilterState>(() => createEmptyFilters());
  const { catalog, catalogError, isLoadingCatalog, isRetrying, refreshCatalog } = useChannelCatalog(1200);
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
