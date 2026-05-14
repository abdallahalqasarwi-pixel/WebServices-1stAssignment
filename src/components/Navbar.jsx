import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, LogOut, Menu, Moon, RefreshCw, Star, Sun, UserRound, X } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import useDarkMode from '../hooks/useDarkMode.js';

const navigation = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/converter', label: 'Converter', icon: RefreshCw },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
];

function getNavClass({ isActive }) {
  return `focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-200'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
  }`;
}

export default function Navbar() {
  const { isDark, toggleTheme } = useDarkMode();
  const { isAuthenticated, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-surface-950/85">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8" aria-label="Primary navigation">
        <NavLink to="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-slate-950 dark:text-white">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <img className="h-8 w-8 object-contain" src="/traderhub-logo.svg" alt="" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold">TraderHub</span>
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={getNavClass}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="hidden items-center gap-2 lg:flex">
              <span className="max-w-[160px] truncate text-sm font-medium text-slate-600 dark:text-slate-300">{user?.name || user?.email}</span>
              <button
                type="button"
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-700 dark:hover:text-rose-300"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/auth"
              className="focus-ring hidden h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 sm:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Login
            </NavLink>
          )}

          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
            onClick={toggleTheme}
            title={isDark ? 'Use light theme' : 'Use dark theme'}
            aria-label={isDark ? 'Use light theme' : 'Use dark theme'}
          >
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-surface-950">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={getNavClass} onClick={() => setMenuOpen(false)}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
            {isAuthenticated ? (
              <button type="button" className={getNavClass({ isActive: false })} onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            ) : (
              <NavLink to="/auth" className={getNavClass} onClick={() => setMenuOpen(false)}>
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Login
              </NavLink>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
