/**
 * GPAF6153-specific extraction agent for Comp01_CoverPage
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
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
  "rawNotes": [
    {
      "text": "exact note text including its number",
      "isRedText": "boolean - MUST be true if the font color of the text is RED.",
      "hasYellowHighlight": "boolean - MUST be true if there is a yellow background highlight."
    }
  ],
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
- You MUST populate "rawNotes". For EVERY note, explicitly evaluate if the text color is RED (set isRedText: true) or if the background is YELLOW (set hasYellowHighlight: true). Look VERY CLOSELY at notes 1, 3, 4, 6, 7, 8, 9, and 12, as they are typically RED.
- If isRedText is true OR hasYellowHighlight is true, you MUST also duplicate that exact note into the "criticalWarnings" array.
- For ALL notes, add their exact text to the "notes" array.
- CRITICAL: Extract the color-size quantity breakdown table (款號/STYLE 中查明细表). For EACH row extract the color name, color code, order quantity (订单数), and the quantity value for EVERY size column (XXS, XS, S, M, L, XL, XXL). If a size cell contains text notes instead of a number, put the text in "sizeNotes". Do NOT return empty sizes — extract every cell value.
- Extract the sample requirement table (大货需加裁抽办数量) with style, color, quantity, and purpose (用途).
- Extract the approval stamp (允許開裁): status, approved by, date.
- Describe the sketch visible on this page (front/back views).`
};
