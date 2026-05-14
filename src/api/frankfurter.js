import axios from 'axios';

const frankfurterClient = axios.create({
  baseURL: 'https://api.frankfurter.dev/v1',
  timeout: 15000,
});

export async function getLatestRates(base = 'USD', symbols = []) {
  const { data } = await frankfurterClient.get('/latest', {
    params: {
      from: base,
      to: symbols.join(','),
    },
  });

  if (!data?.rates) {
    throw new Error(`No exchange rates returned for ${base}`);
  }

  return data;
}

export async function convertCurrency(amount, from, to) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    throw new Error('Enter a valid positive amount');
  }

  if (from === to) {
    return {
      amount: numericAmount,
      base: from,
      date: new Date().toISOString().slice(0, 10),
      rates: {
        [to]: numericAmount,
      },
    };
  }

  const { data } = await frankfurterClient.get('/latest', {
    params: {
      amount: numericAmount,
      from,
      to,
    },
  });

  if (!data?.rates?.[to]) {
    throw new Error(`No conversion rate returned for ${from} to ${to}`);
  }

  return data;
}
