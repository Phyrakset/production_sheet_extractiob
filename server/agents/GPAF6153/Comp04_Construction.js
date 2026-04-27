/**
 * GPAF6153-specific extraction agent for Comp04_Construction
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{
    "header": {
      "customerCode": "string",
      "customerStyle": "string",
      "quantity": "string",
      "pages": "string",
      "orderDate": "string",
      "exFtyDate": "string",
      "factoryNumber": "string",
      "description": "string"
    },
    "instructions": [
      {
        "title": "string",
        "content": ["string"]
      }
    ],
    "footer": {
      "status": "string",
      "editBy": "string",
      "printBy": "string"
    }
  }`,
  rules: `- Extract the top header metadata including CUSTOMER CODE, CUSTOMER STYLE, QUANTITY, PAGES, ORDER DATE, EX FTY DATE, and the factory number (e.g. GPAF6153).
- Extract the bold DESCRIPTION block exactly as written.
- Break down the main body into "instructions", where each instruction block (like "生产指示1", "生产指示2") has its own object.
- The 'title' should be the bold section header (e.g. "生产指示1").
- The 'content' should be an array of strings representing each line/bullet point under that section. Keep the Chinese and English text exactly as written. Keep the numbering intact.
- Extract the footer information (Status, EDIT BY, PRINT BY) at the very bottom.`
};
