import axios from 'axios';

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;

const alphaVantageClient = axios.create({
  baseURL: 'https://www.alphavantage.co/query',
  timeout: 15000,
});

function requireAlphaKey() {
  if (!API_KEY) {
    throw new Error('Missing VITE_ALPHA_VANTAGE_KEY in .env');
  }
}

function assertAlphaResponse(data) {
  if (data?.['Error Message']) {
    throw new Error(data['Error Message']);
  }

  if (data?.Note || data?.Information) {
    throw new Error(data.Note || data.Information);
  }
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getDailyTimeSeries(symbol) {
  requireAlphaKey();

  const { data } = await alphaVantageClient.get('', {
    params: {
      function: 'TIME_SERIES_DAILY',
      symbol,
      outputsize: 'compact',
      apikey: API_KEY,
    },
  });

  assertAlphaResponse(data);

  // Alpha Vantage names this object "Time Series (Daily)" today, but API
  // variants can change the key when interval/output options change.
  const series = data['Time Series (Daily)'];

  if (!series) {
    throw new Error(`No daily time series returned for ${symbol}`);
  }

  return Object.entries(series)
    .map(([date, values]) => ({
      time: date,
      value: parseNumber(values['4. close']),
      open: parseNumber(values['1. open']),
      high: parseNumber(values['2. high']),
      low: parseNumber(values['3. low']),
      close: parseNumber(values['4. close']),
      volume: parseNumber(values['5. volume']),
    }))
    .filter((point) => Number.isFinite(point.value))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export async function getRsi(symbol) {
  requireAlphaKey();

  const { data } = await alphaVantageClient.get('', {
    params: {
      function: 'RSI',
      symbol,
      interval: 'daily',
      time_period: 14,
      series_type: 'close',
      apikey: API_KEY,
    },
  });

  assertAlphaResponse(data);

  // Indicator responses use nested technical-analysis keys that are easy to
  // mistype, so keep parsing centralized if the provider changes this shape.
  const series = data['Technical Analysis: RSI'];

  if (!series) {
    throw new Error(`No RSI data returned for ${symbol}`);
  }

  const points = Object.entries(series)
    .map(([date, values]) => ({
      time: date,
      value: parseNumber(values.RSI),
    }))
    .filter((point) => Number.isFinite(point.value))
    .sort((a, b) => a.time.localeCompare(b.time));

  return {
    latest: points.at(-1) ?? null,
    points,
  };
}

export async function getMacd(symbol) {
  requireAlphaKey();

  const { data } = await alphaVantageClient.get('', {
    params: {
      function: 'MACD',
      symbol,
      interval: 'daily',
      series_type: 'close',
      apikey: API_KEY,
    },
  });

  assertAlphaResponse(data);

  const series = data['Technical Analysis: MACD'];

  if (!series) {
    throw new Error(`No MACD data returned for ${symbol}`);
  }

  const points = Object.entries(series)
    .map(([date, values]) => ({
      time: date,
      macd: parseNumber(values.MACD),
      signal: parseNumber(values.MACD_Signal),
      histogram: parseNumber(values.MACD_Hist),
    }))
    .filter((point) => Number.isFinite(point.macd))
    .sort((a, b) => a.time.localeCompare(b.time));

  return {
    latest: points.at(-1) ?? null,
    points,
  };
}
