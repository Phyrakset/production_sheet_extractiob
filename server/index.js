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
  "warnings": ["array of issues or unreadable areas"]
}

Page-specific rules:
${config.rules}
`;
}

function getSlotConfig(slotTitle) {
  const title = String(slotTitle || "").toLowerCase();

  switch (title) {
    case "cover page":
      return {
        schema: `{ "brand": "string", "styleNumber": "string", "season": "string", "designers": ["string"], "revisions": [{"date": "string", "comment": "string"}] }`,
        rules: "- Focus on high-level style identity and revision history."
      };
    case "key notes":
      return {
        schema: `{ "notes": ["string"], "criticalWarnings": ["string"] }`,
        rules: "- Extract critical production alerts, warnings, and Key Notes (注意大點)."
      };
    case "order details":
      return {
        schema: `{ "poNumber": "string", "deliveryDates": ["string"], "totalQuantity": "number", "breakdown": [{"color": "string", "size": "string", "quantity": "number"}] }`,
        rules: "- Extract purchase order and quantity breakdowns."
      };
    case "sketch":
      return {
        schema: `{ "pageLabel": "string", "garment": "string", "callouts": [{"text": "string", "view": "front|back|both|unknown", "kind": "construction|measurement|note"}] }`,
        rules: "- Focus on technical flat drawings and their direct callouts."
      };
    case "construction":
      return {
        schema: `{ "seams": [{"location": "string", "type": "string", "spi": "string"}], "instructions": ["string"] }`,
        rules: "- Extract sewing sequences, edge finishes, and assembly steps."
      };
    case "mfg standards":
      return {
        schema: `{ "cutting": ["string"], "fusing": ["string"], "needle": ["string"] }`,
        rules: "- Extract manufacturing standards for cutting, fusing, and stitching."
      };
    case "colorways":
      return {
        schema: `{ "colorways": [{"name": "string", "pantone": "string", "placement": "string"}] }`,
        rules: "- Extract color mapping and pantone assignments."
      };
    case "materials":
      return {
        schema: `{ "materials": [{"part": "string", "material": "string", "supplier": "string", "color": "string", "comments": "string"}] }`,
        rules: "- Focus on main fabrics, linings, and shell bulk materials."
      };
    case "trims":
      return {
        schema: `{ "trims": [{"part": "string", "description": "string", "color": "string", "quantity": "string", "supplier": "string"}] }`,
        rules: "- Focus on hardware, zippers, buttons, threads, and elastics."
      };
    case "labels":
      return {
        schema: `{ "labels": [{"ticketType": "string", "supplier": "string", "quantity": "string", "comments": "string"}] }`,
        rules: "- Focus on brand labels, care labels, and hangtags."
      };
    case "artwork":
      return {
        schema: `{ "artworkCode": "string", "texts": ["string"], "notes": ["string"] }`,
        rules: "- Focus on prints, embroideries, placement instructions."
      };
    case "measure":
      return {
        schema: `{ "measurementSet": "string", "uom": "string", "points": [{"code": "string", "name": "string", "tolerance": "string", "xxs": "string", "xs": "string", "s": "string", "m": "string", "l": "string", "xl": "string"}] }`,
        rules: "- Focus on the POM graded measurement charts."
      };
    case "grading":
      return {
        schema: `{ "rules": [{"dimension": "string", "increment": "string"}] }`,
        rules: "- Extract grading increments and scaling rules."
      };
    case "measure qa":
      return {
        schema: `{ "tables": [{"pom": "string", "target": "string", "actual": "string", "difference": "string"}] }`,
        rules: "- Extract QA measurement checks and filled forms."
      };
    case "htm guide":
      return {
        schema: `{ "instructions": [{"pom": "string", "howToMeasure": "string"}] }`,
        rules: "- Extract visually described How-To-Measure guides."
      };
    case "qa standards":
      return {
        schema: `{ "aql": "string", "defectClassifications": [{"defect": "string", "severity": "string"}] }`,
        rules: "- Extract Acceptable Quality Levels and defect standards."
      };
    case "sample comments":
      return {
        schema: `{ "sampleType": "string", "approvalStatus": "string", "comments": [{"area": "string", "feedback": "string"}] }`,
        rules: "- Extract fit feedback and Pre-Production (PP) comments."
      };
    case "fit photos":
      return {
        schema: `{ "photos": [{"view": "string", "description": "string"}] }`,
        rules: "- Describe actual garment photos or reference visual pictures."
      };
    case "packaging":
      return {
        schema: `{ "packaging": [{"material": "string", "part": "string", "supplier": "string", "comments": "string"}] }`,
        rules: "- Focus on polybags, carton marks, and packing methods."
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
