import axios from 'axios';

const API_KEY = import.meta.env.VITE_FINNHUB_KEY;

const finnhubClient = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  timeout: 15000,
});

function requireFinnhubKey() {
  if (!API_KEY) {
    throw new Error('Missing VITE_FINNHUB_KEY in .env');
  }
}

function formatApiDate(date) {
  return date.toISOString().slice(0, 10);
}

export async function getStockQuote(symbol) {
  requireFinnhubKey();

  const { data } = await finnhubClient.get('/quote', {
    params: {
      symbol,
      token: API_KEY,
    },
  });

  if (!data || data.c === 0) {
    throw new Error(`No quote returned for ${symbol}`);
  }

  return {
    symbol,
    current: data.c,
    change: data.d,
    percentChange: data.dp,
    high: data.h,
    low: data.l,
    open: data.o,
    previousClose: data.pc,
  };
}

export async function getMarketNews(category = 'general') {
  requireFinnhubKey();

  const { data } = await finnhubClient.get('/news', {
    params: {
      category,
      token: API_KEY,
    },
  });

  if (!Array.isArray(data)) {
    throw new Error('No market news returned');
  }

  return data;
}

export async function getCompanyNews(symbol, daysBack = 30) {
  requireFinnhubKey();

  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - daysBack);

  const { data } = await finnhubClient.get('/company-news', {
    params: {
      symbol,
      from: formatApiDate(from),
      to: formatApiDate(to),
      token: API_KEY,
    },
  });

  if (!Array.isArray(data)) {
    throw new Error(`No company news returned for ${symbol}`);
  }

  return data;
}

export async function searchStocks(query) {
  requireFinnhubKey();

  const { data } = await finnhubClient.get('/search', {
    params: {
      q: query,
      token: API_KEY,
    },
  });

  // Finnhub search currently returns { count, result }, but free-tier symbols
  // can include non-common-stock rows, so the component applies display filters.
  return Array.isArray(data?.result) ? data.result : [];
}
