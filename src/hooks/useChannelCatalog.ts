import { useEffect, useState } from "react";

import { fallbackCatalog } from "@/data/fallbackCatalog";
import type { ChannelCatalog } from "@/lib/iptv";

export function useChannelCatalog(limit = 500, query = "") {
  const [catalog, setCatalog] = useState<ChannelCatalog>(fallbackCatalog);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  async function loadCatalog(options: { refresh?: boolean } = {}) {
    try {
      setIsLoadingCatalog(true);
      const response = await fetch(createCatalogUrl({ limit, query, refresh: options.refresh }));
      if (!response.ok) {
        throw new Error("Catalog request failed");
      }
      const payload = (await response.json()) as ChannelCatalog;
      setCatalog(payload);
      setCatalogError(null);
    } catch {
      setCatalog(fallbackCatalog);
      setCatalogError("Data iptv-org belum bisa dimuat. Menampilkan channel fallback untuk demo.");
    } finally {
      setIsLoadingCatalog(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function guardedLoad() {
      try {
        setIsLoadingCatalog(true);
        const response = await fetch(createCatalogUrl({ limit, query }));
        if (!response.ok) {
          throw new Error("Catalog request failed");
        }
        const payload = (await response.json()) as ChannelCatalog;
        if (isMounted) {
          setCatalog(payload);
          setCatalogError(null);
        }
      } catch {
        if (isMounted) {
          setCatalog(fallbackCatalog);
          setCatalogError("Data iptv-org belum bisa dimuat. Menampilkan channel fallback untuk demo.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingCatalog(false);
        }
      }
    }

    guardedLoad();
    return () => {
      isMounted = false;
    };
  }, [limit, query]);

  return {
    catalog,
    catalogError,
    isLoadingCatalog,
    refreshCatalog: () => loadCatalog({ refresh: true }),
  };
}

function createCatalogUrl({ limit, query, refresh }: { limit: number; query: string; refresh?: boolean }) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (query.trim()) {
    params.set("query", query.trim());
  }
  if (refresh) {
    params.set("refresh", "1");
  }
  return `/api/channels?${params.toString()}`;
}
