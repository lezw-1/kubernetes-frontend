// Output panel — displays the timeline table returned by the ChronSorting pipeline

import React, { useState } from 'react';

// Shape of each timeline entry returned by the ChronSorting pipeline
export interface TimelineEntry {
  date: string;
  ereignis: string;
}

interface Props {
  output: TimelineEntry[] | string | null; // Response from the ChronSorting pipeline
  loading: boolean; // True while upload is in flight
}

type SortKey = 'date' | 'ereignis'; // Columns available for sorting
type SortDir = 'asc' | 'desc';      // Sort direction toggle

// Parse DD.MM.YYYY into a numeric timestamp for correct chronological sorting
function parseDateValue(date: string): number {
  const [d, m, y] = date.split('.').map(Number);
  if (!d || !m || !y) return 0;
  return new Date(y, m - 1, d).getTime();
}

function sortEntries(entries: TimelineEntry[], key: SortKey, dir: SortDir): TimelineEntry[] {
  // Return a sorted copy, never mutate the original array
  return [...entries].sort((a, b) => {
    let cmp: number;
    if (key === 'date') {
      cmp = parseDateValue(a.date) - parseDateValue(b.date);
    } else {
      cmp = a[key].localeCompare(b[key]);
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'date',     label: 'Datum' },
  { key: 'ereignis', label: 'Ereignis' },
];

export default function OutputPanel({ output, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('date'); // Active sort column
  const [sortDir, setSortDir] = useState<SortDir>('asc');  // Active sort direction

  function handleSort(key: SortKey) {
    // Toggle direction if same column, otherwise reset to ascending
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = Array.isArray(output) ? sortEntries(output, sortKey, sortDir) : [];

  return (
    <div className="chron-panel">
      <div className="chron-panel__header">Output</div>
      <div className="chron-panel__body">
        {loading && (
          <p className="app-placeholder">Processing…</p>
        )}
        {!loading && !output && (
          <p className="app-placeholder">Results will appear here after sending.</p>
        )}
        {Array.isArray(output) && (
          <table className="app-table">
            <thead>
              <tr>
                {COLUMNS.map(col => (
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
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry, i) => (
                <tr key={i}>
                  <td>{entry.date}</td>
                  <td>{entry.ereignis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {output && !Array.isArray(output) && (
          <pre className="chron-pre">{output as string}</pre>
        )}
      </div>
    </div>
  );
}
