import { Star } from 'lucide-react';
import useWatchlist from '../hooks/useWatchlist.js';

export default function WatchlistButton({ asset, compact = false }) {
  const { isWatched, toggleAsset } = useWatchlist();
  const watched = isWatched(asset);

  return (
    <button
      type="button"
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-md border transition ${
        watched
          ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-600 dark:bg-amber-950/50 dark:text-amber-200'
          : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300'
      } ${compact ? 'h-9 w-9' : 'px-3 py-2 text-sm font-medium'}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleAsset(asset);
      }}
      title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <Star className={`h-4 w-4 ${watched ? 'fill-current' : ''}`} aria-hidden="true" />
      {!compact ? <span>{watched ? 'Watching' : 'Watch'}</span> : null}
    </button>
  );
}
