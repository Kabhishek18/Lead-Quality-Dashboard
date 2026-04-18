import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeekBucket } from "../types/lead";

const PALETTE = [
  "#3d8bfd",
  "#5ee4b8",
  "#f0d060",
  "#ff8a8a",
  "#c084fc",
  "#38bdf8",
  "#fb7185",
];

export function TrendChart({ weekly }: { weekly: WeekBucket[] }) {
  const sources = useMemo(() => {
    return [...new Set(weekly.map((w) => w.source))].sort();
  }, [weekly]);

  const [active, setActive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActive(Object.fromEntries(sources.map((s) => [s, true])));
  }, [sources]);

  const chartData = useMemo(() => {
    const weeks = [...new Set(weekly.map((w) => w.weekLabel))].sort();
    return weeks.map((weekLabel) => {
      const row: Record<string, string | number | null> = { weekLabel };
      for (const s of sources) {
        const w = weekly.find(
          (x) => x.weekLabel === weekLabel && x.source === s,
        );
        row[s] =
          w?.strictAcceptanceRate != null
            ? w.strictAcceptanceRate * 100
            : null;
      }
      return row;
    });
  }, [weekly, sources]);

  return (
    <section className="panel" aria-labelledby="trend-heading">
      <h2 id="trend-heading">Weekly strict acceptance by source</h2>
      <p className="hint">
        Toggle sources below. Missing weeks for a source appear as gaps.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.65rem",
          marginBottom: "0.75rem",
        }}
      >
        {sources.map((s, i) => (
          <label
            key={s}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.8rem",
              color: "var(--muted)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={active[s] !== false}
              onChange={() =>
                setActive((prev) => ({ ...prev, [s]: !prev[s] }))
              }
              aria-label={`Toggle ${s}`}
            />
            <span style={{ color: PALETTE[i % PALETTE.length] }}>{s}</span>
          </label>
        ))}
      </div>
      <div className="chart-h tall">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3544" />
            <XAxis dataKey="weekLabel" tick={{ fill: "#8b9cb3", fontSize: 10 }} />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#8b9cb3", fontSize: 11 }}
              label={{
                value: "%",
                angle: 0,
                position: "insideTopLeft",
                fill: "#8b9cb3",
              }}
            />
            <Tooltip
              contentStyle={{
                background: "#1a222d",
                border: "1px solid #2a3544",
                borderRadius: 8,
              }}
            />
            <Legend />
            {sources.map((s, i) =>
              active[s] === false ? null : (
                <Line
                  key={s}
                  type="monotone"
                  dataKey={s}
                  name={s}
                  stroke={PALETTE[i % PALETTE.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ),
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
