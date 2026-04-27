/**
 * GPAR12172GD-2-specific extraction agent for Comp09_Labels
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "labels": [{"ticketType": "string", "description": "string", "content": "string", "placement": "string", "attachMethod": "string", "material": "string", "size": "string", "supplier": "string", "quantity": "string", "perUnit": "string", "comments": "string"}], "hangtags": [{"type": "string", "description": "string", "material": "string", "supplier": "string"}], "heatTransfers": [{"type": "string", "position": "string", "size": "string", "color": "string"}] }`,
  rules: `- Extract EVERY label entry: brand label, care label, size label, content label, country-of-origin, UPC.
- Include placement (center back neck, side seam, etc.) and attach method (sewn, HT).
- Extract hangtag and heat transfer details separately.
- Include per-unit quantities and label content text if readable.`
};
