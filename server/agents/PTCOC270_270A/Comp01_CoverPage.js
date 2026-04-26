export const Comp01_CoverPage_PTCOC270_270A_Schema = {
  type: "object",
  properties: {
    factoryNumber: {
      type: "string",
      description: "The factory style number, usually PTCOC270/270A"
    },
    title: {
      type: "string",
      description: "The main title, e.g., 'PTCOC270+270A注意大點'"
    },
    headerTable: {
      type: "object",
      properties: {
        customerStyle: { type: "string", description: "客款號 (e.g., STCO4143)" },
        factoryNumber: { type: "string", description: "廠號 (e.g., PTCOC270/270A)" },
        poNumber: { type: "string", description: "PO# (e.g., TBA)" },
        quantity: { type: "string", description: "數量 (e.g., PTCOC270:163744pcs\nPTCOC270A:4416pcs) - capture multiline if present" }
      }
    },
    importantNote: {
      type: "string",
      description: "The large red text next to the '大點：' cell, e.g., '注意入箱后衣服不能皱'"
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
      description: "The numbered notes (1 through 11) inside the table. Note 11 may contain multiple sub-points, capture them all in the content."
    },
    stampPresent: {
      type: "boolean",
      description: "True if there is a red '允許開裁' stamp."
    }
  },
  required: ["factoryNumber", "title", "headerTable", "importantNote", "notesTable", "stampPresent"]
};
