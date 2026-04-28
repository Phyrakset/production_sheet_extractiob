export default {
  schema: `{ "styleNumber": "string", "season": "string", "title": "string", "category": "string", "instructions": [{"id": "string", "instruction": "string", "area": "string", "priority": "critical|important|standard", "illustration": "string", "details": "string"}], "warnings": [{"warning": "string", "severity": "high|medium|low"}], "specialRequirements": ["string"], "approvedBy": "string", "date": "string", "notes": ["string"] }`,
  rules: `- Extract all special instructions, paying close attention to highlighted or bold text indicating critical items.
- Categorize instructions by area (e.g., collar, cuff, hem, pocket, zipper, embroidery, print, wash).
- Identify priority levels: critical (red/highlighted), important (bold), or standard.
- Capture any illustration references or diagram callouts associated with instructions.
- Extract warnings separately with severity levels.
- Record special requirements that differ from standard production procedures.
- Capture approval signatures and dates if present.
- Extract any footnotes or additional notes.`
};
