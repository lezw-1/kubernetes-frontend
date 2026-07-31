import { useEffect, useState } from 'react';
import type { PromiseEntry } from '../types';

interface Filters {
  politician?: string;
  fromYear?: string;
  toYear?: string;
}

// Owns the saved-promises table: fetching, filtering, and clearing it.
export function useSearchPromises() {
  const [promises, setPromises] = useState<PromiseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false); // True while a clear request is in flight
  const [error, setError] = useState<string | null>(null);
  const [politician, setPolitician] = useState(''); // Politician name filter
  const [fromYear, setFromYear] = useState(''); // Lower bound (inclusive) of the year filter
  const [toYear, setToYear] = useState(''); // Upper bound (inclusive) of the year filter

  async function fetchPromises(filters?: Filters) {
    const params = new URLSearchParams();
    if (filters?.politician) params.set('politician', filters.politician);
    if (filters?.fromYear) params.set('from_year', filters.fromYear);
    if (filters?.toYear) params.set('to_year', filters.toYear);
    const qs = params.toString();
    const res = await fetch(`/api/promises${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setPromises(await res.json());
  }

  useEffect(() => {
    fetchPromises()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Refetches using whatever filters are currently set, for callers outside this hook (e.g. a completed job)
  async function refetchWithCurrentFilters() {
    await fetchPromises({ politician, fromYear, toYear });
  }

  async function search() {
    setError(null);
    setLoading(true);
    try {
      await fetchPromises({ politician, fromYear, toYear });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function clear() {
    if (clearing || !window.confirm('Delete all promises? This cannot be undone.')) return;
    setError(null);
    setClearing(true);
    try {
      const res = await fetch('/api/promises', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPromises([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setClearing(false);
    }
  }

  return {
    promises,
    loading,
    clearing,
    error,
    setError,
    politician,
    setPolitician,
    fromYear,
    setFromYear,
    toYear,
    setToYear,
    search,
    clear,
    refetchWithCurrentFilters,
  };
}
