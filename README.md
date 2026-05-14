# TraderHub

Frontend-only React + Vite trading dashboard using public market APIs.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and add API keys:

```bash
VITE_ALPHA_VANTAGE_KEY=your_alpha_vantage_key
VITE_FINNHUB_KEY=your_finnhub_key
VITE_FRED_KEY=your_fred_key
```

3. Start the app:

```bash
npm run dev
```

Some APIs may enforce browser CORS or free-tier rate limits because this project intentionally has no backend.

## Demo Authentication

The `/auth` page uses the public Platzi Fake Store API for simple registration and JWT login testing. It is suitable for demos and assignments only; do not use real passwords with this public API.

