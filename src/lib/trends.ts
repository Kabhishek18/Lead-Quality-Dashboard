import type { TrendDelta, WeekBucket } from "../types/lead";

/** Week-over-week change in strict acceptance for a source (last vs previous week with data). */
export function computeTrendDeltaForSource(
  weekly: WeekBucket[],
  source: string,
): TrendDelta {
  const rows = weekly
    .filter((w) => w.source === source)
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  if (rows.length < 2) return { improving: null, deltaRate: null };
  const last = rows[rows.length - 1]!;
  const prev = rows[rows.length - 2]!;
  const a = last.strictAcceptanceRate;
  const b = prev.strictAcceptanceRate;
  if (a == null || b == null) return { improving: null, deltaRate: null };
  const deltaRate = a - b;
  return { improving: deltaRate >= 0, deltaRate };
}
