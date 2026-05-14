import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, LogIn, UserPlus } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loader from '../components/Loader.jsx';
import useAuth from '../hooks/useAuth.js';

const demoCredentials = {
  email: 'john@mail.com',
  password: 'changeme',
};

function emptyForm() {
  return {
    name: '',
    email: '',
    password: '',
  };
}

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const { isAuthenticated, loading, login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'register') {
        await register(form);
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
      }

      navigate(redirectTo, { replace: true });
    } catch (authError) {
      setError(authError.message);
    }
  }

  function fillDemoAccount() {
    setError('');
    setMode('login');
    setForm({
      name: '',
      ...demoCredentials,
    });
  }

  const isRegister = mode === 'register';

  return (
    <div className="mx-auto max-w-xl">
      <section className="panel rounded-lg p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">{isRegister ? 'Create Account' : 'Login'}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Public demo API. Do not use real passwords.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
          <button
            type="button"
            className={`focus-ring inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium ${!isRegister ? 'bg-white text-cyan-700 shadow-sm dark:bg-slate-800 dark:text-cyan-300' : 'text-slate-600 dark:text-slate-300'}`}
            onClick={() => {
              setError('');
              setMode('login');
            }}
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Login
          </button>
          <button
            type="button"
            className={`focus-ring inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium ${isRegister ? 'bg-white text-cyan-700 shadow-sm dark:bg-slate-800 dark:text-cyan-300' : 'text-slate-600 dark:text-slate-300'}`}
            onClick={() => {
              setError('');
              setMode('register');
            }}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Register
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {isRegister ? (
            <label className="block text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Name</span>
              <input
                className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
                minLength={2}
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
              />
            </label>
          ) : null}

          <label className="block text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Email</span>
            <input
              className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Password</span>
            <input
              className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
              type="password"
              minLength={4}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
            />
          </label>

          {error ? <ErrorMessage compact title="Authentication failed" message={error} /> : null}
          {loading ? <Loader label={isRegister ? 'Creating account' : 'Logging in'} /> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="focus-ring inline-flex h-10 items-center justify-center rounded-md bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              type="submit"
              disabled={loading}
            >
              {isRegister ? 'Create Account' : 'Login'}
            </button>

            <button
              className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
              type="button"
              onClick={fillDemoAccount}
            >
              Demo Account
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
