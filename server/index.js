import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { readdir } from "node:fs/promises";
import path from "node:path";
import multer from "multer";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 24,
  },
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VISION_MODEL = process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash";
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    hasGeminiKey: Boolean(GEMINI_API_KEY),
    model: GEMINI_VISION_MODEL,
  });
});

app.get("/api/samples", async (_req, res) => {
  try {
    const sampleDir = path.resolve(process.cwd(), "test_data");
    const entries = await readdir(sampleDir, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => ({
        name: entry.name,
        path: path.join(sampleDir, entry.name),
      }));

    res.json({
      sampleDir,
      files,
    });
  } catch (error) {
    res.status(500).json({
      error: "Could not read test_data folder",
      details: error.message,
    });
  }
});

app.post("/api/extract", upload.array("files", 24), async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY in .env",
      });
    }

    const files = req.files || [];
    const slotIds = toArray(req.body?.slotIds);
    const slotTitles = toArray(req.body?.slotTitles);
    if (!files.length) {
      return res.status(400).json({
        error: "No files uploaded",
      });
    }

    const pageResults = [];
    for (const [index, file] of files.entries()) {
      const slotId = slotIds[index] || null;
      const slotTitle = slotTitles[index] || null;
      const extraction = await extractDocumentFromGemini(file, slotTitle);
      pageResults.push({
        slotId,
        slotTitle,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        extraction,
      });
    }

    res.json({
      extractedAt: new Date().toISOString(),
      totalFiles: pageResults.length,
      pages: pageResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Extraction failed",
    });
  }
});

app.post("/api/merge", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in .env" });
    }

    const { slotResults } = req.body;
    if (!slotResults || Object.keys(slotResults).length === 0) {
      return res.status(400).json({ error: "No extracted data provided" });
    }

    // Convert map to formatted JSON string
    const inputDataStr = JSON.stringify(slotResults, null, 2);

    const instruction = `
You are a Master Production Planner. 
Your task is to merge and synthesize the provided 19 fragments of JSON into ONE Final Production Sheet Master Template.
Resolve any conflicting data intelligently (e.g. prioritize explicit DT Order values over sketching approximations).

You MUST output ONLY valid JSON using the exact schema below representing the 9 distinct Rows of a professional Production Sheet:

{
  "row1_basicInfo": {
    "styleNumber": "string|null",
    "jobNumber": "string|null",
    "poNumber": "string|null",
    "orderQuantity": "number|null",
    "colorBreakdown": [{"color": "string", "quantity": "number"}],
    "sizeRatio": "string|null"
  },
  "row2_productionInstructions": {
    "ppComments": ["string"],
    "washingRequests": ["string"],
    "printingWarnings": ["string"],
    "tolerances": ["string"],
    "overCutPercentage": "string|null"
  },
  "row4_sizeSpec": {
    "measurements": [{"point": "string", "target": "string", "tolerance": "string"}]
  },
  "row5_packing": {
    "foldingMethod": "string|null",
    "cartonSizeLimits": "string|null",
    "barcodeDetails": "string|null"
  },
  "row6_graphicPlacement": {
    "logoType": "string|null",
    "positionVertical": "string|null",
    "positionHorizontal": "string|null",
    "scalingRule": [{"size": "string", "scale": "string"}]
  },
  "row7_operationSequence": {
    "sewingOperations": ["string"]
  },
  "row8_constructions": {
    "stitchTypes": ["string"],
    "seamFinishes": ["string"],
    "bindingMethods": ["string"],
    "specialNotes": ["string"]
  },
  "row9_threadConsumption": {
    "totalPerGarment": "string|null",
    "detailsBySeam": [{"seam": "string", "length": "string"}]
  }
}

Here are the extracted documents:
-------
${inputDataStr}
-------
Return ONLY valid JSON without markdown fences.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_TEXT_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
          contents: [{ role: "user", parts: [{ text: instruction }] }],
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(text);
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const result = await response.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "{}";
    
    let mergedJson;
    try {
      mergedJson = JSON.parse(rawText);
    } catch {
      mergedJson = { error: "Failed to parse AI output", raw: rawText };
    }

    res.json(mergedJson);
  } catch (error) {
    console.error("Merge error:", error);
    res.status(500).json({ error: error.message || "Merge failed" });
  }
});

async function extractDocumentFromGemini(file, slotTitle = "Page") {
  const instruction = buildSlotInstruction(slotTitle);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      GEMINI_VISION_MODEL
    )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [
              { text: instruction },
              {
                inlineData: {
                  mimeType: file.mimetype || guessMimeType(file.originalname),
                  data: file.buffer.toString("base64"),
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${text}`);
  }

  const result = await response.json();
  const rawText =
    result?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "{}";

  try {
    return JSON.parse(rawText);
  } catch {
    return {
      pageType: slotTitle,
      brand: null,
      pageRef: null,
      styleId: null,
      summary: "Model returned non-JSON output",
      data: {
        rawText,
      },
      warnings: ["Gemini response could not be parsed as JSON"],
    };
  }
}

function buildSlotInstruction(slotTitle) {
  const config = getSlotConfig(slotTitle);

  return `
You are extracting data from one specific production sheet page.

Current page type: "${slotTitle}".

CRITICAL RULES:
- Extract EVERY piece of visible data on this page. Missing data = failure.
- For tables: extract EVERY row and EVERY column cell. Never return an empty object {} for a table row.
- For size columns (XXS, XS, S, M, L, XL, XXL, etc.): extract the number in each cell. If the cell has text instead of a number, extract the text. If a cell is blank, use null.
- Keep visible page header data: brand/logo text, page label, spec ref, page number, style ID.
- Do not return broad master-profile data from other page types.
- If a value is not visible, use null for scalars and [] for arrays.
- Preserve visible wording exactly as shown (keep Chinese text as-is).
- Return only valid JSON. Do not wrap in markdown fences.

Return this exact structure:
{
  "pageType": "${slotTitle}",
  "brand": "string or null",
  "pageRef": "string or null",
  "styleId": "string or null",
  "summary": "short summary",
  "data": ${config.schema},
  "otherInformation": ["array of ANY text, notes, callouts, stamps, or data found on the page that does not logically fit into the specific 'data' fields provided. DO NOT ignore any text!"],
  "warnings": ["array of issues or unreadable areas"]
}

Page-specific rules:
${config.rules}
`;
}

function getSlotConfig(slotTitle) {
  const title = String(slotTitle || "").toLowerCase();

  // --- Phase A: Order & Identity ---
  if (title.includes("key notes")) {
    return {
      schema: `{
  "brand": "string",
  "customerName": "string",
  "styleNumber": "string",
  "factoryNumber": "string",
  "season": "string",
  "garmentType": "string",
  "poNumber": "string",
  "totalQuantity": "number",
  "deliveryDate": "string",
  "fabricType": "string",
  "sketchDescription": "string",
  "notes": ["string"],
  "criticalWarnings": ["string"],
  "colorSizeMatrix": [{
    "color": "string",
    "colorCode": "string",
    "orderQuantity": "number",
    "sizes": {
      "XXS": "number or null",
      "XS": "number or null",
      "S": "number or null",
      "M": "number or null",
      "L": "number or null",
      "XL": "number or null",
      "XXL": "number or null",
      "XXXL": "number or null"
    },
    "sizeNotes": "string"
  }],
  "sampleRequirements": [{
    "style": "string",
    "color": "string",
    "quantity": "number",
    "purpose": "string"
  }],
  "approvalStamp": {
    "status": "string",
    "approvedBy": "string",
    "approvalDate": "string"
  }
}`,
      rules: `- This is the cover/summary page (注意大點). Extract ALL header fields: brand, customer, style#, factory# (廠號), PO#, total qty (數量), delivery date, garment type, fabric type.
- Extract ALL numbered production notes/warnings exactly as written (Chinese+English).
- CRITICAL: Extract the color-size quantity breakdown table (款號/STYLE 中查明细表). For EACH row extract the color name, color code, order quantity (订单数), and the quantity value for EVERY size column (XXS, XS, S, M, L, XL, XXL). If a size cell contains text notes instead of a number, put the text in "sizeNotes". Do NOT return empty sizes — extract every cell value.
- Extract the sample requirement table (大货需加裁抽办数量) with style, color, quantity, and purpose (用途).
- Extract the approval stamp (允許開裁): status, approved by, date.
- Describe the sketch visible on this page (front/back views).`
    };
  }
  if (title.includes("order details")) {
    return {
      schema: `{ "customerName": "string", "factoryName": "string", "poNumber": "string", "styleNumber": "string", "deliveryDates": ["string"], "totalQuantity": "number", "shipmentLots": [{"lot": "string", "color": "string", "quantity": "number", "date": "string", "destination": "string"}], "colorSizeBreakdown": [{"color": "string", "colorCode": "string", "sizeQuantities": {}}], "processes": [{"name": "string", "details": "string"}], "fabricInfo": "string", "washType": "string" }`,
      rules: `- Extract ALL header fields: customer, factory, PO#, style#.
- Extract every shipment lot row with lot number, color, qty, date, destination.
- Extract full color×size quantity table preserving all columns.
- Extract process summary (Print, Wash, Heat Transfer, etc.) with details.`
    };
  }

  // --- Phase B: Design & Construction ---
  if (title.includes("tech sketch")) {
    return {
      schema: `{ "pageLabel": "string", "garment": "string", "views": [{"view": "front|back|side|detail", "description": "string"}], "callouts": [{"text": "string", "view": "front|back|both|unknown", "kind": "construction|measurement|note", "location": "string"}], "measurementPoints": [{"code": "string", "name": "string", "position": "string"}], "constructionNotes": ["string"] }`,
      rules: `- Extract ALL text annotations, callouts, and labels on the technical drawing.
- For each callout note which view (front/back) and where on garment it points.
- Extract measurement point codes and names if shown on the sketch.
- Extract any construction notes written near the drawings.`
    };
  }
  if (title.includes("construction")) {
    return {
      schema: `{ "operations": [{"step": "number", "description": "string", "machineType": "string", "needleType": "string", "threadType": "string", "spiStitch": "string", "qualityNote": "string"}], "seams": [{"location": "string", "type": "string", "spi": "string", "width": "string"}], "washInstructions": [{"step": "string", "details": "string"}], "labelPlacement": [{"labelType": "string", "position": "string", "method": "string"}], "instructions": ["string"], "attentionPoints": ["string"] }`,
      rules: `- Extract full sewing operation table (工序表/工艺单): step#, description, machine, needle, thread, SPI.
- Extract ALL workmanship instructions and 大货注意 attention points.
- Extract wash/finishing process steps if on this page.
- Extract label placement instructions (which label goes where, attach method).`
    };
  }
  if (title.includes("mfg standards")) {
    return {
      schema: `{ "cutting": [{"item": "string", "standard": "string"}], "fusing": [{"item": "string", "standard": "string"}], "needle": [{"area": "string", "needleType": "string", "size": "string"}], "stitching": [{"seam": "string", "stitchType": "string", "spi": "string", "width": "string"}], "pressing": [{"item": "string", "standard": "string"}], "finishing": [{"item": "string", "standard": "string"}], "labeling": [{"item": "string", "requirement": "string"}], "minimumStandards": ["string"], "constructionDiagrams": [{"area": "string", "description": "string"}] }`,
      rules: `- Extract ALL MFTG Standards rows as structured items with standard descriptions.
- Include construction diagrams descriptions (hood, pocket, hem, etc.).
- Extract CUT/SEW KNIT TOPS MINIMUM STANDARDS table items.
- Extract labeling requirements, pressing specs, finishing standards.`
    };
  }
  if (title.includes("colorways")) {
    return {
      schema: `{ "colorways": [{"name": "string", "code": "string", "pantone": "string", "placement": "string", "washType": "string", "fabricColor": "string"}], "colorMatchPhotos": [{"description": "string", "approvalNote": "string"}], "bomPerColorway": [{"colorway": "string", "materials": [{"item": "string", "color": "string", "code": "string"}]}] }`,
      rules: `- Extract ALL colorway entries with name, code, Pantone, wash type, fabric color.
- Extract color matching photo descriptions and approval notes (e.g., "All accept for bulk").
- If BOM items are listed per colorway (like in PTBC0047), extract them under bomPerColorway.`
    };
  }

  // --- Phase C: Materials & BOM ---
  if (title.includes("bom fabrics")) {
    return {
      schema: `{ "materials": [{"category": "string", "part": "string", "material": "string", "composition": "string", "weight": "string", "width": "string", "color": "string", "colorCode": "string", "supplier": "string", "supplierCode": "string", "quantity": "string", "unitPrice": "string", "comments": "string"}] }`,
      rules: `- Extract EVERY row from fabric BOM tables: category (shell/lining/rib/interlining), part, material name, composition, weight, width, color, supplier, qty.
- Include supplier codes and unit prices if visible.
- Extract from BOM/Multi-level Placements/Style BOM Template/用料清單 sections.`
    };
  }
  if (title.includes("bom trims")) {
    return {
      schema: `{ "trims": [{"category": "string", "part": "string", "description": "string", "size": "string", "color": "string", "colorCode": "string", "quantity": "string", "unit": "string", "supplier": "string", "supplierCode": "string", "comments": "string"}], "threads": [{"type": "string", "color": "string", "colorCode": "string", "ticketNumber": "string", "usage": "string"}], "packingMaterials": [{"item": "string", "size": "string", "quantity": "string", "supplier": "string"}] }`,
      rules: `- Extract EVERY row from trims BOM: zippers, buttons, elastic, drawcord, rivets, etc.
- Separate thread details (type, color, ticket#, usage area).
- Separate packing materials (polybag, tissue, hanger, etc.) if listed in same BOM.
- Include all supplier codes, sizes, and color codes.`
    };
  }
  if (title.includes("labels")) {
    return {
      schema: `{ "labels": [{"ticketType": "string", "description": "string", "content": "string", "placement": "string", "attachMethod": "string", "material": "string", "size": "string", "supplier": "string", "quantity": "string", "perUnit": "string", "comments": "string"}], "hangtags": [{"type": "string", "description": "string", "material": "string", "supplier": "string"}], "heatTransfers": [{"type": "string", "position": "string", "size": "string", "color": "string"}] }`,
      rules: `- Extract EVERY label entry: brand label, care label, size label, content label, country-of-origin, UPC.
- Include placement (center back neck, side seam, etc.) and attach method (sewn, HT).
- Extract hangtag and heat transfer details separately.
- Include per-unit quantities and label content text if readable.`
    };
  }
  if (title.includes("artwork")) {
    return {
      schema: `{ "artworks": [{"artworkCode": "string", "type": "print|embroidery|heat_transfer|other", "placement": "string", "position": {"fromTop": "string", "fromCenter": "string", "fromEdge": "string"}, "dimensions": {"width": "string", "height": "string"}, "colors": [{"name": "string", "code": "string", "thread": "string"}], "stitchCount": "string", "stitchType": "string"}], "renderDescriptions": ["string"], "approvalStatus": "string", "notes": ["string"] }`,
      rules: `- Extract ALL artwork entries with code, type, exact placement measurements.
- For embroidery: include stitch count, stitch type, thread colors with codes.
- For prints: include ink colors, print method, dimensions.
- Describe 3D renders or placement diagrams visible on the page.`
    };
  }

  // --- Phase D: Measurement & Fit ---
  if (title.includes("poms")) {
    return {
      schema: `{ "measurementSet": "string", "uom": "cm|inch", "sampleSize": "string", "tolerancePlus": "string", "toleranceMinus": "string", "points": [{"code": "string", "name": "string", "tolerance": "string", "3xs": "string", "2xs": "string", "xxs": "string", "xs": "string", "s": "string", "m": "string", "l": "string", "xl": "string", "xxl": "string", "2xl": "string", "xxxl": "string", "3xl": "string"}] }`,
      rules: `- Extract EVERY row from the POM/size spec table (成品尺寸/成品规格表).
- Include ALL size columns that exist in the document (3XS through 3XL).
- Use null for sizes that don't exist in this document.
- Extract tolerance values (+ and -) per measurement point.
- Include measurement point codes (e.g., 1000, 1110, 1300) if visible.`
    };
  }
  if (title.includes("grading")) {
    return {
      schema: `{ "approvalStatus": "string", "approvalDate": "string", "baseSize": "string", "sizeRange": ["string"], "rules": [{"code": "string", "dimension": "string", "baseValue": "string", "increments": [{"fromSize": "string", "toSize": "string", "increment": "string"}], "unit": "string"}] }`,
      rules: `- Extract grading approval status and date (e.g., "GRADING APPROVED").
- Extract base size and full size range.
- For each dimension extract the base value and increments between each size jump.
- Include measurement codes if visible.`
    };
  }
  if (title.includes("htm guide")) {
    return {
      schema: `{ "garmentType": "string", "instructions": [{"code": "string", "name": "string", "howToMeasure": "string", "startPoint": "string", "endPoint": "string", "diagramDescription": "string", "specialNotes": "string"}], "generalCriteria": ["string"] }`,
      rules: `- Extract EVERY measurement point from HTM/度尺图 diagrams.
- For each point describe: where to start measuring, where to end, how to position garment.
- Include general measurement criteria (e.g., "measure garment laid flat", "HPS definition").
- Extract diagram descriptions showing red markers and measurement lines.`
    };
  }
  if (title.includes("measure qa")) {
    return {
      schema: `{ "sampleSize": "string", "sampleType": "string", "measureDate": "string", "tables": [{"pom": "string", "code": "string", "target": "string", "actual": "string", "difference": "string", "tolerance": "string", "pass": "boolean"}], "overallResult": "string", "comments": ["string"] }`,
      rules: `- Extract ALL rows from QA measurement evaluation tables.
- Include target spec, actual measured value, difference, tolerance, and pass/fail per point.
- Note sample type (PP/TOP/SIZE SET) and size being measured.
- Extract overall result and any inspector comments.`
    };
  }

  // --- Phase E: Quality & Shipping ---
  if (title.includes("pp comments")) {
    return {
      schema: `{ "sampleType": "string", "submissionDate": "string", "approvalStatus": "string", "overallComments": "string", "comments": [{"area": "string", "issue": "string", "feedback": "string", "action": "string", "photoDescription": "string"}], "measurementComparison": [{"point": "string", "spec": "string", "actual": "string", "result": "string"}], "bulkNotes": ["string"], "defectPhotos": [{"area": "string", "description": "string", "severity": "string"}] }`,
      rules: `- Extract PP sample review comments (PP办评语) with approval status and date.
- Extract EVERY area-specific comment with issue, feedback, required action.
- Describe defect/detail photos visible on the page (hem, seam, neckline issues).
- Extract measurement comparison table if present (spec vs actual).
- Extract ALL 大货注意 (bulk production notes).`
    };
  }
  if (title.includes("fit photos")) {
    return {
      schema: `{ "photos": [{"view": "front|back|side|detail|flat|unknown", "garmentArea": "string", "description": "string", "comments": "string", "correctIncorrect": "string"}], "garmentOnForm": "boolean", "modelSize": "string", "sampleSize": "string", "overallFitComment": "string" }`,
      rules: `- Describe EVERY photo visible on the page: view angle, garment area shown, what's depicted.
- Note if photos show correct vs incorrect construction examples.
- Include mannequin/model size and sample size if stated.
- Extract all fit comments and annotations next to photos.`
    };
  }
  if (title.includes("qa standards")) {
    return {
      schema: `{ "aql": "string", "inspectionLevel": "string", "criticalDefects": [{"defect": "string", "classification": "string", "acceptReject": "string"}], "majorDefects": [{"defect": "string", "classification": "string", "acceptReject": "string"}], "minorDefects": [{"defect": "string", "classification": "string", "acceptReject": "string"}], "testingRequirements": [{"test": "string", "standard": "string", "requirement": "string"}], "finishingChecklist": ["string"] }`,
      rules: `- Extract AQL level and inspection level.
- Separate defects into critical/major/minor with accept/reject criteria.
- Extract ALL testing requirements (wash test, shrinkage, colorfastness, etc.).
- Extract finishing checklist items if visible.`
    };
  }
  if (title.includes("packaging")) {
    return {
      schema: `{ "foldingMethod": "string", "foldingDiagram": "string", "polybag": {"size": "string", "type": "string", "suffocationWarning": "boolean"}, "tissue": "string", "innerPack": {"method": "string", "quantity": "string"}, "carton": {"dimensions": "string", "weight": "string", "maxPieces": "number", "assortmentRatio": "string"}, "cartonMark": {"content": ["string"], "layout": "string"}, "barcodes": [{"type": "string", "position": "string", "content": "string"}], "packingInstructions": ["string"], "shipmentDetails": [{"lot": "string", "color": "string", "destination": "string", "quantity": "number", "cartons": "number"}] }`,
      rules: `- Extract ALL packing details: folding method, polybag size/type, tissue paper, inner pack.
- Extract carton specs: dimensions, weight limit, max pieces, assortment ratio.
- Extract carton mark content and layout description.
- Extract barcode placement and type (UPC, EAN, etc.).
- Extract shipment lot details with destination, quantities, number of cartons.
- Describe folding instruction diagrams if visible.`
    };
  }
  if (title.includes("revision history")) {
    return {
      schema: `{ "revisions": [{"date": "string", "version": "string", "section": "string", "description": "string", "changedBy": "string", "approvedBy": "string"}], "carryoverNote": "string", "totalRevisions": "number" }`,
      rules: `- Extract EVERY revision entry with date, version, section changed, description.
- Include who made and who approved each change.
- Note any carryover/reorder style notes.
- Count total number of revisions.`
    };
  }

  // Default fallback
  return {
    schema: `{ "content": {} }`,
    rules: "- Extract ALL visible data on this page as structured key-value pairs. Do not skip any text."
  };
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function guessMimeType(fileName = "") {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

app.listen(port, () => {
  console.log(`Extractor server running on http://localhost:${port}`);
});
