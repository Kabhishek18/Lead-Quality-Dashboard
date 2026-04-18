import { useEffect, useMemo, useState } from "react";
import { ExecutiveSummary } from "./components/ExecutiveSummary";
import { GeoChart } from "./components/GeoChart";
import { LeadsTable } from "./components/LeadsTable";
import { Methodology } from "./components/Methodology";
import { SourceChart } from "./components/SourceChart";
import { TrendChart } from "./components/TrendChart";
import { aggregateBySource, aggregateByState, aggregateWeeklyBySource, uniqueSources, uniqueStates } from "./lib/metrics";
import { loadLeadsFromUrl } from "./lib/parseLeads";
import { computeTrendDeltaForSource } from "./lib/trends";
import { verdictForSource } from "./lib/verdict";
import type { LeadRecord } from "./types/lead";

export default function App() {
  const [leads, setLeads] = useState<LeadRecord[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [geoSource, setGeoSource] = useState("");

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}leads_dataset.csv`;
    loadLeadsFromUrl(url)
      .then((r) => {
        setLeads(r.leads);
        setParseWarnings(r.errors);
      })
      .catch((e: unknown) => {
        setLoadError(e instanceof Error ? e.message : String(e));
      });
  }, []);

  const sourceMetrics = useMemo(
    () => (leads ? aggregateBySource(leads) : []),
    [leads],
  );

  const weekly = useMemo(
    () => (leads ? aggregateWeeklyBySource(leads) : []),
    [leads],
  );

  const stateMetrics = useMemo(
    () => (leads ? aggregateByState(leads, geoSource || null) : []),
    [leads, geoSource],
  );

  const summaryRows = useMemo(() => {
    return sourceMetrics.map((m) => ({
      metrics: m,
      verdict: verdictForSource(
        m,
        computeTrendDeltaForSource(weekly, m.source),
      ),
    }));
  }, [sourceMetrics, weekly]);

  const sources = useMemo(
    () => (leads ? uniqueSources(leads) : []),
    [leads],
  );

  const states = useMemo(
    () => (leads ? uniqueStates(leads) : []),
    [leads],
  );

  if (loadError) {
    return (
      <div className="app-shell">
        <div className="error-banner" role="alert">
          Failed to load data: {loadError}
        </div>
      </div>
    );
  }

  if (!leads) {
    return (
      <div className="app-shell">
        <p className="hint">Loading leads…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Lead Quality Dashboard</h1>
        <p className="sub">
          For carrier account managers: compare sources on acceptance quality, operational
          friction, and hygiene—then decide what to scale vs cut.
        </p>
        <p className="meta">
          {leads.length} leads loaded · static demo · replace{" "}
          <code style={{ fontSize: "0.85em" }}>VITE_BASE</code> / repo name for GitHub Pages
        </p>
      </header>

      {parseWarnings.length > 0 ? (
        <div className="error-banner" role="status">
          Parse notices ({parseWarnings.length}): {parseWarnings.slice(0, 3).join(" · ")}
          {parseWarnings.length > 3 ? " …" : ""}
        </div>
      ) : null}

      <ExecutiveSummary rows={summaryRows} />
      <SourceChart metrics={sourceMetrics} />
      <TrendChart weekly={weekly} />
      <GeoChart
        metrics={stateMetrics}
        sourceFilter={geoSource}
        onSourceChange={setGeoSource}
        sources={sources}
      />
      <LeadsTable leads={leads} sources={sources} states={states} />
      <Methodology />
    </div>
  );
}
