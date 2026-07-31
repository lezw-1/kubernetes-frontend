import { useEffect, useRef, useState } from 'react';
import type { SearchJob } from '../types';

const JOBS_POLL_INTERVAL_MS = 2000; // How often the active search_jobs list is polled

const DEFAULT_POLITICIAN = 'Friedrich Merz'; // Default politician pre-filled when creating a new job
const DEFAULT_YEAR_START = '2022'; // Default year bound pre-filled in from/to year inputs
const DEFAULT_YEAR_END = '2025'; // Default year bound pre-filled in from/to year inputs
const DEFAULT_MAX_RESULTS = '5'; // Default max search results per query pre-filled in the input

interface Options {
  onDone: () => void | Promise<void>; // Called once this tab's own created job finishes successfully
}

// Owns every active search_job in the database, and creating new ones.
export function useSearchJob({ onDone }: Options) {
  const [jobs, setJobs] = useState<SearchJob[]>([]);
  const [creating, setCreating] = useState(false); // True while a create-job request is in flight
  const [error, setError] = useState<string | null>(null);
  const [politician, setPolitician] = useState(DEFAULT_POLITICIAN);
  const [fromYear, setFromYear] = useState(DEFAULT_YEAR_START);
  const [toYear, setToYear] = useState(DEFAULT_YEAR_END);
  const [maxResults, setMaxResults] = useState(DEFAULT_MAX_RESULTS);

  // Always points at the latest onDone, so the poll below never calls it with a stale closure
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Id of the job this tab created, if any; cleared once it's seen leaving the active list
  const myJobIdRef = useRef<string | null>(null);

  // Polls every active job for display, and detects when this tab's own job leaves the list
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/v1/promises/jobs', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const active: SearchJob[] = await res.json();
        setJobs(active);

        const myJobId = myJobIdRef.current;
        if (myJobId && !active.some((j) => j.id === myJobId)) {
          myJobIdRef.current = null;
          const detailRes = await fetch(`/api/v1/promises/jobs/${myJobId}`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
          });
          if (detailRes.ok) {
            const finished: SearchJob = await detailRes.json();
            if (finished.status === 'error') {
              setError(finished.result ?? 'Search failed.');
            } else {
              await onDoneRef.current();
            }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    }, JOBS_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function createJob() {
    if (creating || politician.trim() === '') return;
    setError(null);
    setCreating(true);
    try {
      const res = await fetch('/api/v1/promises', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          politician,
          from_year: fromYear ? Number(fromYear) : null,
          to_year: toYear ? Number(toYear) : null,
          max_results: maxResults ? Number(maxResults) : Number(DEFAULT_MAX_RESULTS),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { job_id } = await res.json();
      myJobIdRef.current = job_id;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }

  async function deleteJob(jobId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/v1/promises/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      // A 404 means it's already gone (e.g. a double-click) — treat that as success too
      if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
      if (myJobIdRef.current === jobId) myJobIdRef.current = null;
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function deleteAllJobs() {
    if (!window.confirm('Delete all active jobs? This cannot be undone.')) return;
    setError(null);
    try {
      const res = await fetch('/api/v1/promises/jobs', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      myJobIdRef.current = null;
      setJobs([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return {
    jobs,
    creating,
    error,
    politician,
    setPolitician,
    fromYear,
    setFromYear,
    toYear,
    setToYear,
    maxResults,
    setMaxResults,
    createJob,
    deleteJob,
    deleteAllJobs,
  };
}
