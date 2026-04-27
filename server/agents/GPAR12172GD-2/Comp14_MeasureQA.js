/**
 * GPAR12172GD-2-specific extraction agent for Comp14_MeasureQA
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "sampleSize": "string", "sampleType": "string", "measureDate": "string", "tables": [{"pom": "string", "code": "string", "target": "string", "actual": "string", "difference": "string", "tolerance": "string", "pass": "boolean"}], "overallResult": "string", "comments": ["string"] }`,
  rules: `- Extract ALL rows from QA measurement evaluation tables.
- Include target spec, actual measured value, difference, tolerance, and pass/fail per point.
- Note sample type (PP/TOP/SIZE SET) and size being measured.
- Extract overall result and any inspector comments.`
};
