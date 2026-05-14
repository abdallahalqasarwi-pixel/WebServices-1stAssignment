import { ExternalLink } from 'lucide-react';
import { formatUnixDate } from '../utils/formatters.js';
import { getNewsSentiment, getSentimentClasses } from '../utils/sentiment.js';

export default function NewsCard({ article }) {
  const title = article.headline || article.title || 'Untitled market update';
  const summary = article.summary || article.description || '';
  const sentiment = getNewsSentiment(`${title} ${summary}`);
  const source = article.source || article.category || 'Market source';
  const publishedAt = article.datetime ? formatUnixDate(article.datetime) : article.datetime || article.date;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-surface-900">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{source}</span>
        {publishedAt ? <span>{publishedAt}</span> : null}
        <span className={`rounded-full border px-2 py-0.5 font-medium ${getSentimentClasses(sentiment)}`}>{sentiment}</span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
      {summary ? <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{summary}</p> : null}

      {article.url ? (
        <a
          className="focus-ring mt-4 inline-flex items-center gap-2 rounded-md text-sm font-medium text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
          href={article.url}
          target="_blank"
          rel="noreferrer"
        >
          Read story
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ) : null}
    </article>
  );
}
