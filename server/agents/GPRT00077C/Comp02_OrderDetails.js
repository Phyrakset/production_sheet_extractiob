export const Comp02_OrderDetails_GPRT00077C_Schema = {
  type: "object",
  properties: {
    header: {
      type: "object",
      properties: {
        customerCode: { type: "string", description: "e.g., 'ARITZIA HO' or 'RT'" },
        customerStyle: { type: "string", description: "e.g., 'FFS 99-03-44504-SU26(DW1830)...' or 'W02-490014 (W02-490014)'" },
        quantity: { type: "string", description: "e.g., '3999 PCS'" },
        pages: { type: "string", description: "e.g., '1 / 1'" },
        orderDate: { type: "string", description: "e.g., '2025.10.15'" },
        exFtyDate: { type: "string", description: "e.g., '2026.02.26'" },
        factoryNumber: { type: "string", description: "The boxed style number at the top right, e.g. 'GPAR12172GD-2' or 'GPRT00077C'" }
      }
    },
    poDetails: {
      type: "object",
      properties: {
        customerPo: { type: "string" },
        customerStyleDesc: { type: "string" },
        season: { type: "string" },
        coo: { type: "string", description: "Country of origin, e.g., 'CAM'" }
      }
    },
    productDescription: {
      type: "object",
      properties: {
        description: { type: "string" },
        colour: { type: "string" },
        quantity: { type: "number" }
      }
    },
    sizeBreakdown: {
      type: "array",
      items: {
        type: "object",
        properties: {
          colCode: { type: "string" },
          colour: { type: "string" },
          sizes: {
            type: "object",
            additionalProperties: { type: "number" },
            description: "A map of size labels to quantities, e.g., {'2XS': 187, 'XS': 560, 'S': 1185, 'M': 1222, 'L': 600, 'XL': 232, '2XL': 13}"
          },
          total: { type: "number" }
        }
      }
    },
    shipmentLots: {
      type: "array",
      items: {
        type: "object",
        properties: {
          lot: { type: "string" },
          exFtyDate: { type: "string" },
          quantity: { type: "number" }
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
You are extracting the "Order Details" (Comp 02) for style GPRT00077C.
Please follow the strict schema provided.
CRITICAL RULES:
- The top-left header contains CUSTOMER CODE, CUSTOMER STYLE, QUANTITY.
- The top-right header contains the title 'Prod. Sheet - Order Details', a boxed factory number (e.g., 'GPAR12172GD-2' or 'GPRT00077C'), PAGES, ORDER DATE, and EX FTY DATE.
- The first table has CUSTOMER PO, CUSTOMER ST(STYLE), SEASON, and C.O.O.
- The second table has DESCRIPTION, COLOUR, and QUANTITY.
- The size breakdown table spans multiple rows visually (e.g., 2XS through XL on row 1, and 2XL on row 2). You MUST merge all size columns for the same color into a SINGLE 'sizes' object inside 'sizeBreakdown'.
- The shipment lots table has SHIPMENT LOTS, EX FTY DATE, QUANTITY.
- The processes table has PRINT, EMBROIDERY, WASHING, HEAT TRANSFER.
- Capture exactly what is written, including Chinese characters. Do not miss any text.
- Be sure to capture the 'Status: ... EDIT BY ... PRINT BY ...' line at the very bottom of the page into 'footerStatus'.
`;
