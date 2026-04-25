import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { readdir } from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { MongoClient } from "mongodb";
import {
  classifyPage,
  splitPdfPages,
  mergePdfPages,
  COMPONENT_SIGNATURES,
} from "./classifyAgent.js";

dotenv.config();

// ── MongoDB Connection ──
const MONGODB_URI = process.env.MONGODB_URI;
let mongoDb = null;

if (MONGODB_URI) {
  const mongoClient = new MongoClient(MONGODB_URI);
  mongoClient.connect()
    .then(() => {
        // mongoDb = mongoClient.db();
      mongoDb = mongoClient.db();
      console.log("✅ Connected to MongoDB");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
    });
}

const app = express();
const port = process.env.PORT || 3001;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
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
  if (title.includes("cover page")) {
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

// ── Translation API ──
app.post("/api/translate", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in .env" });
    }

    const { jsonData, targetLang, slotTitle } = req.body;
    if (!jsonData || !targetLang) {
      return res.status(400).json({ error: "jsonData and targetLang are required" });
    }

    const langNames = { en: "English", zh: "Chinese (Simplified)", km: "Khmer (ខ្មែរ)" };
    const targetLangName = langNames[targetLang] || targetLang;

    // Step 1: Collect all translatable text values from the JSON (with their keys for context)
    const textEntries = [];
    function collectTexts(obj, path = "") {
      if (obj === null || obj === undefined) return;
      if (typeof obj === "string" && obj.trim().length > 0) {
        textEntries.push({ path, value: obj });
      } else if (Array.isArray(obj)) {
        obj.forEach((item, i) => collectTexts(item, `${path}[${i}]`));
      } else if (typeof obj === "object") {
        for (const [key, val] of Object.entries(obj)) {
          collectTexts(val, path ? `${path}.${key}` : key);
        }
      }
    }
    collectTexts(jsonData);

    // Step 2: Lookup glossary matches — ONLY VERIFIED terms
    let glossaryMap = {};
    if (mongoDb && textEntries.length > 0) {
      try {
        const col = mongoDb.collection("glossaryterms");
        const uniqueTexts = [...new Set(textEntries.map(e => e.value))];

        // Only fetch VERIFIED terms for reliable translations
        const verifiedFilter = { verificationStatus: "verified" };

        // Query glossary for exact matches (case-insensitive) — verified only
        const glossaryResults = await col.find({
          ...verifiedFilter,
          $or: [
            { source: { $in: uniqueTexts } },
            { source: { $in: uniqueTexts.map(t => t.toLowerCase()) } },
            { source: { $in: uniqueTexts.map(t => t.toUpperCase()) } }
          ]
        }).toArray();

        // Load all verified terms for partial matching within longer text
        const allVerifiedTerms = await col.find(verifiedFilter)
          .project({ source: 1, target: 1, sourceLang: 1, targetLang: 1, confidenceScore: 1 })
          .limit(10000)
          .toArray();

        // Build a lookup: source text → target text for the requested language
        const termLookup = {};
        for (const term of [...glossaryResults, ...allVerifiedTerms]) {
          const srcNorm = (term.source || "").trim().toLowerCase();
          if (!srcNorm) continue;

          const tgtLangNorm = (term.targetLang || "").replace("-hans", "").replace("-hant", "");
          const srcLangNorm = (term.sourceLang || "").replace("-hans", "").replace("-hant", "");

          if (tgtLangNorm === targetLang || (targetLang === "zh" && (term.targetLang === "zh-hans" || term.targetLang === "zh-hant"))) {
            if (!termLookup[srcNorm] || term.confidenceScore > (termLookup[srcNorm].score || 0)) {
              termLookup[srcNorm] = { text: term.target, score: term.confidenceScore || 0 };
            }
          }
          if (srcLangNorm === targetLang) {
            if (!termLookup[srcNorm]) {
              termLookup[srcNorm] = { text: term.source, score: term.confidenceScore || 0, isSelf: true };
            }
          }
        }

        // Match text entries against glossary
        for (const entry of uniqueTexts) {
          const lower = entry.toLowerCase().trim();
          // Exact match
          if (termLookup[lower]) {
            glossaryMap[entry] = termLookup[lower].text;
            continue;
          }
          // Partial match: glossary terms within longer text (longest-first)
          let translatedText = entry;
          let matched = false;
          const sortedTerms = Object.keys(termLookup).sort((a, b) => b.length - a.length);
          for (const term of sortedTerms) {
            if (term.length < 2) continue;
            const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            if (regex.test(translatedText)) {
              translatedText = translatedText.replace(regex, termLookup[term].text);
              matched = true;
            }
          }
          if (matched && translatedText !== entry) {
            glossaryMap[entry] = translatedText;
          }
        }

        console.log(`Glossary: ${Object.keys(glossaryMap).length} matches from ${Object.keys(termLookup).length} verified terms`);
      } catch (glossaryErr) {
        console.warn("Glossary lookup failed, continuing with AI-only:", glossaryErr.message);
      }
    }

    // Step 3: Identify remaining untranslated texts
    const untranslatedTexts = textEntries
      .map(e => e.value)
      .filter(v => !glossaryMap[v])
      .filter((v, i, arr) => arr.indexOf(v) === i);

    // Step 4: Send remaining to Gemini with FULL CONTEXT for accurate translation
    let aiTranslations = {};
    if (untranslatedTexts.length > 0) {
      // Build context-aware entries: include the JSON key path so AI understands what each text means
      const contextMap = {};
      for (const entry of textEntries) {
        if (!glossaryMap[entry.value] && !contextMap[entry.value]) {
          contextMap[entry.value] = entry.path;
        }
      }

      const batchSize = 60;
      for (let batchStart = 0; batchStart < untranslatedTexts.length; batchStart += batchSize) {
        const batch = untranslatedTexts.slice(batchStart, batchStart + batchSize);
        const numberedList = batch.map((t, i) => {
          const fieldPath = contextMap[t] || "";
          return `${i + 1}. [field: ${fieldPath}] ${JSON.stringify(t)}`;
        }).join("\n");

        const prompt = `You are an expert garment manufacturing and textile industry translator with deep knowledge of production sheet terminology.

DOCUMENT CONTEXT:
- This is a "${slotTitle || "Production Sheet"}" component from a garment factory production document.
- The full JSON structure being translated:
${JSON.stringify(jsonData, null, 1).slice(0, 3000)}

TARGET LANGUAGE: ${targetLangName}

YOUR TASK: Translate each numbered text below. Each entry shows [field: path.to.key] to help you understand the meaning in context.

TRANSLATION RULES:
1. DO NOT TRANSLATE — keep exactly as-is:
   • Brand names: ABERCROMBIE & FITCH, Nike, GAP, Uniqlo, etc.
   • Size codes: XXS, XS, S, M, L, XL, XXL, 2XL, 3XL
   • Units: cm, inch, mm, g/m², oz, kg
   • Industry abbreviations: AQL, SPI, BNT, HPS, HTM, UPC, EAN, PP, QC, QA, BOM, POM, HT, GSM, DTM
   • Codes, IDs, numbers: style numbers, PO numbers, factory codes, color codes (#FF0000, Pantone 19-4052), dates
   • Model/reference numbers, lot numbers, article numbers

2. USE INDUSTRY-STANDARD TERMS for garment/textile concepts:
   • Sewing: seam allowance, overlock, coverstitch, bartack, topstitch, binding, felling
   • Fabric: warp, weft, grain line, selvage, bias, hand feel, drape, pilling
   • Construction: facing, interlining, fusible, placket, gusset, yoke, dart
   • QC: defect, tolerance, AQL, inline inspection, final audit, shade variation
   • Packing: polybag, carton mark, assortment, folding method, suffocation warning

3. CONTEXTUAL REASONING:
   • Use the [field: ...] path to understand what each text means. For example:
     - [field: data.notes[0]] → a production instruction/note
     - [field: data.seams[0].type] → a seam type name
     - [field: data.operations[2].description] → a sewing operation description
     - [field: summary] → a brief document summary
   • If a Chinese term like "大货" appears, translate as "bulk production" (EN) / "ការផលិតទំនិញច្រើន" (KM), not literally "big goods"
   • "加裁" = "overcut/extra cutting", "抽办" = "sample pull", "面线" = "top thread / needle thread"
   • Consider the FULL sentence context, not just individual words

4. MIXED TEXT: If text has both translatable and untranslatable parts, translate only the meaningful parts.
   Example: "大货面线针数请保持10-12针每寸" → keep numbers, translate the instruction around them.

5. ALREADY IN TARGET: If text is already in ${targetLangName}, return unchanged.

Return a JSON array where each element is the translated string, in the same order as input.
Return ONLY the JSON array, no markdown fences.

Input texts:
${numberedList}`;

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_TEXT_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                generationConfig: { temperature: 0.15, responseMimeType: "application/json" },
                contents: [{ role: "user", parts: [{ text: prompt }] }],
              }),
            }
          );

          if (response.ok) {
            const result = await response.json();
            const rawText = result?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "[]";
            try {
              const translations = JSON.parse(rawText);
              if (Array.isArray(translations)) {
                batch.forEach((original, i) => {
                  if (translations[i]) {
                    aiTranslations[original] = translations[i];
                  }
                });
              }
            } catch {
              console.warn("Failed to parse AI translation batch");
            }
          } else {
            const errText = await response.text();
            console.warn(`AI translation batch failed: ${response.status}`, errText.slice(0, 200));
          }
        } catch (fetchErr) {
          console.warn("AI translation batch failed:", fetchErr.message);
        }
      }
    }

    // Step 5: Merge glossary + AI translations and rebuild the JSON
    const allTranslations = { ...aiTranslations, ...glossaryMap }; // glossary (verified) takes priority

    function applyTranslations(obj) {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj === "string") {
        return allTranslations[obj] || obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(item => applyTranslations(item));
      }
      if (typeof obj === "object") {
        const result = {};
        for (const [key, val] of Object.entries(obj)) {
          result[key] = applyTranslations(val);
        }
        return result;
      }
      return obj;
    }

    const translatedJson = applyTranslations(jsonData);

    res.json({
      translatedAt: new Date().toISOString(),
      targetLang,
      glossaryMatches: Object.keys(glossaryMap).length,
      aiTranslations: Object.keys(aiTranslations).length,
      totalTexts: textEntries.length,
      data: translatedJson,
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: error.message || "Translation failed" });
  }
});

// ── Glossary API ──
app.get("/api/glossary", async (req, res) => {
  try {
    if (!mongoDb) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }

    const col = mongoDb.collection("glossaryterms");
    const {
      q = "",
      langPair = "",
      status = "",
      page = "1",
      limit = "50",
    } = req.query;

    const filter = {};

    // Search query across source and target fields
    if (q.trim()) {
      filter.$or = [
        { source: { $regex: q.trim(), $options: "i" } },
        { target: { $regex: q.trim(), $options: "i" } },
      ];
    }

    // Language pair filter (e.g. "en::zh-hans")
    if (langPair && langPair.includes("::")) {
      const [src, tgt] = langPair.split("::");
      if (src) filter.sourceLang = src;
      if (tgt) filter.targetLang = tgt;
    }

    // Verification status filter
    if (status && status !== "all") {
      filter.verificationStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(10, parseInt(limit)));
    const skip = (pageNum - 1) * pageSize;

    const [terms, total] = await Promise.all([
      col.find(filter)
        .sort({ confidenceScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .project({
          source: 1,
          target: 1,
          sourceLang: 1,
          targetLang: 1,
          verificationStatus: 1,
          confidenceScore: 1,
          domain: 1,
          project: 1,
        })
        .toArray(),
      col.countDocuments(filter),
    ]);

    res.json({
      terms,
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("Glossary API error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Parallel Glossary (merged translations per term) ──
app.get("/api/glossary/parallel", async (req, res) => {
  try {
    if (!mongoDb) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }

    const col = mongoDb.collection("glossaryterms");
    const {
      q = "",
      status = "",
      page = "1",
      limit = "50",
    } = req.query;

    // Build a match stage
    const matchStage = {};
    if (q.trim()) {
      matchStage.$or = [
        { source: { $regex: q.trim(), $options: "i" } },
        { target: { $regex: q.trim(), $options: "i" } },
      ];
    }
    if (status && status !== "all") {
      matchStage.verificationStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(10, parseInt(limit)));

    // Normalize language: zh-hans/zh-hant → zh for grouping
    const pipeline = [
      { $match: matchStage },
      // Add a normalized source/target lang
      {
        $addFields: {
          normSrc: {
            $switch: {
              branches: [
                { case: { $eq: ["$sourceLang", "zh-hans"] }, then: "zh" },
                { case: { $eq: ["$sourceLang", "zh-hant"] }, then: "zh" },
              ],
              default: "$sourceLang",
            },
          },
          normTgt: {
            $switch: {
              branches: [
                { case: { $eq: ["$targetLang", "zh-hans"] }, then: "zh" },
                { case: { $eq: ["$targetLang", "zh-hant"] }, then: "zh" },
              ],
              default: "$targetLang",
            },
          },
        },
      },
      // Collect translations per unique (source text + source lang)
      {
        $group: {
          _id: { src: "$normSrc", text: "$source" },
          translations: {
            $push: { lang: "$normTgt", text: "$target" },
          },
          srcLang: { $first: "$normSrc" },
          srcText: { $first: "$source" },
          score: { $max: "$confidenceScore" },
        },
      },
      { $sort: { score: -1, srcText: 1 } },
    ];

    // Count total grouped docs
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await col.aggregate(countPipeline).toArray();
    const total = countResult[0]?.total || 0;

    // Paginate
    pipeline.push({ $skip: (pageNum - 1) * pageSize });
    pipeline.push({ $limit: pageSize });

    const grouped = await col.aggregate(pipeline).toArray();

    // Flatten into { en, zh, km } rows
    const rows = grouped.map((doc) => {
      const row = { en: "", zh: "", km: "" };
      // Set source text in its language slot
      row[doc.srcLang] = doc.srcText;
      // Set each translation in its language slot
      doc.translations.forEach((t) => {
        if (t.lang && t.text) row[t.lang] = t.text;
      });
      return row;
    });

    res.json({
      rows,
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("Glossary parallel API error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/glossary/stats", async (_req, res) => {
  try {
    if (!mongoDb) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }

    const col = mongoDb.collection("glossaryterms");

    const [totalDocs, langPairs, statusCounts] = await Promise.all([
      col.countDocuments(),
      col.aggregate([
        { $group: { _id: { src: "$sourceLang", tgt: "$targetLang" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      col.aggregate([
        { $group: { _id: "$verificationStatus", count: { $sum: 1 } } },
      ]).toArray(),
    ]);

    res.json({
      total: totalDocs,
      languagePairs: langPairs.map((lp) => ({
        pair: `${lp._id.src}::${lp._id.tgt}`,
        label: `${lp._id.src.toUpperCase()} → ${lp._id.tgt.toUpperCase()}`,
        count: lp.count,
      })),
      statuses: statusCounts.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error("Glossary stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Smart Auto-Extract Pipeline (SSE) ──

/**
 * Extract from MULTIPLE pages for a single component.
 * Sends all page buffers together so Gemini sees the full context.
 */
async function extractMultiPage(pageBuffers, slotTitle) {
  const instruction = buildSlotInstruction(slotTitle);

  // Build inline data parts for every page
  const pageParts = pageBuffers.map((buf) => ({
    inlineData: {
      mimeType: "application/pdf",
      data: buf.toString("base64"),
    },
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      GEMINI_VISION_MODEL
    )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  instruction +
                  `\n\nIMPORTANT: You are receiving ${pageBuffers.length} page(s) that all belong to the "${slotTitle}" component. Extract and MERGE data from ALL pages into a single comprehensive JSON. Do NOT lose any information from any page.`,
              },
              ...pageParts,
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Extraction failed: ${response.status} ${text.slice(0, 200)}`);
  }

  const result = await response.json();
  const rawText =
    result?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") || "{}";

  try {
    return JSON.parse(rawText);
  } catch {
    return {
      pageType: slotTitle,
      summary: "Model returned non-JSON output",
      data: { rawText },
      warnings: ["Gemini response could not be parsed as JSON"],
    };
  }
}

/**
 * POST /api/auto-extract
 *
 * Accepts multiple PDF files, uses SSE to stream progress.
 * Pipeline: split pages → classify each → group by component → extract per component.
 */
app.post("/api/auto-extract", upload.array("files", 24), async (req, res) => {
  // Set up SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  function sendEvent(event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  try {
    if (!GEMINI_API_KEY) {
      sendEvent("error", { message: "Missing GEMINI_API_KEY in .env" });
      res.end();
      return;
    }

    const files = req.files || [];
    if (!files.length) {
      sendEvent("error", { message: "No files uploaded" });
      res.end();
      return;
    }

    // ── Phase 1: Split all PDFs into individual pages ──
    sendEvent("phase", { phase: "splitting", message: "Splitting PDFs into pages..." });

    const allPages = []; // { fileIndex, fileName, pageIndex, buffer }
    for (let fi = 0; fi < files.length; fi++) {
      const file = files[fi];
      const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        try {
          const pageBuffers = await splitPdfPages(file.buffer);
          for (let pi = 0; pi < pageBuffers.length; pi++) {
            allPages.push({
              fileIndex: fi,
              fileName: file.originalname,
              pageIndex: pi,
              pageNumber: pi + 1,
              totalPagesInFile: pageBuffers.length,
              buffer: pageBuffers[pi],
              mimeType: "application/pdf",
            });
          }
          sendEvent("split", {
            fileName: file.originalname,
            pages: pageBuffers.length,
          });
        } catch (splitErr) {
          sendEvent("warn", {
            fileName: file.originalname,
            message: `Failed to split: ${splitErr.message}`,
          });
        }
      } else {
        // Single image file — treat as 1 page
        allPages.push({
          fileIndex: fi,
          fileName: file.originalname,
          pageIndex: 0,
          pageNumber: 1,
          totalPagesInFile: 1,
          buffer: file.buffer,
          mimeType: file.mimetype,
        });
        sendEvent("split", { fileName: file.originalname, pages: 1 });
      }
    }

    sendEvent("phase", {
      phase: "classifying",
      message: `Classifying ${allPages.length} pages...`,
      totalPages: allPages.length,
    });

    // ── Phase 2: Classify each page ──
    // Process in batches of 3 for rate-limiting
    const CLASSIFY_BATCH = 3;
    for (let i = 0; i < allPages.length; i += CLASSIFY_BATCH) {
      const batch = allPages.slice(i, i + CLASSIFY_BATCH);
      const results = await Promise.allSettled(
        batch.map((page) =>
          classifyPage(page.buffer, page.mimeType, GEMINI_API_KEY, GEMINI_VISION_MODEL)
        )
      );

      results.forEach((result, batchIdx) => {
        const pageIdx = i + batchIdx;
        const page = allPages[pageIdx];
        if (result.status === "fulfilled") {
          page.classification = result.value;
          sendEvent("classified", {
            pageIndex: pageIdx,
            fileName: page.fileName,
            pageNumber: page.pageNumber,
            totalPagesInFile: page.totalPagesInFile,
            componentId: result.value.componentId,
            componentName: result.value.componentName,
            confidence: result.value.confidence,
            reasoning: result.value.reasoning,
            progress: pageIdx + 1,
            total: allPages.length,
          });
        } else {
          page.classification = { componentId: 0, componentName: "Unknown", confidence: 0 };
          sendEvent("classified", {
            pageIndex: pageIdx,
            fileName: page.fileName,
            pageNumber: page.pageNumber,
            componentId: 0,
            componentName: "Classification failed",
            confidence: 0,
            reasoning: result.reason?.message || "Unknown error",
            progress: pageIdx + 1,
            total: allPages.length,
          });
        }
      });

      // Small delay between batches to avoid rate limits
      if (i + CLASSIFY_BATCH < allPages.length) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    // ── Phase 3: Group pages by component ──
    const componentGroups = {}; // { componentId: { pages: [...], title, slot } }
    for (const page of allPages) {
      const cid = page.classification?.componentId || 0;
      if (cid === 0) continue; // skip unclassified

      if (!componentGroups[cid]) {
        const sig = COMPONENT_SIGNATURES.find((s) => s.id === cid);
        componentGroups[cid] = {
          componentId: cid,
          title: sig?.title || page.classification.componentName,
          slot: sig?.slot || `page-${String(cid).padStart(2, "0")}`,
          pages: [],
        };
      }
      componentGroups[cid].pages.push(page);
    }

    sendEvent("phase", {
      phase: "extracting",
      message: `Extracting ${Object.keys(componentGroups).length} components...`,
      components: Object.values(componentGroups).map((g) => ({
        id: g.componentId,
        title: g.title,
        pageCount: g.pages.length,
      })),
    });

    // ── Phase 4: Extract each component (all its pages together) ──
    const slotResults = {};
    const componentEntries = Object.values(componentGroups).sort(
      (a, b) => a.componentId - b.componentId
    );

    for (const group of componentEntries) {
      sendEvent("extracting", {
        componentId: group.componentId,
        title: group.title,
        pageCount: group.pages.length,
      });

      try {
        const pageBuffers = group.pages.map((p) => p.buffer);
        const extraction = await extractMultiPage(pageBuffers, group.title);

        const sourceFiles = [...new Set(group.pages.map((p) => p.fileName))];
        const sourcePages = group.pages.map(
          (p) => `${p.fileName} p${p.pageNumber}`
        );

        slotResults[group.slot] = {
          slotId: group.slot,
          slotTitle: group.title,
          fileName: sourceFiles.join(", "),
          sourcePages,
          pageCount: group.pages.length,
          extraction,
        };

        sendEvent("extracted", {
          componentId: group.componentId,
          slot: group.slot,
          title: group.title,
          pageCount: group.pages.length,
          sourceFiles,
          success: true,
        });
      } catch (exErr) {
        sendEvent("extracted", {
          componentId: group.componentId,
          slot: group.slot,
          title: group.title,
          success: false,
          error: exErr.message,
        });
      }

      // Brief delay between extraction calls
      await new Promise((r) => setTimeout(r, 200));
    }

    // ── Phase 5: Complete ──
    sendEvent("complete", {
      totalFiles: files.length,
      totalPages: allPages.length,
      componentsFound: Object.keys(componentGroups).length,
      slots: slotResults,
    });
  } catch (err) {
    console.error("Auto-extract error:", err);
    sendEvent("error", { message: err.message || "Auto-extract failed" });
  } finally {
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Extractor server running on http://localhost:${port}`);
});
