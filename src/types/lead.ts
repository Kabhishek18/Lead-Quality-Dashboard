export type CarrierStatus = "Accepted" | "Rejected" | "Pending";

export interface RawLeadRow {
  lead_id: string;
  lead_name: string;
  source: string;
  timestamp: string;
  form_completion_time_sec: string;
  state: string;
  pincode: string;
  phone_number: string;
  carrier_acceptance_status: string;
}

export interface LeadRecord {
  leadId: string;
  leadName: string;
  source: string;
  timestampRaw: string;
  occurredAt: Date | null;
  formCompletionSec: number | null;
  state: string;
  pincode: string;
  phoneDigits: string;
  carrierStatus: CarrierStatus;
  /** Derived: invalid pattern or duplicate phone in dataset */
  phoneIssue: boolean;
  phoneIssueReason: "invalid_pattern" | "duplicate" | null;
  /** Pincode not exactly 6 digits */
  pincodeInvalid: boolean;
}

export type Verdict = "scale" | "watch" | "cut";

export interface SourceMetrics {
  source: string;
  totalLeads: number;
  accepted: number;
  rejected: number;
  pending: number;
  /** Accepted / (Accepted + Rejected), null if denominator 0 */
  strictAcceptanceRate: number | null;
  pendingRatio: number;
  medianFormSec: number | null;
  p90FormSec: number | null;
  missingFormRatio: number;
  phoneIssuesRatio: number;
  lowConfidence: boolean;
}

export interface StateMetrics {
  state: string;
  totalLeads: number;
  strictAcceptanceRate: number | null;
}

export interface WeekBucket {
  weekLabel: string;
  weekStart: Date;
  source: string;
  totalLeads: number;
  decidedLeads: number;
  accepted: number;
  strictAcceptanceRate: number | null;
}

export interface TrendDelta {
  improving: boolean | null;
  /** Last period strict rate minus previous */
  deltaRate: number | null;
}
