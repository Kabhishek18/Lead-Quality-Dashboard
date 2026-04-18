/**
 * Thresholds for scale / watch / cut verdicts.
 * Adjust here only — UI tooltips reference these labels.
 */

/** Minimum leads before we trust strict acceptance rate for cut/scale */
export const MIN_LEADS_FOR_CONFIDENCE = 30;

/** Strict acceptance below this → candidate for "cut" (if n sufficient) */
export const CUTOFF_ACCEPTANCE_STRICT = 0.45;

/** Strict acceptance at or above this → candidate for "scale" */
export const SCALE_ACCEPTANCE_MIN = 0.58;

/** Pending share above this blocks "scale" */
export const PENDING_MAX_FOR_SCALE = 0.12;

/** Phone issue rate at or above → "cut" regardless of acceptance */
export const PHONE_ISSUES_CUT_THRESHOLD = 0.18;

/** Wilson / low-n: mark source as low confidence below this n */
export const LOW_CONFIDENCE_N = 30;
