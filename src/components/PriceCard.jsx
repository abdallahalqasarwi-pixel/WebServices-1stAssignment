import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import WatchlistButton from './WatchlistButton.jsx';
import { formatCurrency, formatPercent } from '../utils/formatters.js';

export default function PriceCard({
  title,
  subtitle,
  price,
  currency = 'USD',
  change,
  percentChange,
  to,
  asset,
  stats = [],
}) {
  const isPositive = Number(percentChange ?? change ?? 0) >= 0;
  return (
    <article className="panel rounded-lg p-4 transition hover:border-cyan-300 hover:shadow-lg dark:hover:border-cyan-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          {subtitle ? <p className="mt-1 truncate text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        </div>
        {asset ? <WatchlistButton asset={asset} compact /> : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold text-slate-950 dark:text-white">{formatCurrency(price, currency, price < 1 ? 6 : 2)}</p>
        <div className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ${isPositive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'}`}>
          {isPositive ? <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> : <ArrowDownRight className="h-4 w-4" aria-hidden="true" />}
          <span>{formatPercent(percentChange ?? 0)}</span>
        </div>
      </div>

      {stats.length ? (
        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-slate-500 dark:text-slate-400">{stat.label}</dt>
              <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {to ? (
        <Link className="focus-ring mt-4 inline-flex items-center gap-1 rounded-md text-sm font-medium text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200" to={to}>
          Details
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </article>
  );
}
