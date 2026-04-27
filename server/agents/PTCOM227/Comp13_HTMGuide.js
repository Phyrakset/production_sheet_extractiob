/**
 * PTCOM227-specific extraction agent for Comp13_HTMGuide
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "garmentType": "string", "instructions": [{"code": "string", "name": "string", "howToMeasure": "string", "startPoint": "string", "endPoint": "string", "diagramDescription": "string", "specialNotes": "string"}], "generalCriteria": ["string"] }`,
  rules: `- Extract EVERY measurement point from HTM/度尺图 diagrams.
- For each point describe: where to start measuring, where to end, how to position garment.
- Include general measurement criteria (e.g., "measure garment laid flat", "HPS definition").
- Extract diagram descriptions showing red markers and measurement lines.`
};
