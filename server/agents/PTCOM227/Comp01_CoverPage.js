export const Comp01_CoverPage_PTCOM227_Schema = {
  type: "object",
  properties: {
    factoryNumber: {
      type: "string",
      description: "The factory style number, usually PTCOM227"
    },
    title: {
      type: "string",
      description: "The main title, e.g., 'PTCOM227注意大點'"
    },
    headerTable: {
      type: "object",
      properties: {
        customerStyle: { type: "string", description: "客款號 (e.g., 3AFESHSP1-571)" },
        factoryNumber: { type: "string", description: "廠號 (e.g., PTCOM227)" },
        poNumber: { type: "string", description: "PO# (e.g., A001559)" },
        quantity: { type: "string", description: "數量 (e.g., 8,005 pcs)" }
      }
    },
    importantNote: {
      type: "string",
      description: "The red text next to the '大點：' cell, e.g., '大货成衣烫缩'"
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
      description: "The numbered notes (1 through 12) inside the table."
    },
    stampPresent: {
      type: "boolean",
      description: "True if there is a red '允許開裁' stamp."
    }
  },
  required: ["factoryNumber", "title", "headerTable", "importantNote", "notesTable", "stampPresent"]
};
