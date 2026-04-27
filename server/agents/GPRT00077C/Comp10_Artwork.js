/**
 * GPRT00077C-specific extraction agent for Comp10_Artwork
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "artworks": [{"artworkCode": "string", "type": "print|embroidery|heat_transfer|other", "placement": "string", "position": {"fromTop": "string", "fromCenter": "string", "fromEdge": "string"}, "dimensions": {"width": "string", "height": "string"}, "colors": [{"name": "string", "code": "string", "thread": "string"}], "stitchCount": "string", "stitchType": "string"}], "renderDescriptions": ["string"], "approvalStatus": "string", "notes": ["string"] }`,
  rules: `- Extract ALL artwork entries with code, type, exact placement measurements.
- For embroidery: include stitch count, stitch type, thread colors with codes.
- For prints: include ink colors, print method, dimensions.
- Describe 3D renders or placement diagrams visible on the page.`
};
