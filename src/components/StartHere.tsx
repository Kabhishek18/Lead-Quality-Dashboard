export function StartHere() {
  return (
    <section
      className="panel start-here"
      id="start"
      aria-labelledby="start-heading"
    >
      <h2 id="start-heading" className="start-here-title">
        Start here
      </h2>
      <ul className="start-here-list">
        <li>
          <strong>Strict acceptance</strong> uses decided leads only (Accepted ÷
          Accepted+Rejected). <strong>Pending</strong> is separate.
        </li>
        <li>
          <strong>Verdict</strong> (Scale / Watch / Cut) uses thresholds in{" "}
          <a href="#methodology">Methodology</a>—plus volume, pending risk, and
          week-over-week trend.
        </li>
        <li>
          Use the <strong>section links</strong> below to jump to Summary, charts,
          geography, or the lead table.
        </li>
      </ul>
    </section>
  );
}
