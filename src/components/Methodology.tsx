import {
  CUTOFF_ACCEPTANCE_STRICT,
  LOW_CONFIDENCE_N,
  MIN_LEADS_FOR_CONFIDENCE,
  PENDING_MAX_FOR_SCALE,
  PHONE_ISSUES_CUT_THRESHOLD,
  SCALE_ACCEPTANCE_MIN,
} from "../lib/constants";

export function Methodology() {
  return (
    <section className="panel" id="methodology" aria-labelledby="method-heading">
      <h2 id="method-heading">Methodology</h2>
      <div className="inner methodology">
          <p>
            This dashboard is a static analytics view for a <strong>carrier account manager</strong>{" "}
            comparing lead sources on quality—not only volume. Metrics are computed in the browser
            from the bundled CSV; there is no backend.
          </p>
          <ul>
            <li>
              <strong>Strict acceptance rate:</strong> Accepted ÷ (Accepted + Rejected).{" "}
              <strong>Pending</strong> leads are excluded from the denominator so rates reflect
              decided carrier outcomes. Pending share is shown separately as pipeline risk.
            </li>
            <li>
              <strong>Phone issues:</strong> There is no validity column in the file. We flag rows
              where the phone is not 10 digits, all digits are identical, obvious test patterns, or
              the same 10-digit number appears on more than one lead (possible resubmits).
            </li>
            <li>
              <strong>Pincode:</strong> We flag non–six-digit pincodes as a data hygiene signal (not
              used to change acceptance math).
            </li>
            <li>
              <strong>Form completion time:</strong> Median / p90 use non-empty values only; we
              report the share of rows with missing duration.
            </li>
            <li>
              <strong>Weekly trend:</strong> For the verdict, we compare the last two ISO weeks with
              data per source (week-over-week strict rate). If the latest week is lower than the
              prior week, we do not label the source <strong>Scale</strong>.
            </li>
            <li>
              <strong>Verdict thresholds (tunable in code):</strong> Minimum{" "}
              {MIN_LEADS_FOR_CONFIDENCE} leads before Scale/Cut (otherwise <strong>Watch</strong>).
              <strong> Cut</strong> if strict rate &lt;{" "}
              {(CUTOFF_ACCEPTANCE_STRICT * 100).toFixed(0)}% or phone-issue rate ≥{" "}
              {(PHONE_ISSUES_CUT_THRESHOLD * 100).toFixed(0)}%. <strong>Scale</strong> if strict rate
              ≥ {(SCALE_ACCEPTANCE_MIN * 100).toFixed(0)}%, pending ≤{" "}
              {(PENDING_MAX_FOR_SCALE * 100).toFixed(0)}%, and WoW trend is not down. Sources with
              n &lt; {LOW_CONFIDENCE_N} are labeled <em>low n</em> in the summary table.
            </li>
          </ul>
      </div>
    </section>
  );
}
