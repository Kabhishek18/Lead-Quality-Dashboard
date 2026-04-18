import type {
  LeadRecord,
  SourceMetrics,
  StateMetrics,
  WeekBucket,
} from "../types/lead";
import { LOW_CONFIDENCE_N } from "./constants";

function percentile(sorted: number[], p: number): number | null {
  if (!sorted.length) return null;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? null;
}

function median(sorted: number[]): number | null {
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[mid] ?? null;
  return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function weekLabel(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${d.getFullYear()}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function aggregateBySource(leads: LeadRecord[]): SourceMetrics[] {
  const by = new Map<string, LeadRecord[]>();
  for (const l of leads) {
    const list = by.get(l.source) ?? [];
    list.push(l);
    by.set(l.source, list);
  }

  const out: SourceMetrics[] = [];

  for (const [source, list] of by) {
    let accepted = 0;
    let rejected = 0;
    let pending = 0;
    let phoneIssues = 0;
    let missingForm = 0;
    const formTimes: number[] = [];

    for (const l of list) {
      if (l.carrierStatus === "Accepted") accepted++;
      else if (l.carrierStatus === "Rejected") rejected++;
      else pending++;
      if (l.phoneIssue) phoneIssues++;
      if (l.formCompletionSec == null) missingForm++;
      else formTimes.push(l.formCompletionSec);
    }

    formTimes.sort((a, b) => a - b);
    const decided = accepted + rejected;
    const strictAcceptanceRate =
      decided > 0 ? accepted / decided : null;
    const totalLeads = list.length;
    const pendingRatio = totalLeads > 0 ? pending / totalLeads : 0;
    const missingFormRatio = totalLeads > 0 ? missingForm / totalLeads : 0;
    const phoneIssuesRatio = totalLeads > 0 ? phoneIssues / totalLeads : 0;

    out.push({
      source,
      totalLeads,
      accepted,
      rejected,
      pending,
      strictAcceptanceRate,
      pendingRatio,
      medianFormSec: median(formTimes),
      p90FormSec: percentile(formTimes, 90),
      missingFormRatio,
      phoneIssuesRatio,
      lowConfidence: totalLeads < LOW_CONFIDENCE_N,
    });
  }

  out.sort((a, b) => b.totalLeads - a.totalLeads);
  return out;
}

export function aggregateByState(
  leads: LeadRecord[],
  sourceFilter?: string | null,
): StateMetrics[] {
  const filtered = sourceFilter
    ? leads.filter((l) => l.source === sourceFilter)
    : leads;
  const by = new Map<string, LeadRecord[]>();
  for (const l of filtered) {
    const list = by.get(l.state) ?? [];
    list.push(l);
    by.set(l.state, list);
  }

  const out: StateMetrics[] = [];
  for (const [state, list] of by) {
    let accepted = 0;
    let rejected = 0;
    for (const l of list) {
      if (l.carrierStatus === "Accepted") accepted++;
      else if (l.carrierStatus === "Rejected") rejected++;
    }
    const decided = accepted + rejected;
    out.push({
      state,
      totalLeads: list.length,
      strictAcceptanceRate: decided > 0 ? accepted / decided : null,
    });
  }
  out.sort((a, b) => b.totalLeads - a.totalLeads);
  return out;
}

export function aggregateWeeklyBySource(leads: LeadRecord[]): WeekBucket[] {
  const withDate = leads.filter((l) => l.occurredAt);
  const keys = new Set<string>();

  for (const l of withDate) {
    const ws = startOfWeek(l.occurredAt!);
    keys.add(`${weekLabel(ws)}|${l.source}`);
  }

  const buckets = new Map<
    string,
    { weekStart: Date; source: string; accepted: number; decided: number; total: number }
  >();

  for (const l of withDate) {
    const ws = startOfWeek(l.occurredAt!);
    const k = `${weekLabel(ws)}|${l.source}`;
    let b = buckets.get(k);
    if (!b) {
      b = {
        weekStart: new Date(ws),
        source: l.source,
        accepted: 0,
        decided: 0,
        total: 0,
      };
      buckets.set(k, b);
    }
    b.total++;
    if (l.carrierStatus === "Pending") continue;
    b.decided++;
    if (l.carrierStatus === "Accepted") b.accepted++;
  }

  const out: WeekBucket[] = [];
  for (const b of buckets.values()) {
    out.push({
      weekLabel: weekLabel(b.weekStart),
      weekStart: b.weekStart,
      source: b.source,
      totalLeads: b.total,
      decidedLeads: b.decided,
      accepted: b.accepted,
      strictAcceptanceRate:
        b.decided > 0 ? b.accepted / b.decided : null,
    });
  }

  out.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  return out;
}

export function uniqueSources(leads: LeadRecord[]): string[] {
  return [...new Set(leads.map((l) => l.source))].sort();
}

export function uniqueStates(leads: LeadRecord[]): string[] {
  return [...new Set(leads.map((l) => l.state))].sort();
}
