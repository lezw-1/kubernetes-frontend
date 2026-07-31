import { useState } from 'react';
import type { PromiseEntry, SortDir, SortKey } from '../types';

const PAGE_SIZE = 10; // Number of promise rows shown per table page

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'politician', label: 'Politician' },
  { key: 'promise', label: 'Promise' },
  { key: 'source', label: 'Source' },
];

function sortPromises(entries: PromiseEntry[], key: SortKey, dir: SortDir): PromiseEntry[] {
  // Return a sorted copy, never mutate the original array
  return [...entries].sort((a, b) => {
    const cmp = a[key].localeCompare(b[key]);
    return dir === 'asc' ? cmp : -cmp;
  });
}

interface Props {
  promises: PromiseEntry[];
  loading: boolean;
  clearing: boolean;
  onClear: () => void;
  clearDisabled: boolean;
}

export default function ResultsPanel({ promises, loading, clearing, onClear, clearDisabled }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('date'); // Active sort column
  const [sortDir, setSortDir] = useState<SortDir>('asc'); // Active sort direction
  const [page, setPage] = useState(1); // Current 1-indexed table page

  function handleSort(key: SortKey) {
    // Toggle direction if same column, otherwise reset to ascending
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  const sorted = sortPromises(promises, sortKey, sortDir);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="promises-panel">
      <div className="promises-panel__header">
        <h2 className="promises-panel__title">Results</h2>
        <button
          type="button"
          className="app-btn"
          onClick={onClear}
          disabled={clearDisabled}
        >
          {clearing ? 'Clearing…' : 'Clear all'}
        </button>
      </div>
      <div className="promises-panel__body">
        {loading && <p className="app-placeholder">Loading...</p>}
        {!loading && promises.length === 0 && (
          <p className="app-placeholder">No promises found.</p>
        )}

        {promises.length > 0 && (
          <table className="app-table promises-table">
            <colgroup>
              <col className="promises-col-date" />
              <col className="promises-col-politician" />
              <col className="promises-col-promise" />
              <col className="promises-col-source" />
              <col className="promises-col-excerpt" />
            </colgroup>
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="app-table__sortable-th"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    <span className="app-table__sort-icon">
                      {sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                    </span>
                  </th>
                ))}
                <th>Excerpt</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => (
                <tr key={p.id}>
                  <td className="promises-cell-wrap">{p.date}</td>
                  <td className="promises-cell-wrap">{p.politician}</td>
                  <td className="promises-cell-wrap">{p.promise}</td>
                  <td className="promises-cell-wrap">
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
                  <td className="promises-excerpt-cell" title={p.excerpt}>
                    {p.excerpt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {promises.length > 0 && (
          <div className="promises-pagination">
            <button
              type="button"
              className="app-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span className="promises-pagination__info">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="app-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
