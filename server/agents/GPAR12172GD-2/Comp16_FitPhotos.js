/**
 * GPAR12172GD-2-specific extraction agent for Comp16_FitPhotos
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "photos": [{"view": "front|back|side|detail|flat|unknown", "garmentArea": "string", "description": "string", "comments": "string", "correctIncorrect": "string"}], "garmentOnForm": "boolean", "modelSize": "string", "sampleSize": "string", "overallFitComment": "string" }`,
  rules: `- Describe EVERY photo visible on the page: view angle, garment area shown, what's depicted.
- Note if photos show correct vs incorrect construction examples.
- Include mannequin/model size and sample size if stated.
- Extract all fit comments and annotations next to photos.`
};
