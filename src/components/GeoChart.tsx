import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StateMetrics } from "../types/lead";

export function GeoChart({
  metrics,
  sourceFilter,
  onSourceChange,
  sources,
}: {
  metrics: StateMetrics[];
  sourceFilter: string;
  onSourceChange: (v: string) => void;
  sources: string[];
}) {
  const top = metrics.slice(0, 12);
  const data = top.map((m) => ({
    state: m.state,
    strictPct:
      m.strictAcceptanceRate != null ? m.strictAcceptanceRate * 100 : null,
    n: m.totalLeads,
  }));

  return (
    <section className="panel" id="geo" aria-labelledby="geo-heading">
      <h2 id="geo-heading">Geography: strict acceptance by state</h2>
      <div className="filters">
        <label>
          Filter by source
          <select
            value={sourceFilter}
            onChange={(e) => onSourceChange(e.target.value)}
            aria-label="Filter geography by lead source"
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="hint">Top 12 states by volume in current filter.</p>
      <div className="chart-h">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3544" />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#8b9cb3", fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="state"
              width={100}
              tick={{ fill: "#8b9cb3", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: "#1a222d",
                border: "1px solid #2a3544",
                borderRadius: 8,
              }}
              formatter={(value: number, _n, item: { payload?: { n?: number } }) => [
                `${value?.toFixed(1)}% (n=${item.payload?.n ?? "—"})`,
                "Strict acceptance",
              ]}
            />
            <Bar dataKey="strictPct" fill="#2d9d78" radius={[0, 4, 4, 0]} name="Strict %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
