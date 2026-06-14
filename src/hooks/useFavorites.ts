import { useEffect, useState } from "react";

const FAVORITES_KEY = "hadestv:favorites";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => readFavorites());

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favoriteIds]));
  }, [favoriteIds]);

  function toggleFavorite(channelId: string) {
    setFavoriteIds(current => {
      const next = new Set(current);
      if (next.has(channelId)) {
        next.delete(channelId);
      } else {
        next.add(channelId);
      }
      return next;
    });
  }

  return {
    favoriteIds,
    toggleFavorite,
  };
}

function readFavorites() {
  if (typeof localStorage === "undefined") {
    return new Set<string>();
  }

  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}
