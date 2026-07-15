import { useState } from 'react';

interface Props {
  onLogin: (token: string) => void;
  sessionExpired?: boolean; // True when redirected after token expiry
}

export default function Login({ onLogin, sessionExpired = false }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: 'frontend',
      username,
      password,
    });

    try {
      const res = await fetch(
        `${import.meta.env.VITE_IAM_SUBPATH}/realms/ai-system/protocol/openid-connect/token`,
        { method: 'POST', body },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description ?? 'Login failed');
      onLogin(data.access_token);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-login">
      <form className="app-login__form" onSubmit={handleSubmit}>
        <h2 className="app-login__title">Sign in</h2>

        {sessionExpired && (
          <p className="app-error">
            Your session has expired. Please sign in again.
          </p>
        )}
        {error && <p className="app-error">{error}</p>}

        <input
          className="app-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="app-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="app-btn" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
