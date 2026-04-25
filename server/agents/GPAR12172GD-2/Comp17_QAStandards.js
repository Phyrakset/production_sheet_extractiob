/**
 * GPAR12172GD-2-specific extraction agent for QAStandards
 * Re-exports generic rules initially.
 * Override 'schema' or 'rules' to customize LLM extraction for this style.
 */
import genericConfig from '../generic/Comp17_QAStandards.js';

export default {
  ...genericConfig,
  // Add style-specific schema modifications or rules here if needed:
  // rules: genericConfig.rules + "\n- Style specific rule...",
};
