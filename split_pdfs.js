import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const components = {
  1: { name: "注意大點 Key Notes", A: [1], B: [1], C: [1], D: [1], E: [1], F: [1] },
  2: { name: "订单明细 Order Details", A: [9], B: [2], C: [5], D: [2], E: [2, 3], F: [2] },
  3: { name: "款式图 Tech Sketch", A: [2], B: [18], C: [16], E: [11] },
  4: { name: "生产工艺 Construction", A: [8, 10], B: [5, 6], C: [6], E: [5, 6, 7], F: [4] },
  5: { name: "缝制标准 Mfg Standards", A: [11, 12], B: [8], C: [11, 12, 13, 14, 15, 16, 17, 18] },
  6: { name: "颜色 Colorways", A: [3], B: [9], C: [21, 22, 23], D: [5, 6, 7, 8, 9, 10] },
  7: { name: "面料物料 BOM Fabrics", B: [4, 19, 20], C: [18, 19], D: [5, 6, 7, 8], F: [3] },
  8: { name: "辅料 BOM Trims", B: [4, 22], C: [19, 20], D: [9] },
  9: { name: "唛头标签 Labels", B: [6, 18, 21], C: [13, 14, 20] },
  10: { name: "印花绣花 Artwork", A: [3], B: [9], C: [21, 24], D: [10] },
  11: { name: "成品尺寸 POMs", A: [16, 17], B: [3, 10, 11, 12, 13], C: [2, 3, 4, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], D: [3, 4], E: [4], F: [5] },
  12: { name: "放码规则 Grading", A: [7], C: [28, 29, 30, 31, 32, 33, 34, 35] },
  13: { name: "度尺图 HTM Guide", A: [18], B: [25, 26, 27, 28], C: [36, 37, 38, 39], D: [15], F: [7] },
  14: { name: "量度QA Measure QA", B: [10, 11, 12, 13], C: [28, 29, 30, 31, 32, 33, 34, 35] },
  15: { name: "PP办评语 PP Comments", A: [4, 5, 6], B: [12, 16, 17] },
  16: { name: "实物照片 Fit Photos", A: [19], B: [14, 15], C: [10] },
  17: { name: "质量标准 QA Standards", B: [8], C: [11, 12, 13, 14] },
  18: { name: "包装出货 Packaging", A: [13, 14], B: [7, 23, 24], C: [6, 7, 8, 9, 10], D: [11, 12, 13, 14], E: [8, 9, 10], F: [6] },
  19: { name: "修改记录 Revision History", B: [17], C: [41] }
};

const docs = {
  A: "(result) GPRT00077C 生产单 2025.11.27_A.pdf",
  B: "GPAF6153 -- 122260171 大货制单 - R1_B.pdf",
  C: "GPAR12172GD-2 大货制单 2025-10-25_C.pdf",
  D: "PTBC0047生產單_D.pdf",
  E: "PTCOC270   270A 两款大货制单_E.pdf",
  F: "PTCOM227大货制单_F.pdf"
};

const styleNames = {
  A: "GPRT00077C",
  B: "GPAF6153",
  C: "GPAR12172GD-2",
  D: "PTBC0047",
  E: "PTCOC270_270A",
  F: "PTCOM227"
};

const baseDir = path.join(__dirname, 'test_data_and_knowledge_base');
const outDir = path.join(baseDir, 'separated_components');

// Clean up old files and directories first
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]+/g, '_');
}

async function processPDFs() {
  for (const [docId, filename] of Object.entries(docs)) {
    const pdfPath = path.join(baseDir, filename);
    if (!fs.existsSync(pdfPath)) {
      console.error(`File not found: ${pdfPath}`);
      continue;
    }

    const styleName = styleNames[docId];
    console.log(`Processing ${docId} (${styleName}): ${filename}...`);
    
    // Create folder for the specific style
    const styleOutDir = path.join(outDir, styleName);
    if (!fs.existsSync(styleOutDir)) {
      fs.mkdirSync(styleOutDir, { recursive: true });
    }

    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
    const totalPages = pdfDoc.getPageCount();

    for (const [compId, compData] of Object.entries(components)) {
      const pagesToExtract = compData[docId];
      if (!pagesToExtract || pagesToExtract.length === 0) continue;

      const newPdf = await PDFDocument.create();
      
      // Filter out invalid page numbers (0-indexed internally, user provided 1-indexed)
      const validPages = pagesToExtract.filter(p => p > 0 && p <= totalPages);
      if (validPages.length === 0) continue;

      const pageIndices = validPages.map(p => p - 1);
      
      try {
        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const compNameClean = sanitizeFilename(compData.name).replace(/\s+/g, '_');
        const pagesStr = validPages.join('_');
        const compIdPad = String(compId).padStart(2, '0');
        
        const outFilename = `Comp_${compIdPad}_${compNameClean}_Doc_${styleName}_Pages_${pagesStr}.pdf`;
        const outFilePath = path.join(styleOutDir, outFilename);
        
        const pdfBytes = await newPdf.save();
        fs.writeFileSync(outFilePath, pdfBytes);
        console.log(`  Saved: ${styleName}/${outFilename}`);
      } catch (err) {
        console.error(`  Error creating ${compIdPad} for doc ${docId}:`, err.message);
      }
    }
  }
  console.log("Done!");
}

processPDFs().catch(console.error);
