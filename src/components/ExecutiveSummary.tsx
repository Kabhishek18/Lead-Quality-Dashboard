import type { SourceMetrics, Verdict } from "../types/lead";
import {
  CUTOFF_ACCEPTANCE_STRICT,
  MIN_LEADS_FOR_CONFIDENCE,
  PENDING_MAX_FOR_SCALE,
  PHONE_ISSUES_CUT_THRESHOLD,
  SCALE_ACCEPTANCE_MIN,
} from "../lib/constants";
import { describeVerdict } from "../lib/verdict";

function pct(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

function VerdictBadge({ v }: { v: Verdict }) {
  return <span className={`badge ${v}`}>{describeVerdict(v)}</span>;
}

function VerdictLegend() {
  return (
    <div className="verdict-legend" aria-label="Verdict color key">
      <span className="verdict-legend-label">Verdict:</span>
      <span className="badge scale">{describeVerdict("scale")}</span>
      <span className="verdict-legend-hint">prioritize scaling</span>
      <span className="badge watch">{describeVerdict("watch")}</span>
      <span className="verdict-legend-hint">review</span>
      <span className="badge cut">{describeVerdict("cut")}</span>
      <span className="verdict-legend-hint">reduce or fix</span>
    </div>
  );
}

export function ExecutiveSummary({
  rows,
}: {
  rows: { metrics: SourceMetrics; verdict: Verdict }[];
}) {
  return (
    <section className="panel" id="summary" aria-labelledby="exec-heading">
      <h2 id="exec-heading">Executive summary</h2>
      <VerdictLegend />
      <p className="hint">
        Sorted by verdict (Scale → Watch → Cut), then by lead volume. Verdict uses
        strict acceptance, pending risk, phone hygiene, and week-over-week trend
        (see methodology).
      </p>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th scope="col">Source</th>
              <th scope="col">Leads</th>
              <th scope="col">
                <span
                  className="tooltip-h"
                  title="Accepted ÷ (Accepted + Rejected). Pending excluded from denominator."
                >
                  Strict acceptance
                </span>
              </th>
              <th scope="col">Pending %</th>
              <th scope="col">
                <span
                  className="tooltip-h"
                  title="Median seconds; empty cells counted as missing."
                >
                  Median form (s)
                </span>
              </th>
              <th scope="col">
                <span
                  className="tooltip-h"
                  title="Invalid 10-digit pattern or duplicate phone in dataset."
                >
                  Phone issues
                </span>
              </th>
              <th scope="col">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ metrics: m, verdict }) => (
              <tr key={m.source}>
                <td>
                  <strong>{m.source}</strong>
                  {m.lowConfidence ? (
                    <span className="low-conf"> · low n</span>
                  ) : null}
                </td>
                <td>{m.totalLeads}</td>
                <td>{pct(m.strictAcceptanceRate)}</td>
                <td>{pct(m.pendingRatio)}</td>
                <td>
                  {m.medianFormSec != null
                    ? m.medianFormSec.toFixed(1)
                    : "—"}
                </td>
                <td>{pct(m.phoneIssuesRatio)}</td>
                <td>
                  <VerdictBadge v={verdict} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="methodology">
        <summary>Threshold constants (from code)</summary>
        <div className="inner">
          <ul>
            <li>
              <strong>Min leads for scale/cut confidence:</strong>{" "}
              {MIN_LEADS_FOR_CONFIDENCE}
            </li>
            <li>
              <strong>Cut</strong> if strict rate &lt;{" "}
              {(CUTOFF_ACCEPTANCE_STRICT * 100).toFixed(0)}% (with sufficient n),
              or phone issues ≥ {(PHONE_ISSUES_CUT_THRESHOLD * 100).toFixed(0)}%.
            </li>
            <li>
              <strong>Scale</strong> if strict rate ≥{" "}
              {(SCALE_ACCEPTANCE_MIN * 100).toFixed(0)}%, pending ≤{" "}
              {(PENDING_MAX_FOR_SCALE * 100).toFixed(0)}%, and WoW trend is not
              declining.
            </li>
          </ul>
        </div>
      </details>
    </section>
  );
}
