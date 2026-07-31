// Formats milliseconds elapsed since a job started as a short relative label.
export function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return 'Started just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Started ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  return `Started ${hours} hour${hours === 1 ? '' : 's'} ago`;
}
