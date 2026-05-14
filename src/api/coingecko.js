import axios from 'axios';

const coingeckoClient = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
  timeout: 15000,
});

export async function getCryptoPrices(ids, vsCurrency = 'usd') {
  const { data } = await coingeckoClient.get('/simple/price', {
    params: {
      ids: ids.join(','),
      vs_currencies: vsCurrency,
      include_market_cap: true,
      include_24hr_change: true,
    },
  });

  return data ?? {};
}

export async function getCryptoMarketData(ids, vsCurrency = 'usd') {
  const { data } = await coingeckoClient.get('/coins/markets', {
    params: {
      vs_currency: vsCurrency,
      ids: ids.join(','),
      order: 'market_cap_desc',
      sparkline: false,
      price_change_percentage: '24h',
    },
  });

  if (!Array.isArray(data)) {
    throw new Error('No crypto market data returned');
  }

  return data;
}

export async function getCryptoChart(id, days = 30, vsCurrency = 'usd') {
  const { data } = await coingeckoClient.get(`/coins/${id}/market_chart`, {
    params: {
      vs_currency: vsCurrency,
      days,
    },
  });

  if (!Array.isArray(data?.prices)) {
    throw new Error(`No crypto chart data returned for ${id}`);
  }

  // CoinGecko returns [timestampMs, price] tuples; Lightweight Charts accepts
  // Unix timestamps in seconds for intraday/market-chart data.
  return data.prices
    .map(([timestamp, price]) => ({
      time: Math.floor(timestamp / 1000),
      value: Number(price),
    }))
    .filter((point) => Number.isFinite(point.value))
    .sort((a, b) => a.time - b.time);
}
