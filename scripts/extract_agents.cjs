const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'server', 'index.js');
let code = fs.readFileSync(indexFile, 'utf8');

// The getSlotConfig function starts around line 363. Let's just find all the if blocks manually using regex.
const blocks = code.match(/if \(title\.includes\("(.*?)"\)\) \{\s+return \{\s+schema: `([\s\S]*?)`,\s+rules: `([\s\S]*?)`\s+\};\s+\}/g);

if (!blocks) {
  console.log("Could not find any blocks");
  process.exit(1);
}

const AGENTS_DIR = path.join(__dirname, '..', 'server', 'agents');
const GENERIC_DIR = path.join(AGENTS_DIR, 'generic');

if (!fs.existsSync(GENERIC_DIR)) fs.mkdirSync(GENERIC_DIR, { recursive: true });

const COMP_FILES = {
  'cover page': 'Comp01_CoverPage',
  'order details': 'Comp02_OrderDetails',
  'tech sketch': 'Comp03_TechSketch',
  'instruction': 'Comp04_Instruction',
  'mftg standards': 'Comp05_MfgStandards',
  'bom fabrics': 'Comp07_BOMFabrics',
  'multi-level placements': 'Comp08_BOMTrims',
  'poms measurement': 'Comp11_POMs',
  'measurement guide': 'Comp13_HTMGuide',
  'approval comment': 'Comp15_PPComments',
  'packaging': 'Comp18_Packaging',
  'size spec': 'Comp20_SizeSpec',
  'technical team note': 'Comp21_TechnicalTeamNote',
  'process sheet': 'Comp22_ProcessSheet',
  'special instruction': 'Comp23_SpecialInstruction',
  'measurement spec': 'Comp24_MeasurementSpec',
  'properties of order': 'Comp25_PropertiesOfOrder',
  'style template': 'Comp26_StyleTemplate',
  'embroidery specification': 'Comp27_EmbroiderySpec',
  'fabrics consumption': 'Comp28_FabricsConsumption',
  'measurement evaluation': 'Comp29_MeasurementEvaluation',
  'placement': 'Comp30_Placement',
  'measurement instruction': 'Comp31_MeasurementInstruction',
};

let match;
const regex = /if \(title\.includes\("(.*?)"\)\) \{\s+return \{\s+schema: `([\s\S]*?)`,\s+rules: `([\s\S]*?)`\s+\};\s+\}/g;

while ((match = regex.exec(code)) !== null) {
  const compName = match[1];
  const schema = match[2];
  const rules = match[3];
  
  const fileName = COMP_FILES[compName];
  if (!fileName) continue;
  
  const content = `export default {
  schema: \`${schema}\`,
  rules: \`${rules}\`
};
`;
  fs.writeFileSync(path.join(GENERIC_DIR, `${fileName}.js`), content);
  console.log('Created', fileName);
}
