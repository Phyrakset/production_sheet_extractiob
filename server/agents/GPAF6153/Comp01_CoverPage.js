/**
 * GPAF6153-specific extraction agent for CoverPage
 * Re-exports generic rules initially.
 * Override 'schema' or 'rules' to customize LLM extraction for this style.
 */
import genericConfig from '../generic/Comp01_CoverPage.js';

export default {
  ...genericConfig,
  rules: genericConfig.rules + `
- **GPAF6153 SPECIFIC EXTRACTION OVERRIDES**:
- Pay EXTREME attention to text color and background color in the notes table!
- ANY note that has RED text MUST have \`isRedText: true\` in \`rawNotes\`. (For example, look closely at notes 1, 3, 4, 6, 7, 8, 9, 12).
- ANY note that has a YELLOW background (e.g., note 13) MUST have \`hasYellowHighlight: true\` in \`rawNotes\`.
- CRITICAL: You MUST place EVERY note that has red text OR a yellow background into the \`criticalWarnings\` array. Do NOT miss any!`
};
