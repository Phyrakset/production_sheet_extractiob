/**
 * PTBC0047-specific extraction agent for Comp11_POMs
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "measurementSet": "string", "uom": "cm|inch", "sampleSize": "string", "tolerancePlus": "string", "toleranceMinus": "string", "points": [{"code": "string", "name": "string", "tolerance": "string", "3xs": "string", "2xs": "string", "xxs": "string", "xs": "string", "s": "string", "m": "string", "l": "string", "xl": "string", "xxl": "string", "2xl": "string", "xxxl": "string", "3xl": "string"}] }`,
  rules: `- Extract EVERY row from the POM/size spec table (成品尺寸/成品规格表).
- Include ALL size columns that exist in the document (3XS through 3XL).
- Use null for sizes that don't exist in this document.
- Extract tolerance values (+ and -) per measurement point.
- Include measurement point codes (e.g., 1000, 1110, 1300) if visible.`
};
