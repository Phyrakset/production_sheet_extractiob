export const COMPONENT_FILES = {
  'cover page': 'Comp01_CoverPage',
  'order details': 'Comp02_OrderDetails',
  'tech sketch': 'Comp03_TechSketch',
  'construction': 'Comp04_Construction',
  'mfg standards': 'Comp05_MfgStandards',
  'colorways': 'Comp06_Colorways',
  'bom fabrics': 'Comp07_BOMFabrics',
  'bom trims': 'Comp08_BOMTrims',
  'labels': 'Comp09_Labels',
  'artwork': 'Comp10_Artwork',
  'poms': 'Comp11_POMs',
  'grading': 'Comp12_Grading',
  'htm guide': 'Comp13_HTMGuide',
  'measure qa': 'Comp14_MeasureQA',
  'pp comments': 'Comp15_PPComments',
  'fit photos': 'Comp16_FitPhotos',
  'qa standards': 'Comp17_QAStandards',
  'packaging': 'Comp18_Packaging',
  'revision history': 'Comp19_RevisionHistory',
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
    // 1. Try to load style-specific config
    if (styleId) {
      try {
        const mod = await import(`./${styleId}/${agentFileName}.js`);
        if (mod && mod.default) return mod.default;
      } catch (e) {
        // Fallback if not found
      }
    }
    
    // 2. Try to load generic config
    try {
      const mod = await import(`./generic/${agentFileName}.js`);
      if (mod && mod.default) return mod.default;
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
