export const COMPONENT_FILES = {
  'cover page': 'Comp01_CoverPage',
  'order details': 'Comp02_OrderDetails',
  'properties of order': 'Comp25_PropertiesOfOrder',
  'style template': 'Comp26_StyleTemplate',
  'tech sketch': 'Comp03_TechSketch',
  'instruction': 'Comp04_Instruction',
  'mftg standards': 'Comp05_MfgStandards',
  'bom fabrics': 'Comp07_BOMFabrics',
  'multi-level placements': 'Comp08_BOMTrims',
  'measurement instruction': 'Comp31_MeasurementInstruction',
  'placement': 'Comp30_Placement',
  'measurement evaluation': 'Comp29_MeasurementEvaluation',
  'fabrics consumption': 'Comp28_FabricsConsumption',
  'embroidery specification': 'Comp27_EmbroiderySpec',
  'poms measurement': 'Comp11_POMs',
  'measurement guide': 'Comp13_HTMGuide',
  'approval comment': 'Comp15_PPComments',
  'packaging': 'Comp18_Packaging',
  'size spec': 'Comp20_SizeSpec',
  'technical team note': 'Comp21_TechnicalTeamNote',
  'process sheet': 'Comp22_ProcessSheet',
  'special instruction': 'Comp23_SpecialInstruction',
  'measurement spec': 'Comp24_MeasurementSpec',
};

export async function getSlotConfig(slotTitle, styleId) {
  const title = String(slotTitle || "").toLowerCase();
  
  // Find matching agent file
  let agentFileName = null;
  for (const [key, val] of Object.entries(COMPONENT_FILES)) {
    if (title.includes(key)) {
      agentFileName = val;
      break;
    }
  }

  if (agentFileName) {
    // Helper to extract config from either default or named exports
    const extractConfig = (mod) => {
      if (mod.default) return mod.default;
      let schema = null;
      let rules = mod.extractionPrompt || "";
      for (const [key, value] of Object.entries(mod)) {
        if (key.endsWith("_Schema") || key.includes("Schema")) {
          schema = value;
          break;
        }
      }
      if (schema) return { schema, rules };
      return null;
    };

    // 1. Try to load style-specific config
    if (styleId) {
      try {
        const mod = await import(`./${styleId}/${agentFileName}.js`);
        const config = extractConfig(mod);
        if (config) return config;
      } catch (e) {
        // Fallback if not found
      }
    }
    
    // 2. Try to load generic config
    try {
      const mod = await import(`./generic/${agentFileName}.js`);
      const config = extractConfig(mod);
      if (config) return config;
    } catch (e) {
      // Fallback below
    }
  }

  // 3. Ultimate Fallback
  return {
    schema: `{ "content": {} }`,
    rules: "- Extract ALL visible data on this page as structured key-value pairs. Do not skip any text."
  };
}
