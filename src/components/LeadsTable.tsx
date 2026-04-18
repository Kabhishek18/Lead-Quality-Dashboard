import { useMemo, useState } from "react";
import type { LeadRecord } from "../types/lead";

type SortKey =
  | "leadId"
  | "source"
  | "occurredAt"
  | "formCompletionSec"
  | "state"
  | "carrierStatus";

function downloadCsv(filename: string, rows: LeadRecord[]) {
  const headers = [
    "lead_id",
    "lead_name",
    "source",
    "timestamp",
    "form_completion_time_sec",
    "state",
    "pincode",
    "phone_number",
    "carrier_acceptance_status",
    "phone_issue",
  ];
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.leadId,
        r.leadName,
        r.source,
        r.timestampRaw,
        r.formCompletionSec ?? "",
        r.state,
        r.pincode,
        r.phoneDigits,
        r.carrierStatus,
        r.phoneIssue ? "yes" : "no",
      ]
        .map((c) => escape(String(c)))
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function LeadsTable({
  leads,
  sources,
  states,
}: {
  leads: LeadRecord[];
  sources: string[];
  states: string[];
}) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [state, setState] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("occurredAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (source && l.source !== source) return false;
      if (state && l.state !== state) return false;
      if (status && l.carrierStatus !== status) return false;
      if (l.occurredAt) {
        const t = l.occurredAt.getTime();
        if (dateFrom) {
          const d = new Date(dateFrom);
          if (t < d.getTime()) return false;
        }
        if (dateTo) {
          const d = new Date(dateTo);
          d.setHours(23, 59, 59, 999);
          if (t > d.getTime()) return false;
        }
      } else if (dateFrom || dateTo) return false;
      if (!ql) return true;
      const blob = [
        l.leadId,
        l.leadName,
        l.source,
        l.state,
        l.phoneDigits,
        l.carrierStatus,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(ql);
    });
  }, [leads, q, source, state, status, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      let va: string | number | null = null;
      let vb: string | number | null = null;
      switch (sortKey) {
        case "leadId":
          va = a.leadId;
          vb = b.leadId;
          break;
        case "source":
          va = a.source;
          vb = b.source;
          break;
        case "occurredAt":
          va = a.occurredAt?.getTime() ?? 0;
          vb = b.occurredAt?.getTime() ?? 0;
          break;
        case "formCompletionSec":
          va = a.formCompletionSec ?? -1;
          vb = b.formCompletionSec ?? -1;
          break;
        case "state":
          va = a.state;
          vb = b.state;
          break;
        case "carrierStatus":
          va = a.carrierStatus;
          vb = b.carrierStatus;
          break;
        default:
          return 0;
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "leadId" || key === "source" ? "asc" : "desc");
    }
  }

  return (
    <section className="panel" aria-labelledby="table-heading">
      <h2 id="table-heading">Lead-level data</h2>
      <div className="filters">
        <label>
          Search
          <input
            type="search"
            placeholder="ID, name, source, state…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search leads"
          />
        </label>
        <label>
          Source
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">All</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          State
          <select value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">All</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
        </label>
        <label>
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="From date"
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="To date"
          />
        </label>
        <button
          type="button"
          className="export-btn"
          onClick={() =>
            downloadCsv("filtered_leads.csv", sorted)
          }
        >
          Export CSV
        </button>
      </div>
      <p className="hint">
        Showing {sorted.length} of {leads.length} rows (filtered).
      </p>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th scope="col">
                <button type="button" className="sort" onClick={() => toggleSort("leadId")}>
                  Lead ID {sortKey === "leadId" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th scope="col">Name</th>
              <th scope="col">
                <button type="button" className="sort" onClick={() => toggleSort("source")}>
                  Source {sortKey === "source" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th scope="col">
                <button type="button" className="sort" onClick={() => toggleSort("occurredAt")}>
                  Time {sortKey === "occurredAt" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th scope="col">
                <button type="button" className="sort" onClick={() => toggleSort("formCompletionSec")}>
                  Form (s) {sortKey === "formCompletionSec" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th scope="col">
                <button type="button" className="sort" onClick={() => toggleSort("state")}>
                  State {sortKey === "state" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th scope="col">Pincode</th>
              <th scope="col">Phone</th>
              <th scope="col">Issue</th>
              <th scope="col">
                <button type="button" className="sort" onClick={() => toggleSort("carrierStatus")}>
                  Status {sortKey === "carrierStatus" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 500).map((l) => (
              <tr key={l.leadId}>
                <td>{l.leadId}</td>
                <td>{l.leadName}</td>
                <td>{l.source}</td>
                <td>
                  {l.occurredAt
                    ? l.occurredAt.toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "—"}
                </td>
                <td>{l.formCompletionSec ?? "—"}</td>
                <td>{l.state}</td>
                <td>{l.pincode}</td>
                <td style={{ fontFamily: "var(--mono)", fontSize: "0.8rem" }}>
                  {l.phoneDigits}
                </td>
                <td>{l.phoneIssue ? (l.phoneIssueReason ?? "yes") : "—"}</td>
                <td>{l.carrierStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > 500 ? (
        <p className="hint">Only first 500 rows shown; export CSV for full filtered set.</p>
      ) : null}
    </section>
  );
}
