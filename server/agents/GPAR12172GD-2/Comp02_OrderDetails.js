export const Comp02_OrderDetails_GPAR12172GD_2_Schema = {
  type: "object",
  properties: {
    header: {
      type: "object",
      properties: {
        customerCode: { type: "string", description: "e.g., 'ARITZIA HO'" },
        customerStyle: { type: "string", description: "e.g., 'FFS 99-03-44504-SU26(DW1830) (FFS 99-03-44504-SU26(DW'" },
        quantity: { type: "string", description: "e.g., '3999 PCS'" },
        pages: { type: "string", description: "e.g., '1 / 1'" },
        orderDate: { type: "string", description: "e.g., '2025.10.15'" },
        exFtyDate: { type: "string", description: "e.g., '2026.02.26'" },
        factoryNumber: { type: "string", description: "The number inside the box at top right, e.g. 'GPAR12172GD-2'" }
      }
    },
    poDetails: {
      type: "object",
      properties: {
        customerPo: { type: "string", description: "e.g., '4500273013,4500273014,4500273015'" },
        customerStyleDesc: { type: "string", description: "e.g., 'ARITZIA'" },
        season: { type: "string", description: "e.g., 'S3/2026'" },
        coo: { type: "string", description: "e.g., 'CAM'" }
      }
    },
    productDescription: {
      type: "object",
      properties: {
        description: { type: "string", description: "e.g., 'LADIES' 78% COTTON 22% POLYESTER KNITTEDSWEATSHIR'" },
        colour: { type: "string", description: "e.g., 'NO-STRESS BEACH BLUE'" },
        quantity: { type: "number", description: "e.g., 3999" }
      }
    },
    sizeBreakdown: {
      type: "array",
      items: {
        type: "object",
        properties: {
          colCode: { type: "string", description: "e.g., 'ARW432'" },
          colour: { type: "string", description: "e.g., '成衣染輕松藍 NO-STRESS BEACH BLUE'" },
          sizes: {
            type: "object",
            description: "Key-value pair of size and quantity. For example, { '2XS': 187, 'XS': 560, 'S': 1185, 'M': 1222, 'L': 600, 'XL': 232, '2XL': 13 }. Consolidate all rows of sizes for a color into a single sizes object."
          },
          total: { type: "number", description: "e.g., 3999" }
        }
      }
    },
    shipmentLots: {
      type: "array",
      items: {
        type: "object",
        properties: {
          lot: { type: "string", description: "e.g., '1'" },
          exFtyDate: { type: "string", description: "e.g., '2026.02.26'" },
          quantity: { type: "number", description: "e.g., 3999" }
        }
      }
    },
    processes: {
      type: "object",
      properties: {
        print: { type: "string", description: "e.g., '无'" },
        embroidery: { type: "string", description: "e.g., '万丰: AG1189-42MM帽顶裁片车花'" },
        washing: { type: "string", description: "e.g., 'WS-GD: DW1830 - INDIGO DYE (BEACH BLUE) 胜欣成衣仿牛仔染色...'" },
        heatTransfer: { type: "string", description: "e.g., '无'" }
      }
    },
    remark: { type: "string", description: "Any text following 'REMARK :'" },
    footerStatus: { type: "string", description: "The small text at the very bottom, e.g. 'Status: T2YM    EDIT BY MPENNY.LEE DATE 2025/10/25 TIME 13:35:47   PRINT BY MPENNY.LEE DATE 2025/10/25 TIME'" }
  },
  required: ["header", "poDetails", "productDescription", "sizeBreakdown", "shipmentLots", "processes"]
};

export const extractionPrompt = `
You are extracting the "Order Details" (Comp 02) for style GPAR12172GD-2.
Please follow the strict schema provided.
CRITICAL RULES:
- The top-left header contains CUSTOMER CODE, CUSTOMER STYLE, QUANTITY.
- The top-right header contains the title 'Prod. Sheet - Order Details', a boxed factory number (e.g., 'GPAR12172GD-2'), PAGES, ORDER DATE, and EX FTY DATE.
- The first table has CUSTOMER PO, CUSTOMER ST(STYLE), SEASON, and C.O.O.
- The second table has DESCRIPTION, COLOUR, and QUANTITY.
- The size breakdown table spans multiple rows visually (e.g., 2XS through XL on row 1, and 2XL on row 2). You MUST merge all size columns for the same color into a SINGLE 'sizes' object inside 'sizeBreakdown'.
- The shipment lots table has SHIPMENT LOTS, EX FTY DATE, QUANTITY.
- The processes table has PRINT, EMBROIDERY, WASHING, HEAT TRANSFER.
- Capture exactly what is written, including Chinese characters. Do not miss any text.
- Be sure to capture the 'Status: ... EDIT BY ... PRINT BY ...' line at the very bottom of the page into 'footerStatus'.
`;
