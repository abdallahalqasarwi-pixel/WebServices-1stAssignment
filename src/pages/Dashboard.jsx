import { useEffect, useState } from 'react';
import { Activity, BadgeDollarSign, Landmark, Newspaper } from 'lucide-react';
import AssetSearch from '../components/AssetSearch.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loader from '../components/Loader.jsx';
import NewsCard from '../components/NewsCard.jsx';
import PriceCard from '../components/PriceCard.jsx';
import { getCryptoMarketData } from '../api/coingecko.js';
import { getEconomicIndicator } from '../api/fred.js';
import { getStockQuote, getMarketNews } from '../api/finnhub.js';
import { getLatestRates } from '../api/frankfurter.js';
import { FRED_INDICATORS, STOCK_MARKET_NEWS_CATEGORY, TOP_CRYPTO, TOP_STOCKS, USD_RATE_SYMBOLS } from '../utils/constants.js';
import { formatCompactNumber, formatCurrency, formatDate, formatPercent } from '../utils/formatters.js';

function collectErrors(results) {
  return results.filter((result) => result.status === 'rejected').map((result) => result.reason?.message || 'Unknown API error');
}

async function loadEconomicIndicators() {
  const results = [];

  for (const indicator of FRED_INDICATORS) {
    try {
      const value = await getEconomicIndicator(indicator.id);
      results.push({ status: 'fulfilled', value });
    } catch (error) {
      results.push({ status: 'rejected', reason: error });
    }
  }

  return results;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [rates, setRates] = useState(null);
  const [news, setNews] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);

      const [stockResult, cryptoResult, ratesResult, newsResult, indicatorResult] = await Promise.allSettled([
        Promise.allSettled(TOP_STOCKS.map((symbol) => getStockQuote(symbol))),
        getCryptoMarketData(TOP_CRYPTO),
        getLatestRates('USD', USD_RATE_SYMBOLS),
        getMarketNews(STOCK_MARKET_NEWS_CATEGORY),
        loadEconomicIndicators(),
      ]);

      if (!active) {
        return;
      }

      const nextErrors = {};

      if (stockResult.status === 'fulfilled') {
        setStocks(stockResult.value.filter((result) => result.status === 'fulfilled').map((result) => result.value));
        const stockErrors = collectErrors(stockResult.value);
        if (stockErrors.length) {
          nextErrors.stocks = stockErrors[0];
        }
      } else {
        nextErrors.stocks = stockResult.reason?.message;
      }

      if (cryptoResult.status === 'fulfilled') {
        setCrypto(cryptoResult.value);
      } else {
        nextErrors.crypto = cryptoResult.reason?.message;
      }

      if (ratesResult.status === 'fulfilled') {
        setRates(ratesResult.value.rates);
      } else {
        nextErrors.rates = ratesResult.reason?.message;
      }

      if (newsResult.status === 'fulfilled') {
        setNews(newsResult.value.slice(0, 6));
      } else {
        nextErrors.news = newsResult.reason?.message;
      }

      if (indicatorResult.status === 'fulfilled') {
        setIndicators(
          indicatorResult.value
            .filter((result) => result.status === 'fulfilled')
            .map((result) => {
              const meta = FRED_INDICATORS.find((indicator) => indicator.id === result.value.id);
              return { ...result.value, label: meta?.label ?? result.value.id };
            }),
        );
        const indicatorErrors = collectErrors(indicatorResult.value);
        if (indicatorErrors.length) {
          nextErrors.indicators = indicatorErrors[0];
        }
      } else {
        nextErrors.indicators = indicatorResult.reason?.message;
      }

      setErrors(nextErrors);
      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-surface-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-cyan-700 dark:text-cyan-300">Market Overview</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">TraderHub Dashboard</h1>
            </div>
            <div className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {formatDate(new Date())}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Activity className="h-4 w-4" aria-hidden="true" /> Stocks Tracked</p>
              <p className="mt-2 text-2xl font-semibold">{TOP_STOCKS.length}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><BadgeDollarSign className="h-4 w-4" aria-hidden="true" /> FX Base</p>
              <p className="mt-2 text-2xl font-semibold">USD</p>
            </div>
            <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Landmark className="h-4 w-4" aria-hidden="true" /> Macro Series</p>
              <p className="mt-2 text-2xl font-semibold">{FRED_INDICATORS.length}</p>
            </div>
          </div>
        </div>

        <AssetSearch />
      </section>

      {loading ? <Loader label="Loading market data" /> : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Top Stocks</h2>
          {errors.stocks ? <span className="text-sm text-amber-700 dark:text-amber-300">Partial data</span> : null}
        </div>
        {errors.stocks ? <ErrorMessage compact title="Stock quotes unavailable" message={errors.stocks} /> : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stocks.map((quote) => (
            <PriceCard
              key={quote.symbol}
              title={quote.symbol}
              subtitle="US Equity"
              price={quote.current}
              change={quote.change}
              percentChange={quote.percentChange}
              to={`/asset/stock/${quote.symbol}`}
              asset={{ type: 'stock', id: quote.symbol, symbol: quote.symbol, name: quote.symbol }}
              stats={[
                { label: 'Open', value: formatCurrency(quote.open) },
                { label: 'High', value: formatCurrency(quote.high) },
              ]}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Top Crypto</h2>
        {errors.crypto ? <ErrorMessage compact title="Crypto data unavailable" message={errors.crypto} /> : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {crypto.map((coin) => (
            <PriceCard
              key={coin.id}
              title={coin.name}
              subtitle={coin.symbol?.toUpperCase()}
              price={coin.current_price}
              percentChange={coin.price_change_percentage_24h}
              to={`/asset/crypto/${coin.id}`}
              asset={{ type: 'crypto', id: coin.id, symbol: coin.symbol?.toUpperCase(), name: coin.name }}
              stats={[
                { label: 'Market Cap', value: formatCompactNumber(coin.market_cap) },
                { label: 'Volume', value: formatCompactNumber(coin.total_volume) },
              ]}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">USD Exchange Rates</h2>
          {errors.rates ? <div className="mt-3"><ErrorMessage compact title="Rates unavailable" message={errors.rates} /></div> : null}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {USD_RATE_SYMBOLS.map((symbol) => (
              <div key={symbol} className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">USD / {symbol}</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{rates?.[symbol]?.toLocaleString(undefined, { maximumFractionDigits: 4 }) ?? 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Economic Indicators</h2>
          {errors.indicators ? <div className="mt-3"><ErrorMessage compact title="FRED data unavailable" message={errors.indicators} /></div> : null}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {indicators.map((indicator) => (
              <div key={indicator.id} className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">{indicator.label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {indicator.id === 'UNRATE' ? formatPercent(indicator.latest?.value, 1) : formatCompactNumber(indicator.latest?.value)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{indicator.latest?.date ?? 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-cyan-700 dark:text-cyan-300" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Latest Market News</h2>
        </div>
        {errors.news ? <ErrorMessage compact title="Market news unavailable" message={errors.news} /> : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {news.map((article) => (
            <NewsCard key={article.id ?? article.url ?? article.headline} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}
