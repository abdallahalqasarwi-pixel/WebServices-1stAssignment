import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { searchStocks } from '../api/finnhub.js';
import { CRYPTO_LABELS, TOP_CRYPTO } from '../utils/constants.js';
import ErrorMessage from './ErrorMessage.jsx';

export default function AssetSearch() {
  const [query, setQuery] = useState('');
  const [stockResults, setStockResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const cleanQuery = query.trim();

  const cryptoResults = useMemo(() => {
    const lowerQuery = cleanQuery.toLowerCase();

    if (!lowerQuery) {
      return [];
    }

    return TOP_CRYPTO.filter((id) => `${id} ${CRYPTO_LABELS[id]}`.toLowerCase().includes(lowerQuery)).map((id) => ({
      type: 'crypto',
      id,
      symbol: id,
      description: CRYPTO_LABELS[id],
    }));
  }, [cleanQuery]);

  useEffect(() => {
    if (cleanQuery.length < 2) {
      setStockResults([]);
      setError('');
      setLoading(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const results = await searchStocks(cleanQuery);
        setStockResults(
          results
            .filter((result) => result.symbol && result.description)
            .slice(0, 6)
            .map((result) => ({
              type: 'stock',
              id: result.symbol,
              symbol: result.symbol,
              description: result.description,
            })),
        );
      } catch (searchError) {
        setStockResults([]);
        setError(searchError.message);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [cleanQuery]);

  function openAsset(result) {
    setQuery('');
    navigate(`/asset/${result.type}/${result.id}`);
  }

  const hasResults = stockResults.length > 0 || cryptoResults.length > 0;

  return (
    <div className="panel rounded-lg p-4">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="asset-search">
        Asset Search
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
        <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          id="asset-search"
          className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
          placeholder="Search stocks or crypto"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {loading ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Searching...</p> : null}
      {error ? <div className="mt-3"><ErrorMessage compact title="Stock search unavailable" message={error} /></div> : null}

      {cleanQuery.length >= 1 && hasResults ? (
        <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-md border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {[...cryptoResults, ...stockResults].map((result) => (
            <button
              key={`${result.type}:${result.id}`}
              type="button"
              className="focus-ring flex w-full items-center justify-between gap-3 bg-white px-3 py-3 text-left transition hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900"
              onClick={() => openAsset(result)}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-950 dark:text-white">{result.symbol}</span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{result.description}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-xs capitalize text-slate-500 dark:border-slate-700 dark:text-slate-300">
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                {result.type}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
