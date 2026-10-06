import {
  BarChart3,
  Gauge,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "#172033",
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#A78BFA",
  "#0EA5E9",
  "#94A3B8",
];

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatNumber(value, options = {}) {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return "—";
  }

  const { compact = false, maximumFractionDigits = 2 } = options;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits:
      Number.isInteger(numericValue) && !compact ? 2 : 0,
    notation: compact ? "compact" : "standard",
  }).format(numericValue);
}

function formatMetricValue(value, key) {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return "—";
  }

  const loweredKey = String(key).toLowerCase();

  if (
    loweredKey.includes("percentage") ||
    loweredKey.includes("pct") ||
    loweredKey.includes("share") ||
    loweredKey.includes("contribution")
  ) {
    return `${formatNumber(numericValue, { maximumFractionDigits: 2 })}%`;
  }

  if (
    loweredKey.includes("revenue") ||
    loweredKey.includes("profit") ||
    loweredKey.includes("amount") ||
    loweredKey.includes("value") ||
    loweredKey.includes("avg")
  ) {
    return `${formatNumber(numericValue, { maximumFractionDigits: 2 })}`;
  }

  if (loweredKey.includes("quantity") || loweredKey.includes("count")) {
    return formatNumber(numericValue, {
      maximumFractionDigits: 0,
    });
  }

  return formatNumber(numericValue, { maximumFractionDigits: 2 });
}

function prettyLabel(value) {
  if (!value) {
    return "Value";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function prettyMetricName(value) {
  return prettyLabel(value).replace("Avg ", "Average ");
}

function prettyDimensionName(value, pluralize = false) {
  const normalized = String(value || "category").toLowerCase();

  if (normalized.includes("product")) {
    return pluralize ? "Products" : "Product";
  }

  if (normalized.includes("region")) {
    return pluralize ? "Regions" : "Region";
  }

  if (normalized.includes("country")) {
    return pluralize ? "Countries" : "Country";
  }

  if (normalized.includes("city")) {
    return pluralize ? "Cities" : "City";
  }

  if (normalized.includes("customer")) {
    return pluralize ? "Customers" : "Customer";
  }

  if (normalized.includes("month") || normalized.includes("period") || normalized.includes("date")) {
    return pluralize ? "Periods" : "Period";
  }

  if (normalized.includes("category")) {
    return pluralize ? "Categories" : "Category";
  }

  if (normalized.includes("segment")) {
    return pluralize ? "Segments" : "Segment";
  }

  return prettyLabel(value);
}

function getTimeSortValue(value) {
  if (value === null || value === undefined || value === "") {
    return Number.MAX_SAFE_INTEGER;
  }

  if (typeof value === "number") {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const match = String(value).match(/(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) || 1;
    const day = Number(match[3]) || 1;
    return new Date(year, month - 1, day).getTime();
  }

  const dateValue = new Date(String(value));
  return Number.isNaN(dateValue.getTime()) ? String(value) : dateValue.getTime();
}

function sortChronologically(rows) {
  return [...rows].sort((a, b) => {
    const aValue = getTimeSortValue(a.time_period ?? a.month ?? a.date ?? a.period ?? a.label);
    const bValue = getTimeSortValue(b.time_period ?? b.month ?? b.date ?? b.period ?? b.label);

    if (typeof aValue === "number" && typeof bValue === "number") {
      return aValue - bValue;
    }

    return String(aValue).localeCompare(String(bValue));
  });
}

function findNumericMetricKey(columns, logic, rows) {
  const preferred = [
    logic?.metric,
    "revenue",
    "profit",
    "amount",
    "total_revenue",
    "total_profit",
    "avg_order_value",
    "quantity",
    "orders",
  ];

  for (const candidate of preferred) {
    if (candidate && columns.includes(candidate)) {
      return candidate;
    }
  }

  for (const column of columns) {
    const lower = column.toLowerCase();
    if (
      lower.includes("revenue") ||
      lower.includes("profit") ||
      lower.includes("amount") ||
      lower.includes("quantity") ||
      lower.includes("avg") ||
      lower.includes("value")
    ) {
      return column;
    }
  }

  for (const column of columns) {
    const numericValues = rows.map((row) => toNumber(row[column])).filter((value) => value !== null);
    if (numericValues.length > 0) {
      return column;
    }
  }

  return null;
}

function findCategoryKey(columns, logic, metricKey) {
  const preferredDimensions = logic?.dimensions || [];

  for (const candidate of preferredDimensions) {
    if (columns.includes(candidate)) {
      return candidate;
    }
  }

  for (const column of columns) {
    if (column === metricKey) {
      continue;
    }

    const lower = column.toLowerCase();
    if (
      lower.includes("region") ||
      lower.includes("country") ||
      lower.includes("product") ||
      lower.includes("city") ||
      lower.includes("segment") ||
      lower.includes("month") ||
      lower.includes("time") ||
      lower.includes("date") ||
      lower.includes("category") ||
      lower.includes("customer")
    ) {
      return column;
    }
  }

  return columns.find((column) => column !== metricKey) || null;
}

function isTimeColumn(columnName) {
  const lower = String(columnName).toLowerCase();
  return (
    lower.includes("month") ||
    lower.includes("quarter") ||
    lower.includes("year") ||
    lower.includes("date") ||
    lower.includes("time") ||
    lower.includes("period")
  );
}

function buildChartTitle(logic, chartType, result, categoryKey, metricKey) {
  const metricLabel = prettyMetricName(logic?.metric || metricKey || "value");
  const categoryLabel = prettyDimensionName(categoryKey || "category", chartType === "horizontal");

  if (chartType === "horizontal") {
    const limit = logic?.limit || result?.row_count || 0;
    return `Top ${limit} ${categoryLabel} by ${metricLabel}`;
  }

  if (chartType === "bar") {
    return `${metricLabel} by ${categoryLabel}`;
  }

  if (chartType === "line") {
    return `Monthly ${metricLabel}`;
  }

  if (chartType === "pie") {
    return `${metricLabel} Contribution by ${categoryLabel}`;
  }

  if (chartType === "kpi") {
    return `Total ${metricLabel}`;
  }

  return `${metricLabel} Overview`;
}

function renderChartContent({ chartType, data, categoryKey, metricKey, title, logic }) {
  if (!data || data.length === 0) {
    return null;
  }

  if (chartType === "kpi") {
    const scalarValue = Number(data[0][metricKey] ?? data[0].value ?? 0);

    return (
      <div className="chart-kpi-card">
        <div className="chart-kpi-label">Total {prettyMetricName(metricKey)}</div>
        <div className="chart-kpi-value">{formatMetricValue(scalarValue, metricKey)}</div>
      </div>
    );
  }

  if (chartType === "pie") {
    return (
      <div className="chart-visualization chart-pie-wrap">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey={metricKey}
              nameKey={categoryKey}
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={`${entry[categoryKey]}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatMetricValue(value, metricKey), prettyMetricName(metricKey)]}
              labelFormatter={(label) => prettyLabel(label)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === "line") {
    return (
      <div className="chart-visualization">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 8, right: 18, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#edf0f5" vertical={false} />
            <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [formatMetricValue(value, metricKey), prettyMetricName(metricKey)]}
              labelFormatter={(label) => prettyLabel(label)}
            />
            <Line type="monotone" dataKey={metricKey} stroke="#172033" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === "horizontal") {
    return (
      <div className="chart-visualization">
        <ResponsiveContainer width="100%" height={Math.max(260, data.length * 46)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 18, left: 16, bottom: 8 }}
          >
            <CartesianGrid stroke="#edf0f5" horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey={categoryKey} width={110} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [formatMetricValue(value, metricKey), prettyMetricName(metricKey)]}
              labelFormatter={(label) => prettyLabel(label)}
            />
            <Bar dataKey={metricKey} radius={[0, 8, 8, 0]} fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="chart-visualization">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 18, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#edf0f5" vertical={false} />
          <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [formatMetricValue(value, metricKey), prettyMetricName(metricKey)]}
            labelFormatter={(label) => prettyLabel(label)}
          />
          <Bar dataKey={metricKey} radius={[8, 8, 0, 0]} fill="#172033">
            {data.map((entry, index) => (
              <Cell key={`${entry[categoryKey]}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AnalyticsChart({ result, logic }) {
  if (!result || !Array.isArray(result.rows) || result.rows.length === 0) {
    return null;
  }

  const chartRows = result.rows.map((row) => ({ ...row }));

  if (chartRows.length === 0) {
    return null;
  }

  const columns = Array.isArray(result.columns) ? result.columns : Object.keys(chartRows[0] || {});
  if (columns.length === 0) {
    return null;
  }

  const metricKey = findNumericMetricKey(columns, logic, chartRows) || columns[0];
  const categoryKey = findCategoryKey(columns, logic, metricKey) || null;

  const pieColumns = columns.filter((column) => /percentage|contribution|share/i.test(column));
  const percentageKey = pieColumns[0] || null;

  let chartType = "bar";

  if (logic?.percentage || percentageKey) {
    chartType = "pie";
  } else if (
    logic?.time_granularity ||
    columns.some((column) => isTimeColumn(column)) ||
    chartRows.some((row) => row.month || row.time_period || row.date || row.period)
  ) {
    chartType = "line";
  } else if (logic?.limit || (logic?.dimensions && logic.dimensions.length > 0 && chartRows.length > 1 && !categoryKey)) {
    chartType = "horizontal";
  } else if (chartRows.length === 1 && (!categoryKey || categoryKey === metricKey)) {
    chartType = "kpi";
  }

  if (chartType === "pie") {
    const pieData = chartRows
      .map((row) => ({
        [categoryKey || "label"]: row[categoryKey || columns[0]] ?? "Unknown",
        [metricKey]: toNumber(row[percentageKey || metricKey]),
      }))
      .filter((row) => row[metricKey] !== null);

    if (pieData.length === 0) {
      return null;
    }

    const title = buildChartTitle(logic, "pie", result, categoryKey || columns[0], percentageKey || metricKey);

    return (
      <section className="chart-section">
        <div className="chart-header">
          <div className="section-label">
            <PieChartIcon size={16} />
            Visualization
          </div>
          <h3>{title}</h3>
        </div>
        {renderChartContent({
          chartType: "pie",
          data: pieData,
          categoryKey: categoryKey || columns[0],
          metricKey,
          title,
          logic,
        })}
      </section>
    );
  }

  if (chartType === "line") {
    let data = chartRows
      .map((row) => ({
        ...row,
        label: row[categoryKey || columns[0]] ?? "Unknown",
      }))
      .filter((row) => row[metricKey] !== null && row[metricKey] !== undefined);

    const timeKey = categoryKey || columns.find((column) => isTimeColumn(column)) || columns[0];
    data = sortChronologically(
      data.map((row) => ({
        ...row,
        label: row[timeKey] ?? row[categoryKey] ?? "Unknown",
      }))
    );

    const title = buildChartTitle(logic, "line", result, timeKey, metricKey);

    return (
      <section className="chart-section">
        <div className="chart-header">
          <div className="section-label">
            <LineChartIcon size={16} />
            Visualization
          </div>
          <h3>{title}</h3>
        </div>
        {renderChartContent({
          chartType: "line",
          data: data.map((row) => ({
            [timeKey]: row[timeKey] ?? row.label,
            [metricKey]: toNumber(row[metricKey]),
          })),
          categoryKey: timeKey,
          metricKey,
          title,
          logic,
        })}
      </section>
    );
  }

  if (chartType === "horizontal") {
    const data = [...chartRows]
      .map((row) => ({
        ...row,
        [categoryKey || columns[0]]: row[categoryKey || columns[0]] ?? "Unknown",
      }))
      .filter((row) => toNumber(row[metricKey]) !== null)
      .sort((a, b) => toNumber(b[metricKey]) - toNumber(a[metricKey]));

    const title = buildChartTitle(logic, "horizontal", result, categoryKey || columns[0], metricKey);

    return (
      <section className="chart-section">
        <div className="chart-header">
          <div className="section-label">
            <BarChart3 size={16} />
            Visualization
          </div>
          <h3>{title}</h3>
        </div>
        {renderChartContent({
          chartType: "horizontal",
          data: data.map((row) => ({
            [categoryKey || columns[0]]: row[categoryKey || columns[0]],
            [metricKey]: toNumber(row[metricKey]),
          })),
          categoryKey: categoryKey || columns[0],
          metricKey,
          title,
          logic,
        })}
      </section>
    );
  }

  if (chartType === "kpi") {
    const scalarResult = chartRows[0] || {};
    const title = buildChartTitle(logic, "kpi", result, categoryKey, metricKey);

    return (
      <section className="chart-section">
        <div className="chart-header">
          <div className="section-label">
            <Gauge size={16} />
            Visualization
          </div>
          <h3>{title}</h3>
        </div>
        {renderChartContent({
          chartType: "kpi",
          data: [{ [metricKey]: scalarResult[metricKey] ?? scalarResult.value ?? 0 }],
          categoryKey: categoryKey || columns[0],
          metricKey,
          title,
          logic,
        })}
      </section>
    );
  }

  const data = chartRows
    .map((row) => ({
      [categoryKey || columns[0]]: row[categoryKey || columns[0]] ?? "Unknown",
      [metricKey]: toNumber(row[metricKey]),
    }))
    .filter((row) => row[metricKey] !== null);

  if (data.length === 0) {
    return null;
  }

  const title = buildChartTitle(logic, "bar", result, categoryKey || columns[0], metricKey);

  return (
    <section className="chart-section">
      <div className="chart-header">
        <div className="section-label">
          <TrendingUp size={16} />
          Visualization
        </div>
        <h3>{title}</h3>
      </div>
      {renderChartContent({
        chartType: "bar",
        data,
        categoryKey: categoryKey || columns[0],
        metricKey,
        title,
        logic,
      })}
    </section>
  );
}

export default AnalyticsChart;
