'use client';
import { useState, useEffect } from 'react';
import { authHelper } from '@/lib/auth';

// کلید localStorage به userId وابسته است
// هر یوزر لیست جداگانه دارد
function getKey(): string | null {
  const user = authHelper.getUser();
  if (!user) return null;
  return 'estatehub_favorites_' + user.id;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // لود از localStorage با کلید یوزر
  useEffect(() => {
    const key = getKey();
    if (!key) {
      setFavorites([]);
      return;
    }
    try {
      const stored = localStorage.getItem(key);
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  const save = (ids: string[]) => {
    const key = getKey();
    if (!key) return;
    setFavorites(ids);
    try { localStorage.setItem(key, JSON.stringify(ids)); } catch {}
  };

  const toggle = (id: string): boolean => {
    const key = getKey();
    if (!key) return false;
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    save(updated);
    return !favorites.includes(id);
  };

  const isFavorite = (id: string): boolean => favorites.includes(id);

  const clear = () => save([]);

  return { favorites, toggle, isFavorite, clear };
}
