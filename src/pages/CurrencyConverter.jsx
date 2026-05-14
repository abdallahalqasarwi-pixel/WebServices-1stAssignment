import { useEffect, useState } from 'react';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { convertCurrency, getLatestRates } from '../api/frankfurter.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loader from '../components/Loader.jsx';
import { CURRENCY_OPTIONS, USD_RATE_SYMBOLS } from '../utils/constants.js';
import { formatCurrency } from '../utils/formatters.js';

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('ILS');
  const [conversion, setConversion] = useState(null);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadRates() {
      try {
        const latest = await getLatestRates('USD', USD_RATE_SYMBOLS);
        if (active) {
          setRates(latest.rates);
        }
      } catch (ratesError) {
        if (active) {
          setError(ratesError.message);
        }
      }
    }

    loadRates();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await convertCurrency(amount, from, to);
      setConversion(result);
    } catch (conversionError) {
      setError(conversionError.message);
    } finally {
      setLoading(false);
    }
  }

  function swapCurrencies() {
    setFrom(to);
    setTo(from);
  }

  const convertedValue = conversion?.rates?.[to];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-surface-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
            <ArrowRightLeft className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Currency Converter</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Frankfurter exchange rates with USD reference rates.</p>
          </div>
        </div>

        <form className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px_52px_180px_auto]" onSubmit={handleSubmit}>
          <label className="text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Amount</span>
            <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" min="0" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">From</span>
            <select className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={from} onChange={(event) => setFrom(event.target.value)}>
              {CURRENCY_OPTIONS.map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button className="focus-ring flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-cyan-700 dark:hover:text-cyan-300" type="button" onClick={swapCurrencies} aria-label="Swap currencies" title="Swap currencies">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <label className="text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">To</span>
            <select className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={to} onChange={(event) => setTo(event.target.value)}>
              {CURRENCY_OPTIONS.map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button className="focus-ring h-10 rounded-md bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400" type="submit">
              Convert
            </button>
          </div>
        </form>

        {loading ? <div className="mt-5"><Loader label="Converting currency" /></div> : null}
        {error ? <div className="mt-5"><ErrorMessage message={error} /></div> : null}

        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm text-slate-500 dark:text-slate-400">Converted Amount</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
            {Number.isFinite(Number(convertedValue)) ? formatCurrency(convertedValue, to) : 'Run a conversion'}
          </p>
          {conversion?.date ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Rate date {conversion.date}</p> : null}
        </div>
      </section>

      <section className="panel rounded-lg p-5">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">USD Reference Rates</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {USD_RATE_SYMBOLS.map((symbol) => (
            <div key={symbol} className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">USD / {symbol}</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{rates?.[symbol]?.toLocaleString(undefined, { maximumFractionDigits: 4 }) ?? 'N/A'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
