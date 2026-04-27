/**
 * GPAR12172GD-2-specific extraction agent for Comp17_QAStandards
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "aql": "string", "inspectionLevel": "string", "criticalDefects": [{"defect": "string", "classification": "string", "acceptReject": "string"}], "majorDefects": [{"defect": "string", "classification": "string", "acceptReject": "string"}], "minorDefects": [{"defect": "string", "classification": "string", "acceptReject": "string"}], "testingRequirements": [{"test": "string", "standard": "string", "requirement": "string"}], "finishingChecklist": ["string"] }`,
  rules: `- Extract AQL level and inspection level.
- Separate defects into critical/major/minor with accept/reject criteria.
- Extract ALL testing requirements (wash test, shrinkage, colorfastness, etc.).
- Extract finishing checklist items if visible.`
};
