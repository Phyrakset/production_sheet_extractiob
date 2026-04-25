export default {
  schema: `{ "revisions": [{"date": "string", "version": "string", "section": "string", "description": "string", "changedBy": "string", "approvedBy": "string"}], "carryoverNote": "string", "totalRevisions": "number" }`,
  rules: `- Extract EVERY revision entry with date, version, section changed, description.
- Include who made and who approved each change.
- Note any carryover/reorder style notes.
- Count total number of revisions.`
};
