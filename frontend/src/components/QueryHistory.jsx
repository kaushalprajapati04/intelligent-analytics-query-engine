import {
  Bookmark,
  BookmarkCheck,
  Clock3,
  History,
  RotateCcw,
  Trash2,
} from "lucide-react";

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

function QueryHistory({
  history,
  savedAnalyses,
  onRerun,
  onSave,
  onDelete,
  onClearAll,
}) {
  const hasHistory = Array.isArray(history) && history.length > 0;

  return (
    <section className="history-section">
      <div className="history-header-row">
        <div className="section-label">
          <History size={16} />
          Recent queries
        </div>

        {hasHistory && (
          <button
            type="button"
            className="history-clear-button"
            onClick={onClearAll}
            aria-label="Clear all query history"
          >
            Clear all
          </button>
        )}
      </div>

      {!hasHistory ? (
        <div className="empty-history-state">
          No recent queries yet. Run your first analysis to see it here.
        </div>
      ) : (
        <div className="history-list">
          {history.map((entry) => {
            const isSaved = savedAnalyses.some(
              (saved) => saved.query.toLowerCase() === entry.query.toLowerCase()
            );

            return (
              <div className="history-item" key={entry.id}>
                <div className="history-main">
                  <p className="history-query">{entry.query}</p>
                  <div className="history-meta">
                    <Clock3 size={13} />
                    <span>{formatTimestamp(entry.createdAt)}</span>
                  </div>
                </div>

                <div className="history-actions">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => onRerun(entry.query)}
                    aria-label={`Rerun query: ${entry.query}`}
                    title="Rerun query"
                  >
                    <RotateCcw size={14} />
                  </button>

                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => onSave(entry.query)}
                    aria-label={isSaved ? `Unsave query: ${entry.query}` : `Save query: ${entry.query}`}
                    title={isSaved ? "Unsave query" : "Save query"}
                  >
                    {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  </button>

                  <button
                    type="button"
                    className="icon-button danger"
                    onClick={() => onDelete(entry.id)}
                    aria-label={`Delete query history item: ${entry.query}`}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default QueryHistory;
