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
    files: 12,
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

app.post("/api/extract", upload.array("files", 12), async (req, res) => {
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

  if (title === "sketch") {
    return {
      schema: `{
    "pageLabel": "string or null",
    "specRef": "string or null",
    "pageNumberText": "string or null",
    "garment": "string or null",
    "canvasNote": "string or null",
    "callouts": [
      {
        "text": "string or null",
        "view": "front|back|both|unknown",
        "target": "string or null",
        "kind": "construction|measurement|note|unknown"
      }
    ],
    "standaloneMarks": ["array of exact short marks like 3/8\\" or 1/2\\""]
  }`,
      rules: `- Focus on sketch/construction notes only.
- Keep visible header items on this same page: brand, full page label, spec ref, page number text, and style ID.
- Do not include extra business fields like department, season, target cost, retail price, or other repeated header fields unless the user can clearly see them and they are needed to understand the page.
- Preserve every visible sketch annotation exactly as shown.
- Include all long callouts such as seam, cuff, band, tack, and coverstitch notes in "callouts".
- Include short standalone measurement marks such as 3/8" and 1/2" in "standaloneMarks".
- Put the centered page note such as "ALL SEAMS MUST STRETCH" into "canvasNote".
- If the page label reads "002 : Sketch TECHNICAL", keep the full wording rather than shortening it to just "TECHNICAL".
- If the brand/logo reads "REITMANS", keep it exactly.
- Do not merge different annotation blocks into one string if they appear separately on the page.`,
    };
  }

  if (title === "artwork") {
    return {
      schema: `{
    "artworkCode": "string or null",
    "texts": ["array of visible artwork text"],
    "notes": ["array of placement or artwork notes"]
  }`,
      rules: `- Focus on artwork code, visible artwork wording, and artwork placement notes only.
- Ignore repeated header/business metadata.`,
    };
  }

  if (title === "materials") {
    return {
      schema: `{
    "materials": [
      {
        "part": "string or null",
        "material": "string or null",
        "supplier": "string or null",
        "articleNo": "string or null",
        "materialType": "string or null",
        "color": "string or null",
        "status": "string or null",
        "comments": "string or null"
      }
    ],
    "trims": [
      {
        "part": "string or null",
        "material": "string or null",
        "supplier": "string or null",
        "articleNo": "string or null",
        "size": "string or null",
        "quantity": "string or null",
        "finish": "string or null",
        "color": "string or null",
        "status": "string or null",
        "comments": "string or null"
      }
    ],
    "processes": [
      {
        "material": "string or null",
        "part": "string or null",
        "supplier": "string or null",
        "status": "string or null",
        "comments": "string or null"
      }
    ]
  }`,
      rules: `- Focus only on BOM materials, trims, and processes tables.
- Ignore repeated header/business metadata.`,
    };
  }

  if (title === "labels") {
    return {
      schema: `{
    "labels": [
      {
        "material": "string or null",
        "part": "string or null",
        "ticketType": "string or null",
        "ticketCode": "string or null",
        "supplier": "string or null",
        "quantity": "string or null",
        "status": "string or null",
        "comments": "string or null",
        "materialType": "string or null"
      }
    ]
  }`,
      rules: `- Focus only on the labels table rows.
- Ignore repeated header/business metadata.`,
    };
  }

  if (title === "packaging") {
    return {
      schema: `{
    "packaging": [
      {
        "material": "string or null",
        "part": "string or null",
        "supplier": "string or null",
        "status": "string or null",
        "comments": "string or null"
      }
    ]
  }`,
      rules: `- Focus only on packaging rows.
- Ignore repeated header/business metadata and ignore labels data unless it is part of packaging on this page.`,
    };
  }

  if (title === "measure") {
    return {
      schema: `{
    "measurementSet": "string or null",
    "sampleSize": "string or null",
    "uom": "string or null",
    "notes": ["array of measurement notes"],
    "points": [
      {
        "code": "string or null",
        "name": "string or null",
        "placementReference": "string or null",
        "tolerance": "string or null",
        "xxs": "string or null",
        "xs": "string or null",
        "s": "string or null",
        "m": "string or null",
        "l": "string or null",
        "xl": "string or null",
        "xxl": "string or null"
      }
    ]
  }`,
      rules: `- Focus only on measurement notes and measurement table rows.
- Ignore repeated header/business metadata.`,
    };
  }

  return {
    schema: `{
  "content": {}
}`,
    rules: `- Extract only data that is specific to the visible page.`,
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
