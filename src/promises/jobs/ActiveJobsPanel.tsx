import { useEffect, useState } from 'react';
import type { SearchJob } from '../types';
import { formatElapsed } from '../utils';

const ELAPSED_TICK_MS = 1000; // How often the "started X ago" labels refresh while jobs are active
const PAGE_SIZE_OPTIONS = [5, 10, 20]; // Choices for how many active jobs to show per page

interface Props {
  jobs: SearchJob[];
  onDeleteJob: (jobId: string) => void;
  onDeleteAll: () => void;
}

export default function ActiveJobsPanel({ jobs, onDeleteJob, onDeleteAll }: Props) {
  const [now, setNow] = useState(Date.now()); // Ticks every second to refresh the elapsed labels
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]); // How many jobs are shown per page
  const [page, setPage] = useState(1); // Current 1-indexed page
  const [isOpen, setIsOpen] = useState(true); // Whether the panel body is expanded

  useEffect(() => {
    if (jobs.length === 0) return;
    const tick = setInterval(() => setNow(Date.now()), ELAPSED_TICK_MS);
    return () => clearInterval(tick);
  }, [jobs.length]);

  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
  const safePage = Math.min(page, totalPages); // Clamp in case the list shrank since the last render
  const paged = jobs.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  return (
    <section className="promises-panel">
      <div className="promises-panel__header">
        <h2 className="promises-panel__title">Active Jobs</h2>
        <button
          type="button"
          className="app-btn promises-panel__toggle"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>
      {isOpen && (
        <div className="promises-panel__body">
          {jobs.length === 0 && <p className="app-placeholder">No active jobs.</p>}
          {paged.map((job) => (
            <div className="promises-job-card" key={job.id}>
              <div className="promises-job-card__row">
                <span className="promises-job-card__name">
                  🔄 Job #{job.id}
                  {job.politician ? ` — ${job.politician}` : ''}
                </span>
                <button
                  type="button"
                  className="app-btn"
                  onClick={() => onDeleteJob(job.id)}
                  title="Deletes this job's record; it may still finish in the background"
                >
                  Delete
                </button>
              </div>
              <p className="promises-job-card__meta">Type: SEARCH</p>
              <p className="promises-job-card__meta">
                Status: {job.status === 'pending' ? 'QUEUED' : 'RUNNING'}
              </p>
              <p className="promises-job-card__step">
                Step:{' '}
                {job.status === 'pending'
                  ? 'Waiting for a worker to pick this up'
                  : 'Searching sources'}
              </p>
              <div className="app-progress promises-job-card__progress">
                <div className="app-progress__bar" />
              </div>
              <p className="promises-job-card__elapsed">
                {formatElapsed(now - new Date(job.created_at).getTime())}
              </p>
            </div>
          ))}

          <div className="promises-jobs-footer">
            <label className="promises-page-size">
              Show
              <select
                className="app-input"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            {jobs.length > 0 && (
              <div className="promises-pagination">
                <button
                  type="button"
                  className="app-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={safePage <= 1}
                >
                  Previous
                </button>
                <span className="promises-pagination__info">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="app-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={safePage >= totalPages}
                >
                  Next
                </button>
              </div>
            )}

            <button
              type="button"
              className="app-btn"
              onClick={onDeleteAll}
              disabled={jobs.length === 0}
            >
              Delete all
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
