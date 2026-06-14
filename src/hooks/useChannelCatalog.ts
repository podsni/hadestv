import { useCallback, useEffect, useRef, useState } from "react";

import { fallbackCatalog } from "@/data/fallbackCatalog";
import type { ChannelCatalog } from "@/lib/iptv";

export function useChannelCatalog(limit = 1200) {
  const [catalog, setCatalog] = useState<ChannelCatalog>(fallbackCatalog);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const requestIdRef = useRef(0);

  const loadCatalog = useCallback(
    async (options: { refresh?: boolean } = {}) => {
      const requestId = ++requestIdRef.current;
      try {
        if (options.refresh) {
          setIsRetrying(true);
        }
        setIsLoadingCatalog(true);
        const response = await fetch(createCatalogUrl({ limit, refresh: options.refresh }), {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Catalog request failed: ${response.status}`);
        }
        const payload = (await response.json()) as ChannelCatalog;
        if (requestId === requestIdRef.current) {
          setCatalog(payload);
          setCatalogError(null);
        }
      } catch (error) {
        if (requestId === requestIdRef.current) {
          console.error("[Catalog] Load failed:", error);
          setCatalog(fallbackCatalog);
          setCatalogError("Data iptv-org belum bisa dimuat. Menampilkan channel fallback untuk demo.");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoadingCatalog(false);
          setIsRetrying(false);
        }
      }
    },
    [limit],
  );

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  return {
    catalog,
    catalogError,
    isLoadingCatalog,
    isRetrying,
    refreshCatalog: () => loadCatalog({ refresh: true }),
  };
}

function createCatalogUrl({ limit, refresh }: { limit: number; refresh?: boolean }) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (refresh) {
    params.set("refresh", "1");
  }
  return `/api/channels?${params.toString()}`;
}
