import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import './AdminLoginPage.css';

type LocationState = {
  from?: string;
};

export function AdminLoginPage() {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(username, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate(from.startsWith('/admin') ? from : '/admin', { replace: true });
  }

  return (
    <div className="admin-login">
      <div className="admin-login__panel">
        <div className="admin-login__brand">
          <img src="/images/logo.png" alt="Dhaka Engineering Service" className="admin-login__logo" />
          <div>
            <h1>DES Admin</h1>
            <p>Admin Panel Sign In</p>
          </div>
        </div>

        <h2>Sign in to Admin Panel</h2>
        <p className="admin-login__subtitle">Use your admin credentials to continue.</p>

        <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
          <label className="admin-login__field">
            <span>Username</span>
            <div className="admin-login__input-wrap">
              <User size={16} />
              <input
                type="text"
                name="username"
                autoComplete="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </label>

          <label className="admin-login__field">
            <span>Password</span>
            <div className="admin-login__input-wrap">
              <Lock size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="admin-login__toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && <p className="admin-login__error">{error}</p>}

          <button type="submit" className="btn-primary admin-login__submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
