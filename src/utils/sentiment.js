const positiveKeywords = [
  'beat',
  'beats',
  'bull',
  'bullish',
  'gain',
  'gains',
  'growth',
  'higher',
  'profit',
  'record',
  'rises',
  'surge',
  'up',
  'upgrade',
];

const negativeKeywords = [
  'bear',
  'bearish',
  'cut',
  'decline',
  'downgrade',
  'drop',
  'falls',
  'loss',
  'miss',
  'plunge',
  'risk',
  'slump',
  'warning',
  'weak',
];

export function getNewsSentiment(text = '') {
  const lowerText = text.toLowerCase();
  const positives = positiveKeywords.filter((word) => lowerText.includes(word)).length;
  const negatives = negativeKeywords.filter((word) => lowerText.includes(word)).length;

  if (positives > negatives) {
    return 'Positive';
  }

  if (negatives > positives) {
    return 'Negative';
  }

  return 'Neutral';
}

export function getSentimentClasses(sentiment) {
  if (sentiment === 'Positive') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300';
  }

  if (sentiment === 'Negative') {
    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300';
  }

  return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
}
