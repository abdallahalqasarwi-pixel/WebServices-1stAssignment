import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Newspaper, Signal } from 'lucide-react';
import { getDailyTimeSeries, getMacd, getRsi } from '../api/alphaVantage.js';
import { getCryptoChart, getCryptoMarketData } from '../api/coingecko.js';
import { getCompanyNews, getStockQuote } from '../api/finnhub.js';
import Chart from '../components/Chart.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loader from '../components/Loader.jsx';
import NewsCard from '../components/NewsCard.jsx';
import RiskCalculator from '../components/RiskCalculator.jsx';
import WatchlistButton from '../components/WatchlistButton.jsx';
import { CRYPTO_LABELS } from '../utils/constants.js';
import { formatCompactNumber, formatCurrency, formatPercent } from '../utils/formatters.js';

function getRsiStatus(value) {
  if (!Number.isFinite(Number(value))) {
    return 'N/A';
  }

  if (value >= 70) {
    return 'Overbought';
  }

  if (value <= 30) {
    return 'Oversold';
  }

  return 'Neutral';
}

function errorFrom(result) {
  return result.status === 'rejected' ? result.reason?.message || 'Unknown API error' : '';
}

export default function AssetDetails() {
  const { type, id } = useParams();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [rsi, setRsi] = useState(null);
  const [macd, setMacd] = useState(null);
  const [news, setNews] = useState([]);
  const [errors, setErrors] = useState({});

  const normalizedType = type?.toLowerCase();
  const normalizedId = normalizedType === 'stock' ? id?.toUpperCase() : id?.toLowerCase();

  const asset = useMemo(() => {
    if (normalizedType === 'crypto') {
      return {
        type: 'crypto',
        id: normalizedId,
        symbol: marketData?.symbol?.toUpperCase() ?? normalizedId,
        name: marketData?.name ?? CRYPTO_LABELS[normalizedId] ?? normalizedId,
      };
    }

    return {
      type: 'stock',
      id: normalizedId,
      symbol: normalizedId,
      name: normalizedId,
    };
  }, [marketData, normalizedId, normalizedType]);

  useEffect(() => {
    let active = true;

    async function loadStock() {
      const [quoteResult, chartResult, rsiResult, macdResult, newsResult] = await Promise.allSettled([
        getStockQuote(normalizedId),
        getDailyTimeSeries(normalizedId),
        getRsi(normalizedId),
        getMacd(normalizedId),
        getCompanyNews(normalizedId),
      ]);

      if (!active) {
        return;
      }

      setQuote(quoteResult.status === 'fulfilled' ? quoteResult.value : null);
      setChartData(chartResult.status === 'fulfilled' ? chartResult.value : []);
      setRsi(rsiResult.status === 'fulfilled' ? rsiResult.value : null);
      setMacd(macdResult.status === 'fulfilled' ? macdResult.value : null);
      setNews(newsResult.status === 'fulfilled' ? newsResult.value.slice(0, 6) : []);
      setErrors({
        quote: errorFrom(quoteResult),
        chart: errorFrom(chartResult),
        rsi: errorFrom(rsiResult),
        macd: errorFrom(macdResult),
        news: errorFrom(newsResult),
      });
      setLoading(false);
    }

    async function loadCrypto() {
      const [marketResult, chartResult] = await Promise.allSettled([
        getCryptoMarketData([normalizedId]),
        getCryptoChart(normalizedId),
      ]);

      if (!active) {
        return;
      }

      setMarketData(marketResult.status === 'fulfilled' ? marketResult.value[0] : null);
      setChartData(chartResult.status === 'fulfilled' ? chartResult.value : []);
      setErrors({
        market: errorFrom(marketResult),
        chart: errorFrom(chartResult),
      });
      setLoading(false);
    }

    setLoading(true);
    setQuote(null);
    setMarketData(null);
    setChartData([]);
    setRsi(null);
    setMacd(null);
    setNews([]);
    setErrors({});

    if (normalizedType === 'stock' && normalizedId) {
      loadStock();
    } else if (normalizedType === 'crypto' && normalizedId) {
      loadCrypto();
    } else {
      setErrors({ page: 'Use /asset/stock/AAPL or /asset/crypto/bitcoin.' });
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [normalizedId, normalizedType]);

  const displayPrice = normalizedType === 'crypto' ? marketData?.current_price : quote?.current;
  const displayChange = normalizedType === 'crypto' ? marketData?.price_change_percentage_24h : quote?.percentChange;

  return (
    <div className="space-y-6">
      <Link to="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-medium text-slate-600 hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-300">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Dashboard
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-surface-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-700 dark:text-cyan-300">{normalizedType}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{asset.name}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{asset.symbol}</p>
          </div>
          <WatchlistButton asset={asset} />
        </div>

        {loading ? <div className="mt-5"><Loader label="Loading asset details" /></div> : null}
        {errors.page ? <div className="mt-5"><ErrorMessage message={errors.page} /></div> : null}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Last Price</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{formatCurrency(displayPrice)}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">24h / Session Change</p>
            <p className={`mt-2 text-2xl font-semibold ${Number(displayChange) >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>{formatPercent(displayChange)}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">{normalizedType === 'crypto' ? 'Market Cap' : 'Previous Close'}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {normalizedType === 'crypto' ? formatCompactNumber(marketData?.market_cap) : formatCurrency(quote?.previousClose)}
            </p>
          </div>
        </div>
      </section>

      <section className="panel rounded-lg p-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-700 dark:text-cyan-300" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Price Chart</h2>
        </div>
        {errors.chart ? <div className="mt-4"><ErrorMessage compact title="Chart unavailable" message={errors.chart} /></div> : null}
        {chartData.length ? <div className="mt-5 h-[340px]"><Chart data={chartData} /></div> : null}
      </section>

      {normalizedType === 'stock' ? (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="panel rounded-lg p-5">
            <div className="flex items-center gap-2">
              <Signal className="h-5 w-5 text-cyan-700 dark:text-cyan-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Technical Signals</h2>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">RSI 14</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{rsi?.latest?.value?.toFixed(2) ?? 'N/A'}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{getRsiStatus(rsi?.latest?.value)}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">MACD</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{macd?.latest?.macd?.toFixed(2) ?? 'N/A'}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Signal {macd?.latest?.signal?.toFixed(2) ?? 'N/A'}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Histogram</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{macd?.latest?.histogram?.toFixed(2) ?? 'N/A'}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Daily close</p>
              </div>
            </div>
            {errors.rsi ? <div className="mt-4"><ErrorMessage compact title="RSI unavailable" message={errors.rsi} /></div> : null}
            {errors.macd ? <div className="mt-4"><ErrorMessage compact title="MACD unavailable" message={errors.macd} /></div> : null}
          </div>

          <RiskCalculator />
        </section>
      ) : (
        <section className="panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Crypto Market Data</h2>
          {errors.market ? <div className="mt-4"><ErrorMessage compact title="Market data unavailable" message={errors.market} /></div> : null}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Rank</p>
              <p className="mt-2 text-xl font-semibold">{marketData?.market_cap_rank ?? 'N/A'}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">24h High</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(marketData?.high_24h)}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">24h Low</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(marketData?.low_24h)}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Volume</p>
              <p className="mt-2 text-xl font-semibold">{formatCompactNumber(marketData?.total_volume)}</p>
            </div>
          </div>
        </section>
      )}

      {normalizedType === 'stock' ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-cyan-700 dark:text-cyan-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Company News</h2>
          </div>
          {errors.news ? <ErrorMessage compact title="Company news unavailable" message={errors.news} /> : null}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {news.map((article) => (
              <NewsCard key={article.id ?? article.url ?? article.headline} article={article} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
