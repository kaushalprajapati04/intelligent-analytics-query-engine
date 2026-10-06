import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Package, ShoppingCart, Wallet } from "lucide-react";

const KPI_CONFIG = [
  { key: "total_revenue", label: "Total revenue", icon: Wallet, format: "currency" },
  { key: "total_orders", label: "Total orders", icon: ShoppingCart, format: "count" },
  { key: "total_profit", label: "Total profit", icon: BarChart3, format: "currency" },
  { key: "product_count", label: "Products", icon: Package, format: "count" },
];

function formatValue(value, format) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return null;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: format === "currency" ? 2 : 0,
    maximumFractionDigits: format === "currency" ? 2 : 0,
  }).format(Number(value));

  return formatted;
}

function formatAxisValue(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(number)
    : value;
}

function formatTooltip(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number)
    : "N/A";
}

function ChartPanel({ title, label, data, type }) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const categoryKey = type === "monthly" ? "time_period" : type === "products" ? "product_name" : "region";

  return (
    <section className="overview-chart-panel" aria-label={title}>
      <h3>{title}</h3>
      <div className="overview-chart" role="img" aria-label={`${title} chart`}>
        <ResponsiveContainer width="100%" height={260}>
          {type === "monthly" ? (
            <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#edf0f5" vertical={false} />
              <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={formatAxisValue} />
              <Tooltip formatter={formatTooltip} />
              <Line type="monotone" dataKey="revenue" name={label} stroke="#1769aa" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          ) : type === "products" ? (
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 12, left: 8, bottom: 8 }}
            >
              <CartesianGrid stroke="#edf0f5" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={formatAxisValue} />
              <YAxis type="category" dataKey={categoryKey} width={105} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <Tooltip formatter={formatTooltip} />
              <Bar dataKey="revenue" name={label} fill="#1769aa" radius={[0, 7, 7, 0]} />
            </BarChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#edf0f5" vertical={false} />
              <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={formatAxisValue} />
              <Tooltip formatter={formatTooltip} />
              <Bar dataKey="revenue" name={label} fill="#1769aa" radius={[7, 7, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function DashboardOverview({ overview, loading, error }) {
  const metrics = overview?.metrics || {};
  const charts = overview?.charts || {};
  const cards = KPI_CONFIG
    .map((item) => ({ ...item, value: formatValue(metrics[item.key], item.format) }))
    .filter((item) => item.value !== null);

  return (
    <section className="dashboard-overview" aria-labelledby="overview-heading">
      <div className="overview-heading">
        <div>
          <div className="section-label">
            <BarChart3 size={16} />
            Dataset overview
          </div>
          <h2 id="overview-heading">Sales at a glance</h2>
          <p>Summary metrics and charts calculated from the loaded sales dataset.</p>
        </div>
      </div>

      {loading ? (
        <p className="overview-status" role="status">Loading verified dataset metrics…</p>
      ) : error ? (
        <p className="overview-status overview-error" role="status">
          Dataset overview is temporarily unavailable. You can still submit an analysis query.
        </p>
      ) : (
        <>
          {cards.length > 0 && (
            <div className="overview-kpis">
              {cards.map(({ key, label, icon: Icon, value }) => (
                <article className="overview-kpi" key={key}>
                  <div className="overview-kpi-icon"><Icon size={17} /></div>
                  <div>
                    <p>{label}</p>
                    <strong>{value}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="overview-charts">
            <ChartPanel
              title="Revenue by region"
              label="Revenue"
              data={charts.revenue_by_region}
              type="region"
            />
            <ChartPanel
              title="Monthly revenue"
              label="Revenue"
              data={charts.monthly_revenue}
              type="monthly"
            />
            <ChartPanel
              title="Top products by revenue"
              label="Revenue"
              data={charts.top_products_by_revenue}
              type="products"
            />
          </div>

          {cards.length === 0 && Object.values(charts).every((data) => !data?.length) && (
            <p className="overview-status">No overview metrics are available for the loaded dataset.</p>
          )}
        </>
      )}
    </section>
  );
}

export default DashboardOverview;
