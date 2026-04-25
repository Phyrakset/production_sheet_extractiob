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
