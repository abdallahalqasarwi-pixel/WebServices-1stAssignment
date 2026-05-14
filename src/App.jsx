import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AssetDetails from './pages/AssetDetails.jsx';
import Auth from './pages/Auth.jsx';
import CurrencyConverter from './pages/CurrencyConverter.jsx';
import Watchlist from './pages/Watchlist.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/asset/:type/:id" element={<AssetDetails />} />
          <Route path="/converter" element={<CurrencyConverter />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
