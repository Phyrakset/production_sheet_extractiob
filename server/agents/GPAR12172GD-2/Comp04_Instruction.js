/**
 * GPAR12172GD-2-specific extraction agent for Comp04_Instruction
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "operations": [{"step": "number", "description": "string", "machineType": "string", "needleType": "string", "threadType": "string", "spiStitch": "string", "qualityNote": "string"}], "seams": [{"location": "string", "type": "string", "spi": "string", "width": "string"}], "washInstructions": [{"step": "string", "details": "string"}], "labelPlacement": [{"labelType": "string", "position": "string", "method": "string"}], "instructions": ["string"], "attentionPoints": ["string"] }`,
  rules: `- Extract full sewing operation table (工序表/工艺单): step#, description, machine, needle, thread, SPI.
- Extract ALL workmanship instructions and 大货注意 attention points.
- Extract wash/finishing process steps if on this page.
- Extract label placement instructions (which label goes where, attach method).`
};
