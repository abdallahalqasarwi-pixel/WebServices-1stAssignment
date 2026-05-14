import { useCallback, useEffect, useMemo, useState } from 'react';
import { WATCHLIST_STORAGE_KEY } from '../utils/constants.js';

const WATCHLIST_EVENT = 'traderhub:watchlist-change';

function readWatchlist() {
  try {
    const rawValue = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : [];
  } catch {
    return [];
  }
}

function writeWatchlist(nextWatchlist) {
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(nextWatchlist));
  window.dispatchEvent(new Event(WATCHLIST_EVENT));
}

function normalizeAsset(asset) {
  return {
    type: asset.type,
    id: asset.id,
    symbol: asset.symbol ?? asset.id,
    name: asset.name ?? asset.symbol ?? asset.id,
    addedAt: asset.addedAt ?? new Date().toISOString(),
  };
}

function getAssetKey(asset) {
  return `${asset.type}:${asset.id}`.toLowerCase();
}

export default function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => readWatchlist());

  useEffect(() => {
    function handleStorage(event) {
      if (!event.key || event.key === WATCHLIST_STORAGE_KEY) {
        setWatchlist(readWatchlist());
      }
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener(WATCHLIST_EVENT, handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(WATCHLIST_EVENT, handleStorage);
    };
  }, []);

  const keys = useMemo(() => new Set(watchlist.map(getAssetKey)), [watchlist]);

  const addAsset = useCallback((asset) => {
    const normalized = normalizeAsset(asset);
    const targetKey = getAssetKey(normalized);

    setWatchlist((current) => {
      if (current.some((item) => getAssetKey(item) === targetKey)) {
        return current;
      }

      const next = [normalized, ...current];
      writeWatchlist(next);
      return next;
    });
  }, []);

  const removeAsset = useCallback((asset) => {
    const targetKey = getAssetKey(asset);
    setWatchlist((current) => {
      const next = current.filter((item) => getAssetKey(item) !== targetKey);
      writeWatchlist(next);
      return next;
    });
  }, []);

  const toggleAsset = useCallback(
    (asset) => {
      const targetKey = getAssetKey(asset);

      if (keys.has(targetKey)) {
        removeAsset(asset);
        return false;
      }

      addAsset(asset);
      return true;
    },
    [addAsset, keys, removeAsset],
  );

  const isWatched = useCallback((asset) => keys.has(getAssetKey(asset)), [keys]);

  return {
    watchlist,
    addAsset,
    removeAsset,
    toggleAsset,
    isWatched,
  };
}
