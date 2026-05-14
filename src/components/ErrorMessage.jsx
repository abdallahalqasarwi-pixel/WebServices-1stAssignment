import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ title = 'Unable to load data', message, compact = false }) {
  return (
    <div className={`rounded-md border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200 ${compact ? 'px-3 py-2 text-sm' : 'p-4'}`}>
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">{title}</p>
          {message ? <p className="mt-1 text-sm opacity-85">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
