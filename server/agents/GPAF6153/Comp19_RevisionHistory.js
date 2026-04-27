/**
 * GPAF6153-specific extraction agent for Comp19_RevisionHistory
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "revisions": [{"date": "string", "version": "string", "section": "string", "description": "string", "changedBy": "string", "approvedBy": "string"}], "carryoverNote": "string", "totalRevisions": "number" }`,
  rules: `- Extract EVERY revision entry with date, version, section changed, description.
- Include who made and who approved each change.
- Note any carryover/reorder style notes.
- Count total number of revisions.`
};
