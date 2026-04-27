/**
 * GPAF6153-specific extraction agent for Comp06_Colorways
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "colorways": [{"name": "string", "code": "string", "pantone": "string", "placement": "string", "washType": "string", "fabricColor": "string"}], "colorMatchPhotos": [{"description": "string", "approvalNote": "string"}], "bomPerColorway": [{"colorway": "string", "materials": [{"item": "string", "color": "string", "code": "string"}]}] }`,
  rules: `- Extract ALL colorway entries with name, code, Pantone, wash type, fabric color.
- Extract color matching photo descriptions and approval notes (e.g., "All accept for bulk").
- If BOM items are listed per colorway (like in PTBC0047), extract them under bomPerColorway.`
};
