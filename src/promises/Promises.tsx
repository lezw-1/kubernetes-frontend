import { useState } from 'react';
import './promises.css';
import SearchPanel from './search/SearchPanel';
import ResultsPanel from './search/ResultsPanel';
import { useSearchPromises } from './search/useSearchPromises';
import ActiveJobsPanel from './jobs/ActiveJobsPanel';
import CreateJobPanel from './jobs/CreateJobPanel';
import { useSearchJob } from './jobs/useSearchJob';

interface Props {
  onLogout: () => void;
}

type Tab = 'search' | 'jobs'; // Which panel group is currently shown

export default function Promises({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('search'); // Currently selected tab

  const search = useSearchPromises();
  const jobs = useSearchJob({ onDone: search.refetchWithCurrentFilters });

  const running = jobs.jobs.length > 0; // True while any active search_job exists in the database
  const error = search.error ?? jobs.error;

  return (
    <div className="app-page">
      {error && <p className="app-error">Error: {error}</p>}

      <div className="promises-tabs">
        <button
          type="button"
          className={`promises-tab${activeTab === 'search' ? ' promises-tab--active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
        <button
          type="button"
          className={`promises-tab${activeTab === 'jobs' ? ' promises-tab--active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Jobs
          {running && <span className="promises-tab__badge" />}
        </button>
      </div>

      {activeTab === 'search' && (
        <>
          <ResultsPanel
            promises={search.promises}
            loading={search.loading}
            clearing={search.clearing}
            onClear={search.clear}
            clearDisabled={search.loading || search.clearing || running || search.promises.length === 0}
          />

          <SearchPanel
            politician={search.politician}
            onPoliticianChange={search.setPolitician}
            fromYear={search.fromYear}
            onFromYearChange={search.setFromYear}
            toYear={search.toYear}
            onToYearChange={search.setToYear}
            onSearch={search.search}
            disabled={search.loading}
          />
        </>
      )}

      {activeTab === 'jobs' && (
        <div className="promises-jobs-row">
          <CreateJobPanel
            politician={jobs.politician}
            onPoliticianChange={jobs.setPolitician}
            fromYear={jobs.fromYear}
            onFromYearChange={jobs.setFromYear}
            toYear={jobs.toYear}
            onToYearChange={jobs.setToYear}
            maxResults={jobs.maxResults}
            onMaxResultsChange={jobs.setMaxResults}
            onCreate={jobs.createJob}
            disabled={jobs.creating}
          />

          <ActiveJobsPanel
            jobs={jobs.jobs}
            onDeleteJob={jobs.deleteJob}
            onDeleteAll={jobs.deleteAllJobs}
          />
        </div>
      )}
    </div>
  );
}
