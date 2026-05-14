import { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { getCryptoMarketData } from '../api/coingecko.js';
import { getStockQuote } from '../api/finnhub.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loader from '../components/Loader.jsx';
import PriceCard from '../components/PriceCard.jsx';
import useWatchlist from '../hooks/useWatchlist.js';
import { formatCompactNumber, formatCurrency } from '../utils/formatters.js';

function getErrorMessage(results) {
  return results.find((result) => result.status === 'rejected')?.reason?.message || '';
}

export default function Watchlist() {
  const { watchlist } = useWatchlist();
  const [stockQuotes, setStockQuotes] = useState([]);
  const [cryptoMarkets, setCryptoMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const stockItems = useMemo(() => watchlist.filter((item) => item.type === 'stock'), [watchlist]);
  const cryptoItems = useMemo(() => watchlist.filter((item) => item.type === 'crypto'), [watchlist]);

  useEffect(() => {
    let active = true;

    async function loadWatchlistPrices() {
      if (!watchlist.length) {
        setStockQuotes([]);
        setCryptoMarkets([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      const [stockResults, cryptoResult] = await Promise.allSettled([
        Promise.allSettled(stockItems.map((item) => getStockQuote(item.id))),
        cryptoItems.length ? getCryptoMarketData(cryptoItems.map((item) => item.id)) : Promise.resolve([]),
      ]);

      if (!active) {
        return;
      }

      if (stockResults.status === 'fulfilled') {
        setStockQuotes(stockResults.value.filter((result) => result.status === 'fulfilled').map((result) => result.value));
        const stockError = getErrorMessage(stockResults.value);
        if (stockError) {
          setError(stockError);
        }
      } else {
        setError(stockResults.reason?.message || 'Unable to load stock watchlist');
      }

      if (cryptoResult.status === 'fulfilled') {
        setCryptoMarkets(cryptoResult.value);
      } else {
        setError((current) => current || cryptoResult.reason?.message || 'Unable to load crypto watchlist');
      }

      setLoading(false);
    }

    loadWatchlistPrices();

    return () => {
      active = false;
    };
  }, [cryptoItems, stockItems, watchlist.length]);

  const stockQuoteMap = useMemo(() => new Map(stockQuotes.map((quote) => [quote.symbol, quote])), [stockQuotes]);
  const cryptoMap = useMemo(() => new Map(cryptoMarkets.map((coin) => [coin.id, coin])), [cryptoMarkets]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-surface-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Star className="h-5 w-5 fill-current" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Watchlist</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{watchlist.length} saved asset{watchlist.length === 1 ? '' : 's'}</p>
          </div>
        </div>
      </section>

      {loading ? <Loader label="Loading watchlist prices" /> : null}
      {error ? <ErrorMessage compact title="Watchlist prices partially unavailable" message={error} /> : null}

      {!watchlist.length ? (
        <div className="panel rounded-lg p-8 text-center">
          <p className="text-lg font-semibold text-slate-950 dark:text-white">No saved assets</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use the star button on stock or crypto cards to add assets here.</p>
        </div>
      ) : null}

      {stockItems.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Stocks</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stockItems.map((item) => {
              const quote = stockQuoteMap.get(item.id);
              return (
                <PriceCard
                  key={`${item.type}:${item.id}`}
                  title={item.symbol}
                  subtitle={item.name}
                  price={quote?.current}
                  percentChange={quote?.percentChange}
                  to={`/asset/stock/${item.id}`}
                  asset={item}
                  stats={[
                    { label: 'Open', value: formatCurrency(quote?.open) },
                    { label: 'High', value: formatCurrency(quote?.high) },
                  ]}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {cryptoItems.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Crypto</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cryptoItems.map((item) => {
              const coin = cryptoMap.get(item.id);
              return (
                <PriceCard
                  key={`${item.type}:${item.id}`}
                  title={coin?.name ?? item.name}
                  subtitle={coin?.symbol?.toUpperCase() ?? item.symbol}
                  price={coin?.current_price}
                  percentChange={coin?.price_change_percentage_24h}
                  to={`/asset/crypto/${item.id}`}
                  asset={item}
                  stats={[
                    { label: 'Market Cap', value: formatCompactNumber(coin?.market_cap) },
                    { label: 'Volume', value: formatCompactNumber(coin?.total_volume) },
                  ]}
                />
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
