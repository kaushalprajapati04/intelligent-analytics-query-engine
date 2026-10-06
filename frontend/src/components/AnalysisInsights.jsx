import { ArrowRight, Sparkles } from "lucide-react";

function formatDisplayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(value);
  }

  return String(value);
}

function getTopRow(rows, metricKey, categoryKey) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const numericRows = rows.filter((row) => {
    const value = Number(row?.[metricKey]);
    return Number.isFinite(value);
  });

  if (!numericRows.length) {
    return null;
  }

  return numericRows.reduce((best, current) => {
    const bestValue = Number(best?.[metricKey]);
    const currentValue = Number(current?.[metricKey]);
    return currentValue > bestValue ? current : best;
  }, numericRows[0]);
}

function inferMetricKey(result) {
  if (!result?.columns) {
    return null;
  }

  const preferred = ["revenue", "profit", "amount", "total_revenue", "total_profit", "avg_order_value", "quantity"];
  const key = preferred.find((candidate) => result.columns.includes(candidate));
  return key || result.columns.find((column) => Number.isFinite(Number(result.rows?.[0]?.[column])));
}

function inferCategoryKey(result, metricKey) {
  if (!result?.columns) {
    return null;
  }

  return result.columns.find((column) => column !== metricKey) || null;
}

function buildInsight(query, result, logic) {
  if (!result || !Array.isArray(result.rows) || result.rows.length === 0) {
    return "This analysis returned no rows, so there is no key insight to highlight yet.";
  }

  const metricKey = inferMetricKey(result) || "value";
  const categoryKey = inferCategoryKey(result, metricKey) || "category";
  const topRow = getTopRow(result.rows, metricKey, categoryKey);
  const queryLower = String(query || "").toLowerCase();
  const totalValue = result.rows.reduce((sum, row) => sum + (Number(row?.[metricKey]) || 0), 0);

  if (queryLower.includes("top") && topRow) {
    const label = topRow[categoryKey] || "Top item";
    const metricValue = formatDisplayValue(topRow[metricKey]);
    return `${label} leads the result at ${metricValue} ${metricKey.replaceAll("_", " ")}.`;
  }

  if (queryLower.includes("region") && topRow) {
    const label = topRow[categoryKey] || "Region";
    const metricValue = formatDisplayValue(topRow[metricKey]);
    return `${label} is the strongest region in this result, reaching ${metricValue}.`;
  }

  if (queryLower.includes("month") && topRow) {
    const label = topRow[categoryKey] || "Month";
    const metricValue = formatDisplayValue(topRow[metricKey]);
    return `${label} is the highest point in the trend, reaching ${metricValue}.`;
  }

  if (queryLower.includes("percentage") && result.rows.length > 0) {
    const topShare = result.rows.reduce((max, row) => Math.max(max, Number(row?.[metricKey]) || 0), 0);
    const largestLabel = result.rows.find((row) => Number(row?.[metricKey]) === topShare)?.[categoryKey] || "Largest segment";
    return `${largestLabel} contributes the largest share at ${formatDisplayValue(topShare)}%.`;
  }

  if (result.rows.length === 1) {
    const singleValue = formatDisplayValue(result.rows[0][metricKey]);
    return `The current result totals ${singleValue}.`;
  }

  if (typeof totalValue === "number") {
    return `The results indicate a total of ${formatDisplayValue(totalValue)} across ${result.rows.length} entries.`;
  }

  return "The data highlights a clear pattern worth exploring further.";
}

function buildSuggestedQuestions(query, result, logic) {
  const queryLower = String(query || "").toLowerCase();
  const suggestions = [];

  if (queryLower.includes("product")) {
    suggestions.push("Show total revenue by region");
    suggestions.push("Show revenue by month");
    suggestions.push("What percentage of total revenue comes from each region?");
  } else if (queryLower.includes("region")) {
    suggestions.push("Show me the top 5 products by revenue");
    suggestions.push("Show revenue by month");
    suggestions.push("Show total profit by country");
  } else if (queryLower.includes("month")) {
    suggestions.push("Show total revenue by region");
    suggestions.push("Show me the top 5 products by revenue");
    suggestions.push("What percentage of total revenue comes from each region?");
  } else if (queryLower.includes("percentage") || queryLower.includes("share")) {
    suggestions.push("Show total revenue by region");
    suggestions.push("Show total profit by country");
    suggestions.push("Show me the top 5 products by revenue");
  } else if (queryLower.includes("profit")) {
    suggestions.push("Show total revenue by region");
    suggestions.push("Show revenue by month");
    suggestions.push("Show total profit by country");
  } else {
    suggestions.push("Show total revenue by region");
    suggestions.push("Show me the top 5 products by revenue");
    suggestions.push("What percentage of total revenue comes from each region?");
  }

  const unique = [...new Set(suggestions)];
  return unique.slice(0, 3);
}

function AnalysisInsights({ query, result, logic, onNextQuestion, insight: providedInsight }) {
  if (!result) {
    return null;
  }

  const insight = providedInsight || buildInsight(query, result, logic);
  const suggestions = buildSuggestedQuestions(query, result, logic);

  return (
    <section className="analysis-insights">
      <div className="analysis-header">
        <div className="section-label">
          <Sparkles size={16} />
          Key insight
        </div>
      </div>

      <p className="analysis-insight-text">{insight}</p>

      <div className="suggested-questions">
        <span className="suggested-label">Suggested next questions</span>

        <div className="suggested-list">
          {suggestions.map((nextQuestion) => (
            <button
              key={nextQuestion}
              type="button"
              className="suggested-question"
              onClick={() => onNextQuestion(nextQuestion)}
            >
              <span>{nextQuestion}</span>
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export { buildInsight, buildSuggestedQuestions };
export default AnalysisInsights;
