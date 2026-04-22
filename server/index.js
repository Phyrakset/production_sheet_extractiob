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

  // --- Phase A: 订单基础 Order & Identity ---
  if (title.includes("key notes") || title.includes("注意大點")) {
    return {
      schema: `{ "brand": "string", "styleNumber": "string", "factoryNumber": "string", "season": "string", "poNumber": "string", "totalQuantity": "number", "notes": ["string"], "criticalWarnings": ["string"], "colorSizeMatrix": [{"color": "string", "sizes": {}}] }`,
      rules: `- This is the cover/summary page (注意大點). Extract brand, style#, factory#, PO#, total quantity.
- Extract ALL numbered production notes/warnings.
- Extract the color-size quantity breakdown table if visible.
- Keep Chinese text exactly as shown.`
    };
  }
  if (title.includes("order details") || title.includes("订单明细")) {
    return {
      schema: `{ "poNumber": "string", "deliveryDates": ["string"], "totalQuantity": "number", "shipmentLots": [{"lot": "string", "quantity": "number", "date": "string"}], "breakdown": [{"color": "string", "size": "string", "quantity": "number"}], "processes": ["string"] }`,
      rules: `- Extract purchase order numbers, quantities, size/color breakdown.
- Extract shipment lot details (lot number, quantity, date).
- Extract process summary items (e.g., Print, Wash, Heat Transfer).`
    };
  }

  // --- Phase B: 设计工艺 Design & Construction ---
  if (title.includes("tech sketch") || title.includes("款式图")) {
    return {
      schema: `{ "pageLabel": "string", "garment": "string", "callouts": [{"text": "string", "view": "front|back|both|unknown", "kind": "construction|measurement|note"}], "measurementPoints": ["string"] }`,
      rules: `- Focus on technical flat drawings and their direct callouts.
- Extract all annotation text pointing to specific garment areas.
- Note measurement reference points if shown (e.g., 度尺图 markers).`
    };
  }
  if (title.includes("construction") || title.includes("生产工艺")) {
    return {
      schema: `{ "operations": [{"step": "number", "description": "string", "machineType": "string", "qualityNote": "string"}], "seams": [{"location": "string", "type": "string", "spi": "string"}], "instructions": ["string"] }`,
      rules: `- Extract sewing operation lists (工序表/工艺单), machine types, quality requirements.
- Extract workmanship instructions and production process steps.
- Include label placement and assembly sequence details.`
    };
  }
  if (title.includes("mfg standards") || title.includes("缝制标准")) {
    return {
      schema: `{ "cutting": ["string"], "fusing": ["string"], "needle": ["string"], "stitching": ["string"], "pressing": ["string"], "finishing": ["string"], "minimumStandards": ["string"] }`,
      rules: `- Extract manufacturing standards for cutting, fusing, needle specs.
- Include MFTG Standards items: construction details, labeling requirements, pressing, finishing.
- Extract CUT/SEW KNIT TOPS MINIMUM STANDARDS if present.`
    };
  }
  if (title.includes("colorways") || title.includes("颜色")) {
    return {
      schema: `{ "colorways": [{"name": "string", "code": "string", "pantone": "string", "placement": "string", "washType": "string"}], "colorMatchPhotos": ["string"] }`,
      rules: `- Extract color mapping, Pantone codes, and colorway assignments.
- Include wash/treatment details per colorway (e.g., No-Stress GD, Medium Blue).
- Note any color matching approval photos or PPS stripe matching info.`
    };
  }

  // --- Phase C: 物料 Materials & BOM ---
  if (title.includes("bom fabrics") || title.includes("面料物料")) {
    return {
      schema: `{ "materials": [{"part": "string", "material": "string", "composition": "string", "weight": "string", "supplier": "string", "color": "string", "comments": "string"}] }`,
      rules: `- Focus on main fabrics, linings, interlining, rib materials, yarn.
- Extract from BOM/Multi-level Placements/Style BOM Template sections.
- Include composition, weight, and supplier details.`
    };
  }
  if (title.includes("bom trims") || title.includes("辅料")) {
    return {
      schema: `{ "trims": [{"part": "string", "description": "string", "color": "string", "quantity": "string", "supplier": "string"}], "threads": [{"type": "string", "color": "string", "code": "string"}] }`,
      rules: `- Focus on hardware, zippers, buttons, elastic, thread, sewing materials.
- Separate thread details into their own array if present.
- Include packaging materials only if they appear in the trims BOM section.`
    };
  }
  if (title.includes("labels") || title.includes("唛头标签")) {
    return {
      schema: `{ "labels": [{"ticketType": "string", "description": "string", "placement": "string", "supplier": "string", "quantity": "string", "comments": "string"}], "hangtags": [{"type": "string", "description": "string"}] }`,
      rules: `- Focus on brand labels, care labels, size labels, content labels, hangtags, heat transfers.
- Extract placement instructions (e.g., center back neck, side seam).
- Include label details from Tech Pack Placements sections.`
    };
  }
  if (title.includes("artwork") || title.includes("印花绣花")) {
    return {
      schema: `{ "artworkCode": "string", "type": "print|embroidery|heat_transfer|other", "placement": "string", "dimensions": {"width": "string", "height": "string"}, "colors": ["string"], "notes": ["string"], "approvalStatus": "string" }`,
      rules: `- Focus on prints, embroideries, graphic placement, heat transfer specs.
- Extract artwork dimensions, placement measurements, color codes.
- Include 3D render descriptions or placement diagram details.`
    };
  }

  // --- Phase D: 量度 Measurement & Fit ---
  if (title.includes("poms") || title.includes("成品尺寸")) {
    return {
      schema: `{ "measurementSet": "string", "uom": "cm|inch", "tolerancePlus": "string", "toleranceMinus": "string", "points": [{"code": "string", "name": "string", "tolerance": "string", "xxs": "string", "xs": "string", "s": "string", "m": "string", "l": "string", "xl": "string", "xxl": "string", "xxxl": "string"}] }`,
      rules: `- Extract the POM graded measurement spec sheet (成品尺寸/成品规格表).
- Include all size columns present in the document.
- Extract tolerance values per measurement point.`
    };
  }
  if (title.includes("grading") || title.includes("放码规则")) {
    return {
      schema: `{ "approvalStatus": "string", "baseSize": "string", "rules": [{"code": "string", "dimension": "string", "increment": "string", "unit": "string"}] }`,
      rules: `- Extract grading increments and size scaling rules.
- Note grading approval status (e.g., "GRADING APPROVED").
- Include base size and incremental values between sizes.`
    };
  }
  if (title.includes("htm guide") || title.includes("度尺图")) {
    return {
      schema: `{ "instructions": [{"code": "string", "name": "string", "howToMeasure": "string", "diagramDescription": "string"}] }`,
      rules: `- Extract How-To-Measure (度尺图) visual measurement guides.
- Describe each measurement point and how to measure it.
- Include measurement point codes if shown (e.g., 1000, 1125, 1300).`
    };
  }
  if (title.includes("measure qa") || title.includes("量度qa")) {
    return {
      schema: `{ "sampleSize": "string", "tables": [{"pom": "string", "code": "string", "target": "string", "actual": "string", "difference": "string", "pass": "boolean"}] }`,
      rules: `- Extract QA measurement evaluation tables.
- Include target vs actual measurements and pass/fail status.
- Note sample size being measured.`
    };
  }

  // --- Phase E: 质量出货 Quality & Shipping ---
  if (title.includes("pp comments") || title.includes("pp办评语")) {
    return {
      schema: `{ "sampleType": "string", "submissionDate": "string", "approvalStatus": "string", "comments": [{"area": "string", "feedback": "string", "action": "string"}], "bulkNotes": ["string"] }`,
      rules: `- Extract PP sample review comments (PP办评语).
- Include approval status (APPROVED/REJECTED/CONDITIONAL).
- Extract area-specific feedback with required actions.
- Include 大货注意 (bulk production notes) if present.`
    };
  }
  if (title.includes("fit photos") || title.includes("实物照片")) {
    return {
      schema: `{ "photos": [{"view": "front|back|side|detail|unknown", "description": "string", "comments": "string"}], "garmentOnForm": "boolean" }`,
      rules: `- Describe actual garment photos or reference visual pictures (样衣图).
- Note if garment is shown on mannequin/form or flat.
- Include any fit comments or construction detail photos.`
    };
  }
  if (title.includes("qa standards") || title.includes("质量标准")) {
    return {
      schema: `{ "aql": "string", "inspectionLevel": "string", "defectClassifications": [{"defect": "string", "severity": "critical|major|minor"}], "standards": ["string"] }`,
      rules: `- Extract Acceptable Quality Levels and inspection standards.
- Include defect classification details.
- Extract finishing and QC standards from MFTG Standards sections.`
    };
  }
  if (title.includes("packaging") || title.includes("包装出货")) {
    return {
      schema: `{ "foldingMethod": "string", "polybag": "string", "cartonMark": "string", "packingInstructions": ["string"], "shipmentDetails": [{"destination": "string", "quantity": "number"}], "barcodes": ["string"] }`,
      rules: `- Extract packing method, folding instructions, polybag specs.
- Include carton mark layout, barcode placement.
- Extract shipment details, destination, quantities per color/size.`
    };
  }
  if (title.includes("revision history") || title.includes("修改记录")) {
    return {
      schema: `{ "revisions": [{"date": "string", "version": "string", "description": "string", "changedBy": "string"}], "carryoverNote": "string" }`,
      rules: `- Extract change log entries with dates and descriptions.
- Include version numbers and who made each change.
- Note any carryover/reorder style notes.`
    };
  }

  // Default fallback
  return {
    schema: `{ "content": {} }`,
    rules: "- Extract general data that is specific to the visible page."
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
