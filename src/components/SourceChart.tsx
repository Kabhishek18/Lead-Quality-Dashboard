import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SourceMetrics } from "../types/lead";

export function SourceChart({ metrics }: { metrics: SourceMetrics[] }) {
  const data = metrics.map((m) => ({
    source: m.source.replace(/_/g, " "),
    fullSource: m.source,
    strictPct: m.strictAcceptanceRate != null ? m.strictAcceptanceRate * 100 : null,
    volume: m.totalLeads,
  }));

  return (
    <section className="panel" aria-labelledby="source-chart-heading">
      <h2 id="source-chart-heading">Acceptance vs volume by source</h2>
      <p className="hint">
        Bars: strict acceptance %. Line overlay could be added; volume shown in
        tooltip.
      </p>
      <div className="chart-h">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3544" />
            <XAxis
              dataKey="source"
              tick={{ fill: "#8b9cb3", fontSize: 11 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={70}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#8b9cb3", fontSize: 11 }}
              label={{
                value: "Strict acceptance %",
                angle: -90,
                position: "insideLeft",
                fill: "#8b9cb3",
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                background: "#1a222d",
                border: "1px solid #2a3544",
                borderRadius: 8,
              }}
              formatter={(value: number, _name: string, item: { payload?: { volume?: number } }) => [
                `${value?.toFixed(1)}% · vol ${item.payload?.volume ?? "—"}`,
                "Strict acceptance",
              ]}
            />
            <Legend />
            <Bar
              name="Strict acceptance %"
              dataKey="strictPct"
              fill="#3d8bfd"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
