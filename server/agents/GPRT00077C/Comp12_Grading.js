/**
 * GPRT00077C-specific extraction agent for Comp12_Grading
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "approvalStatus": "string", "approvalDate": "string", "baseSize": "string", "sizeRange": ["string"], "rules": [{"code": "string", "dimension": "string", "baseValue": "string", "increments": [{"fromSize": "string", "toSize": "string", "increment": "string"}], "unit": "string"}] }`,
  rules: `- Extract grading approval status and date (e.g., "GRADING APPROVED").
- Extract base size and full size range.
- For each dimension extract the base value and increments between each size jump.
- Include measurement codes if visible.`
};
