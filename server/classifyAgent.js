/**
 * Page Classification Agent
 *
 * Uses Gemini Vision to identify which of the 19 garment production
 * components a given PDF page belongs to.
 */

// The 19 component signatures used for classification
export const COMPONENT_SIGNATURES = [
  {
    id: 1,
    slot: "page-01",
    title: "Cover Page",
    zhName: "注意大點",
    keywords: [
      "cover page", "summary page", "key notes", "brand logo",
      "style number", "factory number", "PO number", "quantity matrix",
      "color-size breakdown", "注意大點", "允許開裁", "大货需加裁",
      "订单数", "款号", "廠號",
    ],
    description:
      "Cover/summary page with brand, customer name, style#, factory#, PO, total qty, color×size matrix, production notes, approval stamp, garment sketch.",
  },
  {
    id: 2,
    slot: "page-02",
    title: "Order Details",
    zhName: "订单明细",
    keywords: [
      "order details", "shipment lot", "delivery date", "destination",
      "color×size", "process summary", "订单明细", "交期", "出货",
    ],
    description:
      "Order information: customer, factory, PO#, delivery dates, shipment lots with color/qty/date/destination, full color×size qty table, process list (print, wash, HT).",
  },
  {
    id: 3,
    slot: "page-03",
    title: "Tech Sketch",
    zhName: "款式图",
    keywords: [
      "tech sketch", "technical drawing", "front view", "back view",
      "garment sketch", "callout", "annotation", "款式图", "设计图",
    ],
    description:
      "Technical drawings showing front/back/detail views of the garment with callout annotations, measurement point markers, and construction notes.",
  },
  {
    id: 4,
    slot: "page-04",
    title: "Construction",
    zhName: "生产工艺",
    keywords: [
      "construction", "sewing operation", "工序表", "工艺单",
      "machine type", "needle type", "thread", "SPI", "stitch",
      "seam", "workmanship", "大货注意", "生产工艺",
    ],
    description:
      "Sewing operation table (step#, description, machine, needle, thread, SPI), workmanship instructions, wash/finishing steps, label placement instructions.",
  },
  {
    id: 5,
    slot: "page-05",
    title: "Mfg Standards",
    zhName: "缝制标准",
    keywords: [
      "manufacturing standards", "MFTG", "minimum standards",
      "cutting standard", "fusing", "pressing", "finishing",
      "construction diagram", "缝制标准", "CUT/SEW KNIT",
    ],
    description:
      "Manufacturing standards: cutting, fusing, needle, stitching, pressing, finishing, labeling specs. Construction diagrams (hood, pocket, hem). Minimum standards table.",
  },
  {
    id: 6,
    slot: "page-06",
    title: "Colorways",
    zhName: "颜色",
    keywords: [
      "colorway", "pantone", "color matching", "fabric color",
      "wash type", "color approval", "颜色", "配色", "pantone",
    ],
    description:
      "Colorway entries (name, code, Pantone, wash type, fabric color), color matching photos with approval notes, BOM items per colorway.",
  },
  {
    id: 7,
    slot: "page-07",
    title: "BOM Fabrics",
    zhName: "面料物料",
    keywords: [
      "BOM", "bill of materials", "fabric", "material",
      "composition", "weight", "width", "supplier", "shell",
      "lining", "interlining", "用料清單", "面料", "物料",
    ],
    description:
      "Fabric BOM table: category (shell/lining/rib/interlining), part, material, composition, weight, width, color, supplier, qty, unit price.",
  },
  {
    id: 8,
    slot: "page-08",
    title: "BOM Trims",
    zhName: "辅料",
    keywords: [
      "trims", "zipper", "button", "elastic", "drawcord",
      "rivet", "thread", "packing material", "polybag",
      "辅料", "拉链", "纽扣",
    ],
    description:
      "Trims BOM: zippers, buttons, elastic, drawcord, rivets, etc. Thread details (type, color, ticket#). Packing materials (polybag, tissue, hanger).",
  },
  {
    id: 9,
    slot: "page-09",
    title: "Labels",
    zhName: "唛头标签",
    keywords: [
      "label", "hangtag", "heat transfer", "care label",
      "size label", "brand label", "UPC", "barcode label",
      "唛头", "标签", "吊牌",
    ],
    description:
      "Label entries: brand, care, size, content, country-of-origin, UPC. Placement and attach method. Hangtag and heat transfer details.",
  },
  {
    id: 10,
    slot: "page-10",
    title: "Artwork",
    zhName: "印花绣花",
    keywords: [
      "artwork", "embroidery", "print", "heat transfer",
      "stitch count", "placement diagram", "3D render",
      "印花", "绣花", "刺绣",
    ],
    description:
      "Artwork details: code, type (print/embroidery/HT), placement measurements, colors with codes, stitch count/type, render/placement diagrams.",
  },
  {
    id: 11,
    slot: "page-11",
    title: "POMs",
    zhName: "成品尺寸",
    keywords: [
      "POM", "point of measure", "size spec", "measurement",
      "成品尺寸", "成品规格表", "tolerance", "XXS", "XS", "M", "XL",
      "size chart", "spec table",
    ],
    description:
      "POM/size spec table: measurement point codes and names, tolerance values, size columns (3XS through 3XL) with values.",
  },
  {
    id: 12,
    slot: "page-12",
    title: "Grading",
    zhName: "放码规则",
    keywords: [
      "grading", "grade rule", "increment", "GRADING APPROVED",
      "放码", "base size", "size range",
    ],
    description:
      "Grading rules: approval status/date, base size, size range, per-dimension increments between sizes.",
  },
  {
    id: 13,
    slot: "page-13",
    title: "HTM Guide",
    zhName: "度尺图",
    keywords: [
      "how to measure", "HTM", "度尺图", "measurement diagram",
      "garment laid flat", "HPS", "red marker",
    ],
    description:
      "How-to-measure guide: measurement point diagrams with start/end points, general measurement criteria, red markers on garment diagrams.",
  },
  {
    id: 14,
    slot: "page-14",
    title: "Measure QA",
    zhName: "量度QA",
    keywords: [
      "QA measurement", "evaluation", "actual vs target",
      "pass/fail", "sample type", "PP", "TOP", "SIZE SET",
    ],
    description:
      "QA measurement evaluation: target spec vs actual measured value, difference, tolerance, pass/fail per point. Sample type and overall result.",
  },
  {
    id: 15,
    slot: "page-15",
    title: "PP Comments",
    zhName: "PP办评语",
    keywords: [
      "PP sample", "PP comments", "PP办评语", "sample review",
      "defect photo", "bulk notes", "大货注意",
    ],
    description:
      "PP sample review comments: approval status, area-specific feedback with issues and actions, defect photos, measurement comparison, bulk production notes.",
  },
  {
    id: 16,
    slot: "page-16",
    title: "Fit Photos",
    zhName: "实物照片",
    keywords: [
      "fit photo", "garment photo", "mannequin", "model",
      "front view", "back view", "实物照片", "实拍",
    ],
    description:
      "Fit/garment photos: front/back/side/detail views, correct vs incorrect examples, mannequin/model size info, fit comments.",
  },
  {
    id: 17,
    slot: "page-17",
    title: "QA Standards",
    zhName: "质量标准",
    keywords: [
      "AQL", "inspection level", "critical defect", "major defect",
      "minor defect", "testing requirement", "colorfastness",
      "shrinkage", "质量标准",
    ],
    description:
      "QA standards: AQL level, defect classification (critical/major/minor), testing requirements (wash, shrinkage, colorfastness), finishing checklist.",
  },
  {
    id: 18,
    slot: "page-18",
    title: "Packaging",
    zhName: "包装出货",
    keywords: [
      "packaging", "packing", "folding method", "polybag",
      "carton", "carton mark", "barcode", "shipment",
      "包装", "出货", "装箱",
    ],
    description:
      "Packing details: folding method, polybag, carton specs, carton mark, barcode placement, shipment lot details with destination/qty/cartons.",
  },
  {
    id: 19,
    slot: "page-19",
    title: "Revision History",
    zhName: "修改记录",
    keywords: [
      "revision", "history", "change log", "version",
      "carryover", "修改记录", "版本",
    ],
    description:
      "Revision history: dates, versions, sections changed, descriptions, who made/approved changes, carryover notes.",
  },
];

/**
 * Build the classification prompt for Gemini Vision
 */
export function buildClassificationPrompt() {
  const componentList = COMPONENT_SIGNATURES.map(
    (c) =>
      `${c.id}. ${c.zhName} ${c.title} — ${c.description}`
  ).join("\n");

  return `You are an expert garment production sheet classifier. Given one page from a factory production document, identify which of these 19 components it belongs to.

COMPONENTS:
${componentList}

CLASSIFICATION RULES:
1. Analyze the visual layout, tables, diagrams, text headings, and content of the page.
2. Look for Chinese and English headings, table structures, and visual cues.
3. A page may contain overlapping content — choose the PRIMARY component it serves.
4. If a page contains measurements with size columns (XXS, XS, S, M, L, XL...), it's likely POMs (#11) unless it also has "GRADING APPROVED" (then #12) or "How to Measure" diagrams (then #13).
5. If a page has photos of garments on forms/mannequins, it's Fit Photos (#16).
6. If a page has PP sample comments/feedback with defect markings, it's PP Comments (#15).
7. If a page is CLEARLY the first/cover page with brand, style#, and numbered notes, it's Cover Page (#1).
8. If a page has BOM tables with material rows, check if it's fabric (shell/lining = #7) or trims (zipper/button/elastic = #8).
9. If unsure between two components, return the more specific one.

Return ONLY valid JSON (no markdown fences):
{
  "componentId": <1-19>,
  "componentName": "<English name>",
  "confidence": <0.0 to 1.0>,
  "reasoning": "<brief explanation of why this page matches>"
}`;
}

/**
 * Classify a single page using Gemini Vision
 *
 * @param {Buffer} pageBuffer - The PDF page as a buffer
 * @param {string} mimeType - MIME type of the file
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Gemini model name
 * @returns {Promise<{componentId: number, componentName: string, confidence: number, reasoning: string}>}
 */
export async function classifyPage(pageBuffer, mimeType, apiKey, model) {
  const prompt = buildClassificationPrompt();
  const base64Data = pageBuffer.toString("base64");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.05,
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || "application/pdf",
                  data: base64Data,
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
    throw new Error(`Classification failed: ${response.status} ${text.slice(0, 200)}`);
  }

  const result = await response.json();
  const rawText =
    result?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("") || "{}";

  try {
    const parsed = JSON.parse(rawText);
    return {
      componentId: parsed.componentId || 0,
      componentName: parsed.componentName || "Unknown",
      confidence: parsed.confidence || 0,
      reasoning: parsed.reasoning || "",
    };
  } catch {
    return {
      componentId: 0,
      componentName: "Unknown",
      confidence: 0,
      reasoning: "Failed to parse classification response",
    };
  }
}

/**
 * Split a multi-page PDF into individual single-page PDF buffers (in memory)
 *
 * @param {Buffer} pdfBuffer - The full PDF file buffer
 * @returns {Promise<Buffer[]>} - Array of single-page PDF buffers
 */
export async function splitPdfPages(pdfBuffer) {
  const { PDFDocument } = await import("pdf-lib");
  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const pageBuffers = [];

  for (let i = 0; i < totalPages; i++) {
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
    newDoc.addPage(copiedPage);
    const bytes = await newDoc.save();
    pageBuffers.push(Buffer.from(bytes));
  }

  return pageBuffers;
}

/**
 * Merge multiple single-page PDF buffers into one multi-page PDF
 *
 * @param {Buffer[]} pageBuffers - Array of single-page PDF buffers
 * @returns {Promise<Buffer>} - Merged PDF buffer
 */
export async function mergePdfPages(pageBuffers) {
  const { PDFDocument } = await import("pdf-lib");
  const mergedDoc = await PDFDocument.create();

  for (const buf of pageBuffers) {
    const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    pages.forEach((page) => mergedDoc.addPage(page));
  }

  const bytes = await mergedDoc.save();
  return Buffer.from(bytes);
}
