import Papa from "papaparse";
import type { CarrierStatus, LeadRecord, RawLeadRow } from "../types/lead";

function normalizeStatus(raw: string): CarrierStatus | null {
  const s = raw.trim();
  if (s === "Accepted" || s === "Rejected" || s === "Pending") return s;
  return null;
}

/** DD/MM/YY HH:mm or DD/MM/YY H:mm */
export function parseOccurredAt(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const [datePart, ...timeParts] = trimmed.split(/\s+/);
  if (!datePart) return null;
  const parts = datePart.split("/").map((p) => Number(p));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [day, month, yy] = parts;
  const year = yy < 100 ? 2000 + yy : yy;
  let h = 0;
  let min = 0;
  if (timeParts.length) {
    const t = timeParts.join(" ");
    const tm = t.split(":");
    if (tm.length >= 2) {
      h = Number(tm[0]) || 0;
      min = Number(tm[1]) || 0;
    }
  }
  const d = new Date(year, month - 1, day, h, min, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Heuristic invalid: wrong length, all same digit, or obvious test pattern */
export function isInvalidPhonePattern(digits: string): boolean {
  if (digits.length !== 10) return true;
  if (/^(\d)\1{9}$/.test(digits)) return true;
  if (digits === "9999999999" || digits === "0000000000") return true;
  return false;
}

function parseFormSec(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export interface ParseResult {
  leads: LeadRecord[];
  errors: string[];
}

export function parseLeadsCsv(text: string): ParseResult {
  const parsed = Papa.parse<RawLeadRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const errors: string[] = [];
  if (parsed.errors.length) {
    for (const e of parsed.errors.slice(0, 20)) {
      errors.push(e.message ?? String(e));
    }
  }

  const rows: Omit<LeadRecord, "phoneIssue" | "phoneIssueReason">[] = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const line = i + 2;
    const status = normalizeStatus(row.carrier_acceptance_status ?? "");
    if (!status) {
      errors.push(`Line ${line}: invalid carrier_acceptance_status`);
      continue;
    }
    const phoneDigits = digitsOnly(row.phone_number ?? "");
    const pincode = String(row.pincode ?? "").trim();
    const pincodeInvalid = !/^\d{6}$/.test(pincode);

    rows.push({
      leadId: String(row.lead_id ?? "").trim(),
      leadName: String(row.lead_name ?? "").trim(),
      source: String(row.source ?? "").trim() || "Unknown",
      timestampRaw: String(row.timestamp ?? "").trim(),
      occurredAt: parseOccurredAt(String(row.timestamp ?? "")),
      formCompletionSec: parseFormSec(String(row.form_completion_time_sec ?? "")),
      state: String(row.state ?? "").trim() || "Unknown",
      pincode,
      phoneDigits,
      carrierStatus: status,
      pincodeInvalid,
    });
  }

  const phoneCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.phoneDigits.length === 10) {
      phoneCounts.set(r.phoneDigits, (phoneCounts.get(r.phoneDigits) ?? 0) + 1);
    }
  }

  const leads: LeadRecord[] = rows.map((r) => {
    const invalidPattern = isInvalidPhonePattern(r.phoneDigits);
    const duplicate =
      r.phoneDigits.length === 10 && (phoneCounts.get(r.phoneDigits) ?? 0) > 1;
    const phoneIssue = invalidPattern || duplicate;
    let phoneIssueReason: LeadRecord["phoneIssueReason"] = null;
    if (invalidPattern) phoneIssueReason = "invalid_pattern";
    else if (duplicate) phoneIssueReason = "duplicate";

    return {
      ...r,
      phoneIssue,
      phoneIssueReason,
    };
  });

  return { leads, errors };
}

export async function loadLeadsFromUrl(url: string): Promise<ParseResult> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const text = await res.text();
  return parseLeadsCsv(text);
}
