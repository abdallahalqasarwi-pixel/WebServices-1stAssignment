# TraderHub Presentation Plan

## Team Split

### Person 1: UI, Routing, and Deployment

Responsible for explaining the application structure, navigation, layout, and deployment.

Topics:

- TraderHub project idea as a frontend trading dashboard.
- React + Vite setup.
- React Router pages:
  - Dashboard
  - Asset Details
  - Currency Converter
  - Watchlist
  - Auth
- Tailwind CSS styling.
- Dark mode support.
- Responsive layout.
- Navbar and logo.
Main files to explain:

- `src/App.jsx`
- `src/layouts/MainLayout.jsx`
- `src/components/Navbar.jsx`
- `src/hooks/useDarkMode.js`
- `src/index.css`
- `public/traderhub-logo.svg`
- `public/_redirects`

Demo points:

- Open the deployed website.
- Switch between light and dark mode.
- Navigate between pages.
- Mention that the app is deployed on:
  - `https://traderhub.pages.dev`

---

### Person 2: Financial APIs and Data Handling

Responsible for explaining the external APIs and how market data is loaded.

APIs used:

- Alpha Vantage:
  - Stock daily time series.
  - RSI.
  - MACD.
- Finnhub:
  - Stock quotes.
  - Market news.
  - Company news.
  - Stock search.
- CoinGecko:
  - Crypto prices.
  - Crypto market data.
  - Crypto charts.
- Frankfurter:
  - Currency exchange rates.
  - Currency conversion.
- FRED:
  - Economic indicators.

Topics:

- Why API calls are separated into the `src/api/` folder.
- How `.env` variables are used:
  - `VITE_ALPHA_VANTAGE_KEY`
  - `VITE_FINNHUB_KEY`
  - `VITE_FRED_KEY`
- Loading states.
- Error states.
- API response parsing.
- FRED CORS issue and why a relay fallback was added because the project is frontend-only.

Main files to explain:

- `src/api/alphaVantage.js`
- `src/api/finnhub.js`
- `src/api/coingecko.js`
- `src/api/frankfurter.js`
- `src/api/fred.js`
- `.env.example`

Demo points:

- Show stock cards on the Dashboard.
- Show crypto cards on the Dashboard.
- Show USD exchange rates.
- Show FRED economic indicators.
- Show market news.
- Open an asset details page and explain chart/API data.

---

### Person 3: Interactive Features, Auth, and Local Storage

Responsible for explaining the user-facing interactive features.

Topics:

- Watchlist:
  - Add assets.
  - Remove assets.
  - Save watchlist in `localStorage`.
- Authentication:
  - Register account.
  - Login.
  - Logout.
  - Store token/profile in `localStorage`.
  - Public REST API used for demo authentication.
- News sentiment:
  - Positive.
  - Negative.
  - Neutral.
- Lightweight Charts:
  - Line charts for stock and crypto price history.
- Risk Calculator:
  - Account size.
  - Risk percentage.
  - Entry price.
  - Stop loss.
  - Position size.

Main files to explain:

- `src/hooks/useWatchlist.js`
- `src/hooks/useAuth.js`
- `src/api/auth.js`
- `src/pages/Auth.jsx`
- `src/pages/Watchlist.jsx`
- `src/components/WatchlistButton.jsx`
- `src/components/Chart.jsx`
- `src/components/RiskCalculator.jsx`
- `src/utils/sentiment.js`

Demo points:

- Login using the demo account.
- Register a new test account.
- Add Bitcoin or AAPL to the watchlist.
- Open the Watchlist page.
- Remove an asset from the watchlist.
- Show sentiment labels on news cards.
- Show the Risk Calculator on a stock details page.

---

## Suggested Presentation Order

1. Person 1 introduces the project, UI, routing, and deployment.
2. Person 2 explains APIs and financial data.
3. Person 3 explains authentication, watchlist, charts, and localStorage.
4. Final live demo by any team member.

---

## Final Demo Flow

1. Open:

   `https://traderhub.pages.dev`

2. Show the Dashboard.

3. Search for a stock or crypto asset.

4. Open:

   `/asset/stock/AAPL`

   or

   `/asset/crypto/bitcoin`

5. Add the asset to the Watchlist.

6. Open the Watchlist page.

7. Open the Currency Converter page.

8. Test Login/Register from the Auth page.

9. Mention that the project is frontend-only and uses public APIs.


