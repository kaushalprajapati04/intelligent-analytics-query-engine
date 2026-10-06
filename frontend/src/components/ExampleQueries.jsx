import {
  ArrowUpRight,
  BarChart3,
  Clock3,
  Percent,
  Trophy,
} from "lucide-react";


const EXAMPLE_QUERIES = [
  {
    icon: Trophy,
    label: "Top products",
    query: "Show me the top 5 products by revenue",
  },
  {
    icon: BarChart3,
    label: "Revenue by region",
    query: "Show total revenue by region",
  },
  {
    icon: Percent,
    label: "Contribution",
    query: "What percentage of total revenue comes from each region?",
  },
  {
    icon: Clock3,
    label: "Monthly sales",
    query: "Show revenue by month",
  },
];


function ExampleQueries({ onSelect, loading = false }) {
  return (
    <section className="examples-section">
      <div className="examples-header">
        <span>Try an example</span>
      </div>

      <div className="example-grid">
        {EXAMPLE_QUERIES.map(
          ({
            icon: Icon,
            label,
            query,
          }) => (
            <button
              key={label}
              type="button"
              className="example-card"
              onClick={() => onSelect(query)}
              disabled={loading}
              aria-label={`Run example query: ${query}`}
            >
              <div className="example-icon">
                <Icon size={18} />
              </div>

              <div className="example-content">
                <strong>{label}</strong>
                <span>{query}</span>
              </div>

              <ArrowUpRight
                size={17}
                className="example-arrow"
              />
            </button>
          )
        )}
      </div>
    </section>
  );
}


export default ExampleQueries;