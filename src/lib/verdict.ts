import type { SourceMetrics, TrendDelta, Verdict } from "../types/lead";
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
