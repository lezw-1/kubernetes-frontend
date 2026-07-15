import { useEffect, useState } from 'react';

interface Promise {
  id: string;
  promise: string;
  source: string;
  date: string;
}

interface Props {
  onLogout: () => void;
}

export default function Promises({ onLogout }: Props) {
  const [promises, setPromises] = useState<Promise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/promises', {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setPromises)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-page">
      <h1 className="app-title">Promises</h1>
      <p className="app-subtitle">Promises extracted by the AI agent from public sources.</p>

      {loading && <p className="app-placeholder">Loading...</p>}
      {error && <p className="app-error">Error: {error}</p>}
      {!loading && !error && promises.length === 0 && (
        <p className="app-placeholder">No promises found.</p>
      )}

      {promises.length > 0 && (
        <table className="app-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Promise</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {promises.map((p) => (
              <tr key={p.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{p.date}</td>
                <td>{p.promise}</td>
                <td
                  style={{
                    maxWidth: '180px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <a
                    className="app-link"
                    href={p.source}
                    target="_blank"
                    rel="noreferrer"
                    title={p.source}
                  >
                    {p.source}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
