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
    title: "Instruction",
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
    title: "MFTG Standards",
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
    title: "Multi-level Placements",
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
    id: 11,
    slot: "page-11",
    title: "POMs Measurement",
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
    id: 13,
    slot: "page-13",
    title: "Measurement Guide",
    zhName: "度尺图",
    keywords: [
      "how to measure", "HTM", "度尺图", "measurement diagram",
      "garment laid flat", "HPS", "red marker",
    ],
    description:
      "How-to-measure guide: measurement point diagrams with start/end points, general measurement criteria, red markers on garment diagrams.",
  },

  {
    id: 15,
    slot: "page-15",
    title: "Approval Comment",
    zhName: "PP办评语",
    keywords: [
      "PP sample", "PP comments", "PP办评语", "sample review",
      "defect photo", "bulk notes", "大货注意",
    ],
    description:
      "PP sample review comments: approval status, area-specific feedback with issues and actions, defect photos, measurement comparison, bulk production notes.",
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
    id: 20,
    slot: "page-20",
    title: "Size Spec",
    zhName: "尺码规格",
    keywords: [
      "size spec", "size specification", "size chart", "尺码规格",
      "尺码表", "规格表", "garment measurements", "finished measurements",
      "size breakdown", "spec sheet", "size run",
    ],
    description:
      "Size specification table: measurement code, description, tolerance, and values for each size in the size range. Includes fit type, sample size, unit, and fabric shrinkage notes.",
  },
  {
    id: 21,
    slot: "page-21",
    title: "Technical Team Note",
    zhName: "技术团队备注",
    keywords: [
      "technical note", "team note", "technical team", "技术备注",
      "技术团队", "工艺备注", "production note", "engineering note",
      "tech comment", "team feedback", "internal note",
    ],
    description:
      "Technical team notes and observations: categorized comments on fabric, stitching, fitting, finishing, QC. Action items with responsible persons, deadlines, and status. General remarks.",
  },
  {
    id: 22,
    slot: "page-22",
    title: "Process Sheet",
    zhName: "工序表",
    keywords: [
      "process sheet", "工序表", "工序", "process flow",
      "operation breakdown", "SAM", "standard allowed minutes",
      "sewing process", "process sequence", "operation list",
      "工艺流程", "流程表",
    ],
    description:
      "Process sheet: step-by-step operation breakdown with machine types, needle types, stitch types, SPI, seam allowances, time allocations, total SAM, efficiency, and operator count.",
  },
  {
    id: 23,
    slot: "page-23",
    title: "Special Instruction",
    zhName: "特别指示",
    keywords: [
      "special instruction", "特别指示", "特别要求", "special requirement",
      "critical instruction", "注意事项", "特殊工艺", "special process",
      "important note", "special attention", "key instruction",
    ],
  },
  {
    id: 24,
    slot: "page-24",
    title: "Measurement Spec",
    zhName: "测量规格",
    keywords: [
      "measurement spec", "测量规格", "尺寸表", "measurement chart",
      "spec sheet", "规格表", "measurement tolerance", "尺寸公差",
      "garment measurements", "成衣尺寸",
    ],
    description:
      "Measurement specification table: codes, descriptions, tolerances, and specific measurement values. Often includes sample size and units (cm/inch). Similar to POMs or Size Spec but focuses on detailed measurement points and tolerances.",
  },
  {
    id: 25,
    slot: "page-25",
    title: "Properties of Order",
    zhName: "订单属性",
    keywords: [
      "properties of order", "订单属性", "order properties", "order details",
      "style info", "款号信息", "order info", "订单信息", "metadata",
    ],
    description:
      "Order properties and metadata: style number, season, buyer, brand, vendor, factory, order quantity, ship date, destination, terms, and key-value attributes.",
  },
  {
    id: 26,
    slot: "page-26",
    title: "Style Template",
    zhName: "款式模板",
    keywords: [
      "style template", "款式模板", "base pattern", "design template",
      "template reference", "款式参考",
    ],
    description:
      "Style template information: template name, style reference, base pattern details, and key design elements.",
  },
  {
    id: 27,
    slot: "page-27",
    title: "Embroidery Specification",
    zhName: "绣花规格",
    keywords: [
      "embroidery", "绣花", "stitch count", "thread color",
      "embroidery detail", "绣花要求", "applique", "贴布绣",
    ],
    description:
      "Embroidery specification: details about embroidery placement, technique, dimensions, thread colors, stitch count, and backing material.",
  },
  {
    id: 28,
    slot: "page-28",
    title: "Fabrics Consumption",
    zhName: "面料用量",
    keywords: [
      "fabric consumption", "面料用量", "yield", "marker length",
      "wastage", "cuttable width", "consumption per garment", "net yield"
    ],
    description:
      "Fabric consumption: details about fabric yield, wastage, marker length, cuttable width, and material required per garment.",
  },
  {
    id: 29,
    slot: "page-29",
    title: "Measurement Evaluation",
    zhName: "尺寸评估",
    keywords: [
      "measurement evaluation", "尺寸评估", "sample evaluation", "PP evaluation",
      "deviation", "tolerance", "pass fail", "measurement check", "actual spec"
    ],
    description:
      "Measurement evaluation: details about sample measurements compared against specifications, including deviations, tolerances, and pass/fail results.",
  },
  {
    id: 30,
    slot: "page-30",
    title: "Placement",
    zhName: "位置",
    keywords: [
      "placement", "位置", "position", "distance from seam",
      "logo placement", "print placement", "label placement"
    ],
    description:
      "Placement: details about the physical location of elements (logos, labels, prints) on the garment, including dimensions and distances.",
  },
  {
    id: 31,
    slot: "page-31",
    title: "Measurement Instruction",
    zhName: "尺寸指示",
    keywords: [
      "measurement instruction", "尺寸指示", "how to measure instructions",
      "measurement rules", "tolerance guide", "measurement details"
    ],
    description:
      "Measurement instruction: detailed textual guidelines, rules, and tolerances for how measurements should be taken and verified.",
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

  return `You are an expert garment production sheet classifier. Given one page from a factory production document, identify which of these 23 components it belongs to.

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
9. If a page has a full size specification table with measurement codes and values per size column but WITHOUT point-of-measure formatting, it may be Size Spec (#20) rather than POMs (#11).
10. If unsure between two components, return the more specific one.

Return ONLY valid JSON (no markdown fences):
{
  "componentId": <integer ID from the list>,
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
