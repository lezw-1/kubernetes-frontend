// A single extracted promise, as stored and returned by api
export interface PromiseEntry {
  id: string;
  promise: string;
  politician: string;
  source: string;
  date: string;
  excerpt?: string;
}

// A promises search_job as tracked by api, polled until done/error
export interface SearchJob {
  id: string;
  politician: string | null;
  from_year: number | null;
  to_year: number | null;
  max_results: number | null;
  status: 'pending' | 'running' | 'done' | 'error';
  created_at: string;
  updated_at: string;
  result?: string;
}

export type SortKey = 'date' | 'politician' | 'promise' | 'source'; // Columns available for sorting
export type SortDir = 'asc' | 'desc'; // Sort direction toggle
