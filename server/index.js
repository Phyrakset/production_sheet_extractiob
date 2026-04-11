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
    if (!files.length) {
      return res.status(400).json({
        error: "No files uploaded",
      });
    }

    const pageResults = [];
    for (const file of files) {
      const extraction = await extractDocumentFromGemini(file);
      pageResults.push({
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        extraction,
      });
    }

    const unifiedProfile = buildUnifiedProfile(pageResults);

    res.json({
      extractedAt: new Date().toISOString(),
      totalFiles: pageResults.length,
      pages: pageResults,
      unifiedProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Extraction failed",
    });
  }
});

async function extractDocumentFromGemini(file) {
  const instruction = `
You are extracting structured data from production sheet documents, garment technical packs, and related apparel specification pages.

Return only valid JSON with this exact top-level structure:
{
  "documentType": "string",
  "summary": "short summary of the page or file",
  "normalized": {
    "brand": "string or null",
    "styleId": "string or null",
    "specNumber": "string or null",
    "pageLabel": "string or null",
    "pageNumber": "string or null",
    "totalPages": "string or null",
    "shortDescription": "string or null",
    "longDescription": "string or null",
    "department": "string or null",
    "season": "string or null",
    "commodity": "string or null",
    "styleStatus": "string or null",
    "vendor": "string or null",
    "targetCost": "string or null",
    "targetUnits": "string or null",
    "plannedColors": "string or null",
    "deliveryCount": "string or null",
    "retailPrice": "string or null",
    "fitType": "string or null",
    "sizeRange": "string or null",
    "initialDcDate": "string or null",
    "approvalDate": "string or null",
    "floorSetDate": "string or null",
    "collections": ["array of strings"],
    "technicalNotes": ["array of strings"],
    "artworkNotes": ["array of strings"],
    "rawText": "full extracted text when practical"
  },
  "fields": [
    {
      "name": "normalized field key or original label",
      "label": "source label from document",
      "value": "captured value as text",
      "confidence": "high|medium|low",
      "sourceText": "short supporting snippet"
    }
  ],
  "warnings": ["array of issues, ambiguities, or unreadable areas"]
}

Rules:
- Preserve visible wording exactly when possible.
- If the file is a multi-page PDF, combine all visible pages into one response.
- Use null for unknown scalar values.
- Use [] for unknown arrays.
- Never wrap the JSON in markdown fences.
`;

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
      documentType: "unknown",
      summary: "Model returned non-JSON output",
      normalized: {
        brand: null,
        styleId: null,
        specNumber: null,
        pageLabel: null,
        pageNumber: null,
        totalPages: null,
        shortDescription: null,
        longDescription: null,
        department: null,
        season: null,
        commodity: null,
        styleStatus: null,
        vendor: null,
        targetCost: null,
        targetUnits: null,
        plannedColors: null,
        deliveryCount: null,
        retailPrice: null,
        fitType: null,
        sizeRange: null,
        initialDcDate: null,
        approvalDate: null,
        floorSetDate: null,
        collections: [],
        technicalNotes: [],
        artworkNotes: [],
        rawText,
      },
      fields: [],
      warnings: ["Gemini response could not be parsed as JSON"],
    };
  }
}

function buildUnifiedProfile(pageResults) {
  const normalizedObjects = pageResults.map((item) => item.extraction?.normalized || {});
  const flatFields = pageResults.flatMap((item) => item.extraction?.fields || []);

  const pickFirst = (key) => {
    for (const obj of normalizedObjects) {
      const value = obj?.[key];
      if (Array.isArray(value) && value.length) {
        return value;
      }
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
    return Array.isArray(normalizedObjects[0]?.[key]) ? [] : null;
  };

  return {
    documentType: pageResults.find((item) => item.extraction?.documentType)?.extraction?.documentType || "production-sheet",
    masterFields: {
      brand: pickFirst("brand"),
      styleId: pickFirst("styleId"),
      specNumber: pickFirst("specNumber"),
      shortDescription: pickFirst("shortDescription"),
      longDescription: pickFirst("longDescription"),
      department: pickFirst("department"),
      season: pickFirst("season"),
      commodity: pickFirst("commodity"),
      styleStatus: pickFirst("styleStatus"),
      vendor: pickFirst("vendor"),
      targetCost: pickFirst("targetCost"),
      targetUnits: pickFirst("targetUnits"),
      plannedColors: pickFirst("plannedColors"),
      deliveryCount: pickFirst("deliveryCount"),
      retailPrice: pickFirst("retailPrice"),
      fitType: pickFirst("fitType"),
      sizeRange: pickFirst("sizeRange"),
      initialDcDate: pickFirst("initialDcDate"),
      approvalDate: pickFirst("approvalDate"),
      floorSetDate: pickFirst("floorSetDate"),
      collections: mergeUniqueArrays(normalizedObjects.map((item) => item.collections)),
      technicalNotes: mergeUniqueArrays(normalizedObjects.map((item) => item.technicalNotes)),
      artworkNotes: mergeUniqueArrays(normalizedObjects.map((item) => item.artworkNotes)),
    },
    allFields: flatFields,
  };
}

function mergeUniqueArrays(values) {
  return [...new Set((values || []).flat().filter(Boolean))];
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
