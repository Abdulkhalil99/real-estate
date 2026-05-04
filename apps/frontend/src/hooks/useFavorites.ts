'use client';
import { useState, useEffect } from 'react';

const KEY = 'estatehub_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (ids: string[]) => {
    setFavorites(ids);
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  };

  const toggle = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    save(updated);
    return !favorites.includes(id); // returns true if added
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const clear = () => save([]);

  return { favorites, toggle, isFavorite, clear };
}
