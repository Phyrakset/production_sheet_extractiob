const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'server', 'index.js');
let code = fs.readFileSync(indexFile, 'utf8');

// 1. Add import
if (!code.includes('import { getSlotConfig } from "./agents/AgentOrchestrator.js";')) {
  code = code.replace(
    '} from "./classifyAgent.js";',
    `} from "./classifyAgent.js";\nimport { getSlotConfig } from "./agents/AgentOrchestrator.js";`
  );
}

// 2. Modify extractDocumentFromGemini
code = code.replace(
  'const instruction = buildSlotInstruction(slotTitle, sourceContext);',
  `// Try to extract styleId from filename (e.g. Doc_GPAF6153_Pages)
  let styleId = null;
  const styleMatch = file.originalname.match(/Doc_([A-Z0-9\\-]+)_Pages/i);
  if (styleMatch) {
    styleId = styleMatch[1];
  }
  
  const instruction = await buildSlotInstruction(slotTitle, sourceContext, styleId);`
);

// 3. Modify buildSlotInstruction
code = code.replace(
  'function buildSlotInstruction(slotTitle, sourceContext = {}) {',
  'async function buildSlotInstruction(slotTitle, sourceContext = {}, styleId = null) {'
);
code = code.replace(
  'const config = getSlotConfig(slotTitle);',
  'const config = await getSlotConfig(slotTitle, styleId);'
);

// 4. Remove getSlotConfig
const startStr = 'function getSlotConfig(slotTitle) {';
const endStr = '  };\n}';

const startIndex = code.indexOf(startStr);
if (startIndex !== -1) {
  const endIndex = code.indexOf(endStr, startIndex) + endStr.length;
  code = code.substring(0, startIndex) + code.substring(endIndex + 1); // +1 for newline
}

fs.writeFileSync(indexFile, code);
console.log("Updated server/index.js successfully.");
