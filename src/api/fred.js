import axios from 'axios';

const API_KEY = import.meta.env.VITE_FRED_KEY;

const fredClient = axios.create({
  baseURL: 'https://api.stlouisfed.org/fred',
  timeout: 15000,
});

const FRED_API_BASE_URL = 'https://api.stlouisfed.org/fred';
const FRED_CORS_RELAYS = [
  {
    name: 'CodeTabs',
    url: (directUrl) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(directUrl)}`,
  },
  {
    name: 'AllOrigins',
    url: (directUrl) => `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`,
  },
];

function requireFredKey() {
  if (!API_KEY) {
    throw new Error('Missing VITE_FRED_KEY in .env');
  }
}

function parseFredValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildFredObservationsUrl(seriesId, limit) {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: API_KEY,
    file_type: 'json',
    sort_order: 'desc',
    limit: String(limit),
  });

  return `${FRED_API_BASE_URL}/series/observations?${params.toString()}`;
}

async function getFredObservations(seriesId, limit) {
  const directUrl = buildFredObservationsUrl(seriesId, limit);

  if (typeof window !== 'undefined') {
    // Browsers block the direct FRED API response because it lacks CORS headers.
    // Use the direct FRED URL through a public relay for this frontend-only app.
    return getFredObservationsThroughRelay(directUrl);
  }

  try {
    const { data } = await fredClient.get('/series/observations', {
      params: {
        series_id: seriesId,
        api_key: API_KEY,
        file_type: 'json',
        sort_order: 'desc',
        limit,
      },
    });

    return data;
  } catch (error) {
    if (error.code !== 'ERR_NETWORK') {
      throw error;
    }

    // FRED responses are valid from scripts/servers, but the API currently
    // does not expose CORS headers for direct browser reads. In a frontend-only
    // assignment app, this public relay keeps the app usable without a backend.
    return getFredObservationsThroughRelay(directUrl);
  }
}

async function getFredObservationsThroughRelay(directUrl) {
  const errors = [];

  for (const relay of FRED_CORS_RELAYS) {
    try {
      const { data } = await axios.get(relay.url(directUrl), {
        timeout: 20000,
      });

      return data;
    } catch (error) {
      errors.push(`${relay.name}: ${error.message}`);
    }
  }

  throw new Error(`FRED browser request failed. ${errors.join('; ')}`);
}

export async function getEconomicIndicator(seriesId, limit = 24) {
  requireFredKey();

  const data = await getFredObservations(seriesId, limit);

  if (!Array.isArray(data?.observations)) {
    throw new Error(`No FRED observations returned for ${seriesId}`);
  }

  // FRED missing values arrive as "." strings, so filter after numeric parsing.
  const observations = data.observations
    .map((observation) => ({
      date: observation.date,
      value: parseFredValue(observation.value),
    }))
    .filter((observation) => Number.isFinite(observation.value))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    id: seriesId,
    latest: observations.at(-1) ?? null,
    observations,
  };
}
