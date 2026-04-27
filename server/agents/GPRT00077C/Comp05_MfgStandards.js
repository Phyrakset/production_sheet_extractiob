/**
 * GPRT00077C-specific extraction agent for Comp05_MfgStandards
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "cutting": [{"item": "string", "standard": "string"}], "fusing": [{"item": "string", "standard": "string"}], "needle": [{"area": "string", "needleType": "string", "size": "string"}], "stitching": [{"seam": "string", "stitchType": "string", "spi": "string", "width": "string"}], "pressing": [{"item": "string", "standard": "string"}], "finishing": [{"item": "string", "standard": "string"}], "labeling": [{"item": "string", "requirement": "string"}], "minimumStandards": ["string"], "constructionDiagrams": [{"area": "string", "description": "string"}] }`,
  rules: `- Extract ALL MFTG Standards rows as structured items with standard descriptions.
- Include construction diagrams descriptions (hood, pocket, hem, etc.).
- Extract CUT/SEW KNIT TOPS MINIMUM STANDARDS table items.
- Extract labeling requirements, pressing specs, finishing standards.`
};
