import { Search, Send } from "lucide-react";


function QueryInput({ onSubmit, loading, value, onChange }) {
  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = value.trim();

    if (!trimmedQuery || loading) {
      return;
    }

    onSubmit(trimmedQuery);
  };


  return (
    <section className="query-section">
      <div className="query-heading">
        <div>
          <div className="section-label">
            Ask your data
          </div>

          <h2>What would you like to know?</h2>

          <p>
            Ask a business question in natural language.
            SalesAnalyticsAI will translate it into an analytical query.
          </p>
        </div>
      </div>

      <form
        className="query-form"
        onSubmit={handleSubmit}
      >
        <div className="query-input-wrapper">
          <Search size={20} />

          <input
            type="text"
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
            placeholder="e.g. Show me the top 5 products by revenue"
            disabled={loading}
            aria-label="Analytics question"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="query-submit-button"
        >
          <Send size={18} />

          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>
    </section>
  );
}

export default QueryInput;