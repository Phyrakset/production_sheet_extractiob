import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3001';
const FILE = 'D:/TexLink/Production_sheet/test_data_and_knowledge_base/separated_components/GPAF6153/Comp_01_注意大點_Key_Notes_Doc_GPAF6153_Pages_1.pdf';

async function run() {
  // Step 1: Extract
  console.log('=== Extracting ===');
  const fileBuffer = fs.readFileSync(FILE);
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('files', blob, path.basename(FILE));
  formData.append('slotIds', 'page-01');
  formData.append('slotTitles', 'Key Notes');

  const extractRes = await fetch(`${BASE}/api/extract`, { method: 'POST', body: formData });
  const extractData = await extractRes.json();
  const pageResult = extractData.pages?.[0];
  console.log('Extraction OK. SlotTitle:', pageResult?.slotTitle);
  console.log('Brand:', pageResult?.extraction?.brand);
  console.log('StyleId:', pageResult?.extraction?.styleId);
  console.log('Data keys:', Object.keys(pageResult?.extraction?.data || {}));
  console.log('Notes count:', pageResult?.extraction?.data?.notes?.length);
  
  // Step 2: Translate to Khmer
  console.log('\n=== Translating to Khmer ===');
  const displayJson = {
    slotTitle: pageResult.slotTitle,
    fileName: pageResult.fileName,
    pageType: pageResult.extraction?.pageType ?? null,
    brand: pageResult.extraction?.brand ?? null,
    styleId: pageResult.extraction?.styleId ?? null,
    summary: pageResult.extraction?.summary ?? null,
    data: pageResult.extraction?.data ?? {},
    otherInformation: pageResult.extraction?.otherInformation ?? [],
    warnings: pageResult.extraction?.warnings ?? [],
  };

  const translateRes = await fetch(`${BASE}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonData: displayJson, targetLang: 'km', slotTitle: 'Key Notes' }),
  });
  const translateData = await translateRes.json();
  console.log('Translation OK');
  console.log('Glossary:', translateData.glossaryMatches, '| AI:', translateData.aiTranslations);
  
  // Step 3: Simulate what compileTranslated does
  console.log('\n=== Simulating compile ===');
  const { _stats, ...translatedData } = translateData.data;
  
  // This is what MasterDocument receives as slotResults
  const compiledSlotResults = {
    'page-01': {
      ...pageResult,
      slotTitle: pageResult.slotTitle,
      extraction: {
        ...pageResult.extraction,
        ...translatedData,
      },
    },
  };
  
  const result = compiledSlotResults['page-01'];
  console.log('SlotTitle:', result.slotTitle);
  console.log('Extraction brand:', result.extraction.brand);
  console.log('Extraction styleId:', result.extraction.styleId);
  console.log('Extraction data.notes[0]:', result.extraction.data?.notes?.[0]);
  console.log('Extraction data.factoryNumber:', result.extraction.data?.factoryNumber);
  console.log('Extraction data.totalQuantity:', result.extraction.data?.totalQuantity);
  
  console.log('\n✅ The MasterDocument KeyNotesSection should receive:');
  console.log('  - brand:', result.extraction.brand);
  console.log('  - notes count:', result.extraction.data?.notes?.length);
  console.log('  - factoryNumber:', result.extraction.data?.factoryNumber);
  console.log('  - totalQuantity:', result.extraction.data?.totalQuantity);
  console.log('  - First note:', result.extraction.data?.notes?.[0]?.slice(0, 80));
}

run().catch(err => console.error('Fatal:', err.message));
