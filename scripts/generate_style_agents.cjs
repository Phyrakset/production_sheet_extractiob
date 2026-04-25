const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', 'server', 'agents');

const COMP_FILES = {
  '01': 'Comp01_CoverPage',
  '02': 'Comp02_OrderDetails',
  '03': 'Comp03_TechSketch',
  '04': 'Comp04_Construction',
  '05': 'Comp05_MfgStandards',
  '06': 'Comp06_Colorways',
  '07': 'Comp07_BOMFabrics',
  '08': 'Comp08_BOMTrims',
  '09': 'Comp09_Labels',
  '10': 'Comp10_Artwork',
  '11': 'Comp11_POMs',
  '12': 'Comp12_Grading',
  '13': 'Comp13_HTMGuide',
  '14': 'Comp14_MeasureQA',
  '15': 'Comp15_PPComments',
  '16': 'Comp16_FitPhotos',
  '17': 'Comp17_QAStandards',
  '18': 'Comp18_Packaging',
  '19': 'Comp19_RevisionHistory',
};

const STYLES = {
  'GPAF6153': ['01','02','03','04','05','06','07','08','09','10','11','13','14','15','16','17','18','19'],
  'GPAR12172GD-2': ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','16','17','18','19'],
  'GPRT00077C': ['01','02','03','04','05','06','10','11','12','13','15','16','18'],
  'PTBC0047': ['01','02','06','07','08','10','11','13','18'],
  'PTCOC270_270A': ['01','02','03','04','11','18'],
  'PTCOM227': ['01','02','04','07','11','13','18'],
};

for (const [style, comps] of Object.entries(STYLES)) {
  const styleDir = path.join(AGENTS_DIR, style);
  if (!fs.existsSync(styleDir)) fs.mkdirSync(styleDir, { recursive: true });

  for (const comp of comps) {
    const fileName = COMP_FILES[comp];
    if (!fileName) continue;
    
    const filePath = path.join(styleDir, `${fileName}.js`);
    
    if (fs.existsSync(filePath)) {
      continue;
    }

    const content = `/**
 * ${style}-specific extraction agent for ${fileName.replace(/Comp\d+_/, '')}
 * Re-exports generic rules initially.
 * Override 'schema' or 'rules' to customize LLM extraction for this style.
 */
import genericConfig from '../generic/${fileName}.js';

export default {
  ...genericConfig,
  // Add style-specific schema modifications or rules here if needed:
  // rules: genericConfig.rules + "\\n- Style specific rule...",
};
`;

    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log("Done generating style agents.");
