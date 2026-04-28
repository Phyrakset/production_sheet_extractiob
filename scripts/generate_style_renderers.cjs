/**
 * Script to generate all style-specific renderer files.
 * Each file re-exports from the generic renderer as a starting point.
 * These will be individually refined through press-matching later.
 */
const fs = require('fs');
const path = require('path');

const RENDERERS_DIR = path.join(__dirname, '..', 'src', 'renderers');

// Component mapping: comp number → generic renderer filename
const COMP_FILES = {
  '01': 'Comp01_CoverPage',
  '02': 'Comp02_OrderDetails',
  '03': 'Comp03_TechSketch',
  '04': 'Comp04_Instruction',
  '05': 'Comp05_MfgStandards',
  '07': 'Comp07_BOMFabrics',
  '08': 'Comp08_BOMTrims',
  '11': 'Comp11_POMs',
  '13': 'Comp13_HTMGuide',
  '15': 'Comp15_PPComments',
  '18': 'Comp18_Packaging',
  '20': 'Comp20_SizeSpec',
  '21': 'Comp21_TechnicalTeamNote',
  '22': 'Comp22_ProcessSheet',
  '23': 'Comp23_SpecialInstruction',
  '24': 'Comp24_MeasurementSpec',
  '25': 'Comp25_PropertiesOfOrder',
  '26': 'Comp26_StyleTemplate',
  '27': 'Comp27_EmbroiderySpec',
  '28': 'Comp28_FabricsConsumption',
  '29': 'Comp29_MeasurementEvaluation',
  '30': 'Comp30_Placement',
  '31': 'Comp31_MeasurementInstruction',
};

// Style numbers and their available components (from Separated_Components_Structure.md)
const STYLES = {
  'GPAF6153': ['01','02','03','04','05','06','07','08','09','10','11','13','14','15','16','17','18','19'],
  'GPAR12172GD-2': ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','16','17','18','19'],
  'GPRT00077C': ['01','02','03','04','05','06','10','11','12','13','15','16','18'],
  'PTBC0047': ['01','02','06','07','08','10','11','13','18'],
  'PTCOC270_270A': ['01','02','03','04','11','18'],
  'PTCOM227': ['01','02','04','07','11','13','18'],
};

let created = 0;
let skipped = 0;

for (const [style, comps] of Object.entries(STYLES)) {
  const styleDir = path.join(RENDERERS_DIR, style);
  if (!fs.existsSync(styleDir)) fs.mkdirSync(styleDir, { recursive: true });

  for (const comp of comps) {
    const fileName = COMP_FILES[comp];
    if (!fileName) continue;
    
    const filePath = path.join(styleDir, `${fileName}.jsx`);
    
    // Skip if file already exists (e.g., GPAF6153/Comp01 which we already created)
    if (fs.existsSync(filePath)) {
      skipped++;
      console.log(`SKIP (exists): ${style}/${fileName}.jsx`);
      continue;
    }

    const content = `/**
 * ${style}-specific renderer for ${fileName.replace(/Comp\d+_/, '')}
 * ──────────────────────────────────────────────────
 * Status: NOT YET TESTED — re-exports from generic renderer.
 * To customize: replace the re-export with style-specific rendering logic
 * after press-matching against the original PDF.
 * 
 * Source PDF: Comp_${comp}_*_Doc_${style}_Pages_*.pdf
 */
export { default } from '../${fileName}';
`;

    fs.writeFileSync(filePath, content, 'utf8');
    created++;
    console.log(`CREATE: ${style}/${fileName}.jsx`);
  }
}

console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
