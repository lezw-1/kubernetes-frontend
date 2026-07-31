interface Props {
  politician: string;
  onPoliticianChange: (value: string) => void;
  fromYear: string;
  onFromYearChange: (value: string) => void;
  toYear: string;
  onToYearChange: (value: string) => void;
  maxResults: string;
  onMaxResultsChange: (value: string) => void;
  onCreate: () => void;
  disabled: boolean;
}

export default function CreateJobPanel({
  politician,
  onPoliticianChange,
  fromYear,
  onFromYearChange,
  toYear,
  onToYearChange,
  maxResults,
  onMaxResultsChange,
  onCreate,
  disabled,
}: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCreate();
  }

  return (
    <section className="promises-panel">
      <div className="promises-panel__header">
        <h2 className="promises-panel__title">Create New Job</h2>
      </div>
      <form className="promises-panel__body" onSubmit={handleSubmit}>
        <div className="promises-field-group">
          <span className="promises-field-label">Job Type</span>
          <p className="promises-job-type">Promises search</p>
        </div>

        <div className="promises-field-group">
          <span className="promises-field-label">Configuration</span>
          <div className="promises-config-row">
            <label className="promises-config-field">
              Politician
              <input
                type="text"
                className="app-input"
                value={politician}
                onChange={(e) => onPoliticianChange(e.target.value)}
                disabled={disabled}
                placeholder="Friedrich Merz"
              />
            </label>
            <label className="promises-config-field">
              Max results
              <input
                type="number"
                className="app-input"
                value={maxResults}
                onChange={(e) => onMaxResultsChange(e.target.value)}
                disabled={disabled}
                min={1}
              />
            </label>
          </div>
        </div>

        <div className="promises-field-group">
          <span className="promises-field-label">Filters</span>
          <div className="promises-filter-row">
            <input
              type="number"
              className="app-input promises-year-input"
              value={fromYear}
              onChange={(e) => onFromYearChange(e.target.value)}
              disabled={disabled}
              placeholder="From year"
            />
            <input
              type="number"
              className="app-input promises-year-input"
              value={toYear}
              onChange={(e) => onToYearChange(e.target.value)}
              disabled={disabled}
              placeholder="To year"
            />
          </div>
        </div>

        <div className="promises-panel__submit">
          <button
            type="submit"
            className="app-btn app-btn--lg"
            disabled={disabled || politician.trim() === ''}
          >
            {disabled ? 'Running…' : 'Create Job'}
          </button>
        </div>
      </form>
    </section>
  );
}
