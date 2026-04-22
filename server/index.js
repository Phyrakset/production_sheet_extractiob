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

Important:
- Extract only data relevant to the "${slotTitle}" page itself.
- Keep visible page header data that is printed on this same page, such as brand/logo text, page label, spec ref, page number text, and style ID.
- Do not return broad master-profile data from other page types.
- If a value is not visible, use null for scalars and [] for arrays.
- Preserve visible wording exactly as shown when practical.
- Return only valid JSON. Do not wrap in markdown fences.

Return this exact structure:
{
  "pageType": "${slotTitle}",
  "brand": "string or null",
  "pageRef": "string or null",
  "styleId": "string or null",
  "summary": "short summary",
  "data": ${config.schema},
  "otherInformation": ["array of ANY text, notes, callouts, or data found on the page that does not logically fit into the specific 'data' fields provided. DO NOT ignore any text!"],
  "warnings": ["array of issues or unreadable areas"]
}

Page-specific rules:
${config.rules}
`;
}

function getSlotConfig(slotTitle) {
  const title = String(slotTitle || "").toLowerCase();

  switch (title) {
    case "dt order sheet":
      return {
        schema: `{ "factoryNumber": "string", "jobNumber": "string", "poNumber": "string", "orderQuantity": "number", "keyPoints": ["string"], "sampleRequirements": [{"sampleType": "string", "quantity": "string", "notes": "string"}], "colorBreakdown": [{"color": "string", "quantity": "number"}], "sizeBreakdown": [{"size": "string", "quantity": "number"}], "sizeRatio": "string", "approvalInfo": {"approvers": "string", "date": "string", "status": "string"} }`,
        rules: "- Extract EVERYTHING from DT Order Sheet or initial Cover Page including all factory numbers, key attention points (大點), detailed size/quantity breakdowns, sample requirements, and approval stamps."
      };
    case "production notes":
      return {
        schema: `{ "generalInstructions": ["string"], "fabricNotes": ["string"], "packingNotes": ["string"], "qaNotes": ["string"], "revisions": ["string"] }`,
        rules: "- Find any YM production notes, pre-production (PP) comments, and critical warnings."
      };
    case "dt size spec":
      return {
        schema: `{ "baseSize": "string", "sizeRange": "string", "toleranceRules": "string", "generalFitNotes": ["string"], "revisionDate": "string", "measurements": [{"point": "string", "target": "string", "tolerance": "string"}] }`,
        rules: "- Extract size spec measurements (often from Report #799)."
      };
    case "technical sketch":
      return {
        schema: `{ "garment": "string", "generalDesignNotes": ["string"], "sketchRevisions": ["string"], "frontViewDetails": [{"text": "string"}], "backViewDetails": [{"text": "string"}], "interiorDetails": [{"text": "string"}], "callouts": [{"text": "string", "view": "string"}] }`,
        rules: "- Focus on flat sketches and broad design callouts."
      };
    case "graphic placement":
      return {
        schema: `{ "logoType": "string", "applicationMethod": "string", "colorsUsed": ["string"], "placementDiagramNotes": ["string"], "positionVertical": "string", "positionHorizontal": "string", "scalingRule": [{"size": "string", "scale": "string"}] }`,
        rules: "- Look for Graphic CADs, Placement POMs, Logo dimensions and scale rules."
      };
    case "artwork prints":
      return {
        schema: `{ "artworkCode": "string", "vendorName": "string", "printTechnique": "string", "repeatSize": "string", "strikeOffRequirements": "string", "colorPantones": ["string"], "notes": ["string"] }`,
        rules: "- Look for print patterns, embroidery codes, and color distribution."
      };
    case "color & pantone":
      return {
        schema: `{ "season": "string", "colorStandards": ["string"], "comboBreakdowns": [{"part": "string", "colorway": "string"}], "colorways": [{"name": "string", "pantone": "string", "placement": "string"}] }`,
        rules: "- Identify all pantone values mapped to garment parts."
      };
    case "fabric & materials":
      return {
        schema: `{ "materials": [{"part": "string", "material": "string", "content": "string", "supplier": "string", "weight": "string", "cutDirection": "string", "shrinkageTolerances": "string"}] }`,
        rules: "- Extract main fabric, lining, and shell BOM information."
      };
    case "trims & hardware":
      return {
        schema: `{ "trims": [{"part": "string", "description": "string", "quantity": "string", "supplier": "string", "finish": "string", "dimensions": "string", "placementNotes": "string", "testingRequirements": "string"}] }`,
        rules: "- Focus on zippers, buttons, elastics, drawcords."
      };
    case "labels & tags":
      return {
        schema: `{ "labels": [{"ticketType": "string", "description": "string", "placement": "string", "dimensions": "string", "material": "string", "attachmentMethod": "string", "variableDataFields": ["string"]}] }`,
        rules: "- Focus on brand label, care label, size tag, and hangtags."
      };
    case "thread consumption":
      return {
        schema: `{ "totalPerGarment": "string", "totalGarmentYield": "string", "detailsBySeam": [{"seam": "string", "length": "string", "threadType": "string", "ticketNumber": "string", "coneSize": "string", "allowancePercentage": "string"}] }`,
        rules: "- Extract thread usage calculations (IE thread consumption sheet)."
      };
    case "operation sequence":
      return {
        schema: `{ "sewingOperations": [{"step": "string", "machineType": "string", "sam": "string", "operatorSkillLevel": "string", "folderNeeded": "string"}] }`,
        rules: "- Extract the step-by-step sewing order (Technical/IE operation flow)."
      };
    case "construction rules":
      return {
        schema: `{ "stitchTypes": ["string"], "seamFinishes": ["string"], "bindingMethods": ["string"], "specialNotes": ["string"], "spi": "string", "needleSpacing": "string", "threadTensionNotes": "string", "pressingInstructions": "string" }`,
        rules: "- Look for tech pack detailed constructions. SPI, seam allowances, edge finishes."
      };
    case "grading rules":
      return {
        schema: `{ "baseSize": "string", "sizeRange": "string", "gradingSystem": "string", "rules": [{"dimension": "string", "increment": "string", "gradeJumps": ["string"]}] }`,
        rules: "- Extract scaling and grading rules."
      };
    case "measurements guide":
      return {
        schema: `{ "diagramReferences": ["string"], "criticalPoints": ["string"], "instructions": [{"pom": "string", "howToMeasure": "string"}] }`,
        rules: "- Extract HTM descriptions."
      };
    case "packing rules":
      return {
        schema: `{ "foldingMethod": "string", "polybagWarnings": "string", "cartonSizeLimits": "string", "cartonDimensions": "string", "polybagSpecs": "string", "ratioPackingRules": "string", "innerBoxQty": "string" }`,
        rules: "- Extract buyer compliance folding and packing instructions."
      };
    case "carton specs":
      return {
        schema: `{ "barcodeRules": "string", "stickerPlacement": "string", "cartonMarks": ["string"], "grossWeightLimit": "string", "netWeight": "string", "shippingMarks": "string", "boxQuality": "string" }`,
        rules: "- Extract barcodes, labels, and mark locations for boxes."
      };
    case "qa standards":
      return {
        schema: `{ "aqlLevel": "string", "inspectionMethod": "string", "testingProtocols": ["string"], "defectClassifications": [{"defect": "string", "severity": "string", "acceptableDefectLevels": "string"}] }`,
        rules: "- Focus on Acceptable Quality Level and inspection standards."
      };
    case "fit photos":
      return {
        schema: `{ "modelSize": "string", "fitComments": ["string"], "patternCorrections": ["string"], "sampleStatus": "string", "visualReferences": [{"view": "string", "description": "string"}] }`,
        rules: "- Extract references to physical sample photos."
      };
    default:
      return {
        schema: `{ "content": {} }`,
        rules: "- Extract general data that is specific to the visible page."
      };
  }
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
