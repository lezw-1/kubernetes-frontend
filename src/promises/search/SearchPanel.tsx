interface Props {
  politician: string;
  onPoliticianChange: (value: string) => void;
  fromYear: string;
  onFromYearChange: (value: string) => void;
  toYear: string;
  onToYearChange: (value: string) => void;
  onSearch: () => void;
  disabled: boolean;
}

export default function SearchPanel({
  politician,
  onPoliticianChange,
  fromYear,
  onFromYearChange,
  toYear,
  onToYearChange,
  onSearch,
  disabled,
}: Props) {
  return (
    <section className="promises-panel">
      <div className="promises-panel__header">
        <h2 className="promises-panel__title">Search</h2>
      </div>
      <div className="promises-panel__body">
        <div className="promises-field-group">
          <label className="promises-field-label" htmlFor="promises-search-politician">
            Politician
          </label>
          <input
            id="promises-search-politician"
            type="text"
            className="app-input promises-politician-input"
            value={politician}
            onChange={(e) => onPoliticianChange(e.target.value)}
            disabled={disabled}
            placeholder="Any politician"
          />
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
            type="button"
            className="app-btn app-btn--lg"
            onClick={onSearch}
            disabled={disabled}
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
