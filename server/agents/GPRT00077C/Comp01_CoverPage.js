export const Comp01_CoverPage_GPRT00077C_Schema = {
  type: "object",
  properties: {
    factoryNumber: {
      type: "string",
      description: "The factory style number, usually GPRT00077C"
    },
    title: {
      type: "string",
      description: "The main title, e.g., 'GPRT00077C 注意大點'"
    },
    headerTable: {
      type: "object",
      properties: {
        customerStyle: { type: "string", description: "客款號 (e.g., W02-490014)" },
        factoryNumber: { type: "string", description: "廠號 (e.g., GPRT00077C)" },
        poNumber: { type: "string", description: "PO#" },
        quantity: { type: "string", description: "數量 (e.g., 3,200 pcs)" },
        retailOrder: { type: "string", description: "Retail单 (e.g., 要PO#+RETEK 组合唛)" }
      }
    },
    keyNotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          number: { type: "string", description: "Note number, e.g., '1.'" },
          text: { type: "string", description: "The content of the blue text note." },
          isStrikethrough: { type: "boolean", description: "True if the text is crossed out with a red line (e.g., note 2)." }
        }
      },
      description: "The blue text notes under the '大點：' block."
    },
    tableA: {
      type: "object",
      properties: {
        rows: {
          type: "array",
          items: {
            type: "object",
            properties: {
              style: { type: "string", description: "款號/STYLE" },
              color: { type: "string", description: "顏色/COLOR" },
              mSizeCount: { type: "string", description: "M码(件), usually '5 pc'" },
              usage: { type: "string", description: "用途" }
            }
          }
        },
        total: { type: "string", description: "Total 合计:, e.g., '5 pc'" }
      }
    },
    tableB: {
      type: "object",
      properties: {
        rows: {
          type: "array",
          items: {
            type: "object",
            properties: {
              style: { type: "string", description: "款號/STYLE--- 中查明细表" },
              color: { type: "string", description: "颜色/COLOR" },
              orderCount: { type: "string", description: "订单数" },
              sizeDetails: { type: "string", description: "The large merged green cell containing size breakdown details." }
            }
          }
        }
      }
    },
    stampPresent: {
      type: "boolean",
      description: "True if there is a red '允許開裁 KIM + DEE' stamp at the bottom right."
    }
  },
  required: ["factoryNumber", "title", "headerTable", "keyNotes", "tableA", "tableB", "stampPresent"]
};
