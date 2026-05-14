import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.js';

export default function RiskCalculator() {
  const [accountSize, setAccountSize] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('1');
  const [entryPrice, setEntryPrice] = useState('100');
  const [stopLoss, setStopLoss] = useState('95');

  const result = useMemo(() => {
    const account = Number(accountSize);
    const risk = Number(riskPercent);
    const entry = Number(entryPrice);
    const stop = Number(stopLoss);
    const perShareRisk = Math.abs(entry - stop);
    const dollarsAtRisk = account * (risk / 100);
    const shares = perShareRisk > 0 ? Math.floor(dollarsAtRisk / perShareRisk) : 0;

    return {
      dollarsAtRisk,
      perShareRisk,
      shares,
      notional: shares * entry,
      valid: [account, risk, entry, stop].every((value) => Number.isFinite(value) && value > 0) && perShareRisk > 0,
    };
  }, [accountSize, entryPrice, riskPercent, stopLoss]);

  return (
    <section className="panel rounded-lg p-5">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-cyan-600 dark:text-cyan-300" aria-hidden="true" />
        <h2 className="text-base font-semibold text-slate-950 dark:text-white">Risk Calculator</h2>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-slate-600 dark:text-slate-300">Account Size</span>
          <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" min="0" type="number" value={accountSize} onChange={(event) => setAccountSize(event.target.value)} />
        </label>
        <label className="text-sm">
          <span className="text-slate-600 dark:text-slate-300">Risk %</span>
          <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" min="0" step="0.1" type="number" value={riskPercent} onChange={(event) => setRiskPercent(event.target.value)} />
        </label>
        <label className="text-sm">
          <span className="text-slate-600 dark:text-slate-300">Entry Price</span>
          <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" min="0" step="0.01" type="number" value={entryPrice} onChange={(event) => setEntryPrice(event.target.value)} />
        </label>
        <label className="text-sm">
          <span className="text-slate-600 dark:text-slate-300">Stop Loss</span>
          <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" min="0" step="0.01" type="number" value={stopLoss} onChange={(event) => setStopLoss(event.target.value)} />
        </label>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Capital at Risk</p>
          <p className="mt-1 font-semibold text-slate-950 dark:text-white">{result.valid ? formatCurrency(result.dollarsAtRisk) : 'N/A'}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Position Size</p>
          <p className="mt-1 font-semibold text-slate-950 dark:text-white">{result.valid ? `${result.shares.toLocaleString()} shares` : 'N/A'}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Risk Per Share</p>
          <p className="mt-1 font-semibold text-slate-950 dark:text-white">{result.valid ? formatCurrency(result.perShareRisk) : 'N/A'}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Notional Value</p>
          <p className="mt-1 font-semibold text-slate-950 dark:text-white">{result.valid ? formatCurrency(result.notional) : 'N/A'}</p>
        </div>
      </div>
    </section>
  );
}
