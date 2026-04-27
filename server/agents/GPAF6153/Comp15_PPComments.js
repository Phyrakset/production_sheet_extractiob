/**
 * GPAF6153-specific extraction agent for Comp15_PPComments
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "sampleType": "string", "submissionDate": "string", "approvalStatus": "string", "overallComments": "string", "comments": [{"area": "string", "issue": "string", "feedback": "string", "action": "string", "photoDescription": "string"}], "measurementComparison": [{"point": "string", "spec": "string", "actual": "string", "result": "string"}], "bulkNotes": ["string"], "defectPhotos": [{"area": "string", "description": "string", "severity": "string"}] }`,
  rules: `- Extract PP sample review comments (PP办评语) with approval status and date.
- Extract EVERY area-specific comment with issue, feedback, required action.
- Describe defect/detail photos visible on the page (hem, seam, neckline issues).
- Extract measurement comparison table if present (spec vs actual).
- Extract ALL 大货注意 (bulk production notes).`
};
