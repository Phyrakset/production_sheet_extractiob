/**
 * Document Format Detection Agent
 *
 * Uses Gemini Vision to visually analyze a document page (usually the Cover Page)
 * to determine its layout family or Style ID, so that the correct specific
 * extraction schema can be routed.
 */

export const FORMAT_SIGNATURES = [
  {
    id: "GPAR12172GD-2",
    description: "Centric 8 PLM Tech Pack format OR tabular 'Prod. Sheet - Order Details' format. Look for a grey header bar with 'Centric 8', 'YORKWELL'. For internal pages, look for 'Prod. Sheet - Order Details' with 'GPAR12172GD-2' in a box on the top right, and multiple tables for Customer PO, Description, Size Breakdown, Shipment Lots, and Processes. Also matches sketch pages with callout texts ('注意大点', '车花').",
  },
  {
    id: "PTCOC270_270A",
    description: "Cover page contains a full yellow highlighted '注意大點' row, and a red approval stamp usually on the bottom.",
  },
  {
    id: "PTCOM227",
    description: "Cover page contains a full yellow highlighted '注意大點' row and a red floating warning note or stamp on the bottom right.",
  },
  {
    id: "PTBC0047",
    description: "Cover page contains '注意大點' with 9 numbered notes, a 3-column top table, and a specific layout for Retail Cover.",
  },
  {
    id: "GPAF6153",
    description: "Contains data tables specifically matching the GPAF6153 layout format.",
  },
  {
    id: "GPRT00077C",
    description: "Retail cover format specific to GPRT00077C.",
  }
];

export function buildFormatPrompt() {
  const formatList = FORMAT_SIGNATURES.map(
    (f) => `- ${f.id}: ${f.description}`
  ).join("\n");

  return `You are an expert document layout classifier. Your job is to visually analyze a page from a garment production document and determine its "Format Family" or Style ID.
Often, the style number is explicitly written on the page. If you see one of the known style numbers written in the text, use it.
However, sometimes the style number is missing. In that case, you must infer the format based on the visual layout cues (headers, table structures, stamps).

KNOWN FORMATS:
${formatList}
- generic: Use this if the document does not strongly match any of the above known formats.

CLASSIFICATION RULES:
1. Scan the text for explicit mentions of the known format IDs.
2. If none are found, analyze the visual structure (e.g., Centric PLM headers, yellow highlight rows, etc.).
3. Return "generic" ONLY if you cannot determine the specific layout.

Return ONLY valid JSON (no markdown fences):
{
  "detectedStyleId": "<one of the known IDs, or 'generic'>",
  "confidence": <0.0 to 1.0>,
  "reasoning": "<brief explanation of why this format was chosen>"
}`;
}

/**
 * Detects the document format using Gemini Vision
 *
 * @param {Buffer} pageBuffer - The PDF page as a buffer
 * @param {string} mimeType - MIME type of the file
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Gemini model name
 * @returns {Promise<{detectedStyleId: string, confidence: number, reasoning: string}>}
 */
export async function detectDocumentFormat(pageBuffer, mimeType, apiKey, model) {
  const prompt = buildFormatPrompt();
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
          temperature: 0.1,
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
    throw new Error(`Format detection failed: ${response.status} ${text.slice(0, 200)}`);
  }

  const result = await response.json();
  const rawText =
    result?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("") || "{}";

  try {
    const parsed = JSON.parse(rawText);
    return {
      detectedStyleId: parsed.detectedStyleId || "generic",
      confidence: parsed.confidence || 0,
      reasoning: parsed.reasoning || "",
    };
  } catch {
    return {
      detectedStyleId: "generic",
      confidence: 0,
      reasoning: "Failed to parse classification response",
    };
  }
}
