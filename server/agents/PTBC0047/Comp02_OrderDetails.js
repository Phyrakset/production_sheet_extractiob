export const Comp02_OrderDetails_PTBC0047_Schema = {
  type: "object",
  properties: {
    header: {
      type: "object",
      properties: {
        customerCode: { type: "string", description: "e.g., 'C&O APPARE'" },
        customerStyle: { type: "string", description: "e.g., left blank if empty in the document" },
        quantity: { type: "string", description: "e.g., '210080 PCS'" },
        pages: { type: "string", description: "e.g., '1 / 1'" },
        orderDate: { type: "string", description: "e.g., '2018.01.03'" },
        exFtyDate: { type: "string", description: "e.g., '2018.06.08'" },
        factoryNumber: { type: "string", description: "The number inside the box at top right, e.g. 'PTBC0047'" }
      }
    },
    poDetails: {
      type: "object",
      properties: {
        customerPo: { type: "string", description: "e.g., 'TBA'" },
        customerStyleDesc: { type: "string", description: "e.g., 'Bench LS Fleece Pullover'" },
        season: { type: "string", description: "e.g., 'FALL, 2018'" },
        coo: { type: "string", description: "e.g., 'CAM'" }
      }
    },
    productDescription: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string", description: "e.g., 'LADIES' 100% POLYESTER KNITTED PULLOVER'" },
          colour: { type: "string", description: "e.g., 'BLACK SPACE DYE'" },
          quantity: { type: "number", description: "e.g., 73528" }
        }
      },
      description: "Extract each row in the description table as an object. If a cell is blank, leave it empty."
    },
    sizeBreakdown: {
      type: "array",
      items: {
        type: "object",
        properties: {
          colCode: { type: "string", description: "e.g., 'CGY524'" },
          colour: { type: "string", description: "e.g., '灰色 BLACK SPACE DYE'" },
          sizes: {
            type: "object",
            description: "Key-value pair of size and quantity. For example, { 'S': 13244, 'M': 20580, 'L': 20580, 'XL': 11760, 'XXL': 7364 }. Consolidate all sizes into a single object for that color."
          },
          total: { type: "number", description: "e.g., 73528" }
        }
      }
    },
    shipmentLots: {
      type: "array",
      items: {
        type: "object",
        properties: {
          lot: { type: "string", description: "e.g., '1'" },
          exFtyDate: { type: "string", description: "e.g., '2018.06.08'" },
          quantity: { type: "number", description: "e.g., 50000" }
        }
      }
    },
    processes: {
      type: "object",
      properties: {
        print: { type: "string", description: "e.g., 'FLOCKING PRINT @ CHEST'" },
        embroidery: { type: "string", description: "e.g., '无'" },
        washing: { type: "string", description: "e.g., '无'" },
        heatTransfer: { type: "string", description: "e.g., '无'" }
      }
    },
    remark: { type: "string", description: "Any text following 'REMARK :'" },
    footerStatus: { type: "string", description: "The small text at the very bottom, e.g. 'Status: T1    EDIT BY MSOKHA DATE 2018/04/26 TIME 15:44:38...'" }
  },
  required: ["header", "poDetails", "productDescription", "sizeBreakdown", "shipmentLots", "processes"]
};

export const extractionPrompt = `
You are extracting the "Order Details" (Comp 02) for style PTBC0047.
Please follow the strict schema provided.

CRITICAL RULES:
- The top-left header contains CUSTOMER CODE, CUSTOMER STYLE, QUANTITY. (Note: CUSTOMER STYLE might be blank).
- The top-right header contains the title 'Prod. Sheet - Order Details', a boxed factory number (e.g., 'PTBC0047'), PAGES, ORDER DATE, and EX FTY DATE.
- The first table has CUSTOMER PO, CUSTOMER STY, SEASON, and C.O.O.
- The second table has DESCRIPTION, COLOUR, and QUANTITY. It may have multiple rows. Extract all rows into the 'productDescription' array.
- The size breakdown table spans multiple sizes (S, M, L, XL, XXL). Merge all size columns for the same row into a single 'sizes' object inside 'sizeBreakdown'.
- The COLOUR column in the size breakdown table usually contains both Chinese and English (e.g. "灰色" and "BLACK SPACE DYE"). Extract both together in the 'colour' field.
- The shipment lots table has SHIPMENT LOTS, EX FTY DATE, QUANTITY.
- The processes table has PRINT, EMBROIDERY, WASHING, HEAT TRANSFER.
- Capture exactly what is written. Do not miss any text.
- Be sure to capture the 'Status: ... EDIT BY ... PRINT BY ...' line at the very bottom of the page into 'footerStatus'.
`;

export default {
  schema: Comp02_OrderDetails_PTBC0047_Schema,
  prompt: extractionPrompt,
};
