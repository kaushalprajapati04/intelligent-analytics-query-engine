import { BookmarkCheck, Clock3, RotateCcw, Trash2 } from "lucide-react";

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "—";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function SavedAnalyses({ analyses, onRerun, onRemove }) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return (
      <section className="history-section">
        <div className="history-header-row">
          <div className="section-label">
            <BookmarkCheck size={16} />
            Saved analyses
          </div>
        </div>

        <div className="empty-history-state">
          No saved analyses yet. Bookmark a useful query to access it later.
        </div>
      </section>
    );
  }

  return (
    <section className="history-section">
      <div className="history-header-row">
        <div className="section-label">
          <BookmarkCheck size={16} />
          Saved analyses
        </div>
      </div>

      <div className="history-list">
        {analyses.map((entry) => (
          <div className="history-item" key={entry.id}>
            <div className="history-main">
              <p className="history-query">{entry.query}</p>
              <div className="history-meta">
                <Clock3 size={13} />
                <span>{formatTimestamp(entry.savedAt)}</span>
              </div>
            </div>

            <div className="history-actions">
              <button
                type="button"
                className="icon-button"
                onClick={() => onRerun(entry.query)}
                aria-label={`Rerun saved query: ${entry.query}`}
                title="Rerun saved query"
              >
                <RotateCcw size={14} />
              </button>

              <button
                type="button"
                className="icon-button danger"
                onClick={() => onRemove(entry.id)}
                aria-label={`Remove saved query: ${entry.query}`}
                title="Remove bookmark"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SavedAnalyses;
