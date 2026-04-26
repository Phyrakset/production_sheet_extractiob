export const Comp01_CoverPage_PTBC0047_Schema = {
  type: "object",
  properties: {
    factoryNumber: {
      type: "string",
      description: "The factory style number, usually PTBC0047"
    },
    title: {
      type: "string",
      description: "The main title, e.g., 'PTBC0047 注意大點'"
    },
    headerTable: {
      type: "object",
      properties: {
        customerStyle: { type: "string", description: "客款號 (e.g., BLED0132C)" },
        factoryNumber: { type: "string", description: "廠號 (e.g., PTBC0047)" },
        poNumber: { type: "string", description: "PO# (e.g., TBA)" },
        quantity: { type: "string", description: "數量 (e.g., 210,000 pcs)" }
      }
    },
    notesTable: {
      type: "array",
      items: {
        type: "object",
        properties: {
          number: { type: "string", description: "Note number, e.g., '1'" },
          content: { type: "string", description: "The text content of the note" }
        }
      },
      description: "The numbered notes (1 through 8) inside the table."
    },
    floatingNote: {
      type: "string",
      description: "The floating note at the bottom (usually note 9) that sits outside the table border."
    },
    stampPresent: {
      type: "boolean",
      description: "True if there is a red '允許開裁' stamp at the bottom center."
    }
  },
  required: ["factoryNumber", "title", "headerTable", "notesTable", "floatingNote", "stampPresent"]
};
