export function formatCurrency(value, currency = 'USD', maximumFractionDigits = 2) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(numberValue);
}

export function formatCompactNumber(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(numberValue);
}

export function formatPercent(value, maximumFractionDigits = 2) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 'N/A';
  }

  return `${numberValue >= 0 ? '+' : ''}${numberValue.toFixed(maximumFractionDigits)}%`;
}

export function formatDate(value) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatUnixDate(seconds) {
  if (!seconds) {
    return 'N/A';
  }

  return formatDate(seconds * 1000);
}

export function toChartDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
}
