import type { SourceMetrics, TrendDelta, Verdict } from "../types/lead";

/** Lower sorts first. Scale → Watch → Cut in table when ascending. */
export const VERDICT_SORT_RANK: Record<Verdict, number> = {
  scale: 0,
  watch: 1,
  cut: 2,
};
import {
  CUTOFF_ACCEPTANCE_STRICT,
  MIN_LEADS_FOR_CONFIDENCE,
  PENDING_MAX_FOR_SCALE,
  PHONE_ISSUES_CUT_THRESHOLD,
  SCALE_ACCEPTANCE_MIN,
} from "./constants";

/**
 * Heuristic verdict for account managers. Documented in methodology UI.
 */
export function verdictForSource(
  m: SourceMetrics,
  trend: TrendDelta | null,
): Verdict {
  const rate = m.strictAcceptanceRate;

  if (m.totalLeads < MIN_LEADS_FOR_CONFIDENCE) {
    return "watch";
  }

  if (m.phoneIssuesRatio >= PHONE_ISSUES_CUT_THRESHOLD) {
    return "cut";
  }

  if (rate != null && rate < CUTOFF_ACCEPTANCE_STRICT) {
    return "cut";
  }

  if (
    rate != null &&
    rate >= SCALE_ACCEPTANCE_MIN &&
    m.pendingRatio <= PENDING_MAX_FOR_SCALE
  ) {
    if (trend?.improving === false) return "watch";
    return "scale";
  }

  return "watch";
}

export function compareVerdictTier(a: Verdict, b: Verdict): number {
  return VERDICT_SORT_RANK[a] - VERDICT_SORT_RANK[b];
}

export function describeVerdict(v: Verdict): string {
  switch (v) {
    case "scale":
      return "Scale";
    case "cut":
      return "Cut";
    default:
      return "Watch";
  }
}
