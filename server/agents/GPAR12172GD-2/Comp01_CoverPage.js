export const Comp01_CoverPage_GPAR12172GD_2_Schema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Main title at the top, typically 'GPAR12172GD-2 注意大點' or similar."
    },
    headerTable: {
      type: "object",
      properties: {
        customerStyle: { type: "string", description: "客款號 (e.g. FFS 99-03-44504-SU26(DW1830))" },
        factoryNumber: { type: "string", description: "廠號 (e.g. GPAR12172GD-2)" },
        season: { type: "string", description: "Season (e.g. S3/2026)" },
        article: { type: "string", description: "Article (e.g. 125942)" },
        poNumbers: {
          type: "array",
          items: { type: "string" },
          description: "List of PO numbers (e.g. ['4500273013,VAN', '4500273014,TOR'])"
        },
        quantity: { type: "string", description: "數量 (e.g. 3999 PCS)" },
        stampPresent: { type: "boolean", description: "Is there a red '允許開裁' stamp present on the right side of the header table?" }
      }
    },
    criticalNotes: {
      type: "array",
      items: { type: "string" },
      description: "The list of red warnings or critical notes found in the '大點：' block in the middle of the page."
    },
    numberedNotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          number: { type: "string", description: "The number prefix (e.g. '1/')" },
          content: { type: "string", description: "The text content of the note." },
          hasImage: { type: "boolean", description: "Whether this note has an embedded photo or diagram next to it (like the ARITZIA label)." }
        }
      },
      description: "The numbered list of instructions at the bottom."
    }
  },
  required: ["title", "headerTable", "criticalNotes", "numberedNotes"]
};

export const extractionPrompt = `
You are extracting the "Cover Page" (Comp 01) for style GPAR12172GD-2.
Please follow the strict schema provided.
- For 'criticalNotes', extract each distinct line or paragraph found in the '大點：' block (typically colored red) as a separate string.
- For 'numberedNotes', split the bottom section by the note numbers (1/, 2/, 3/, etc.). Identify if an image is present next to the note (e.g., label photo next to 4/ and 5/).
- 'poNumbers' should be an array of strings, split by line.
`;
