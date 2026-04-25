/**
 * PTBC0047-specific extraction agent for Packaging
 * Re-exports generic rules initially.
 * Override 'schema' or 'rules' to customize LLM extraction for this style.
 */
import genericConfig from '../generic/Comp18_Packaging.js';

export default {
  ...genericConfig,
  // Add style-specific schema modifications or rules here if needed:
  // rules: genericConfig.rules + "\n- Style specific rule...",
};
