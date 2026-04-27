export const Comp02_OrderDetails_PTCOM227_Schema = {
  type: "object",
  properties: {
    orders: {
      type: "array",
      description: "Extract EACH page/order of the document as a separate object in this array.",
      items: {
        type: "object",
        properties: {
          header: {
            type: "object",
            properties: {
              customerCode: { type: "string", description: "e.g., 'C&O APPARE'" },
              customerStyle: { type: "string", description: "e.g., '3AFESHSP1-571 (3AFESHSP1-571)'" },
              quantity: { type: "string", description: "e.g., '8005 PCS'" },
              pages: { type: "string", description: "e.g., '1 / 1'" },
              orderDate: { type: "string", description: "e.g., '2020.08.30'" },
              exFtyDate: { type: "string", description: "e.g., '2020.12.24'" },
              factoryNumber: { type: "string", description: "The number inside the box at top right, e.g. 'PTCOM227'" }
            }
          },
          poDetails: {
            type: "object",
            properties: {
              customerPo: { type: "string", description: "e.g., 'A001559'" },
              customerStyleDesc: { type: "string", description: "e.g., 'LIVE IN PRINTED 7/8 LEGGING'" },
              season: { type: "string", description: "e.g., 'SPRING 2021'" },
              coo: { type: "string", description: "e.g., 'CAM'" }
            }
          },
          productDescription: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string", description: "e.g., 'LADIES 82% POLYESTER 18% SPANDEX KNITTED PANTS'" },
                colour: { type: "string", description: "e.g., 'BLACK PRINT'" },
                quantity: { type: "number", description: "e.g., 5001" }
              }
            },
            description: "Extract each row in the description table as an object. If a cell is blank, leave it empty."
          },
          sizeBreakdown: {
            type: "array",
            items: {
              type: "object",
              properties: {
                colCode: { type: "string", description: "e.g., 'CBK023'" },
                colour: { type: "string", description: "e.g., '黑色印花 BLACK PRINT'" },
                sizes: {
                  type: "object",
                  description: "Key-value pair of size and quantity. For example, { 'XS': 150, 'S': 600, 'M': 1350, 'L': 1449, 'XL': 951, '2XL': 501 }. Consolidate all sizes into a single object for that color."
                },
                total: { type: "number", description: "e.g., 5001" }
              }
            }
          },
          shipmentLots: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lot: { type: "string", description: "e.g., '1'" },
                exFtyDate: { type: "string", description: "e.g., '2020.12.24'" },
                quantity: { type: "number", description: "e.g., 8005" }
              }
            }
          },
          processes: {
            type: "object",
            properties: {
              print: { type: "string", description: "e.g., '无'" },
              embroidery: { type: "string", description: "e.g., '无'" },
              washing: { type: "string", description: "e.g., '无'" },
              heatTransfer: { type: "string", description: "e.g., 'LOGO烫唛'" }
            }
          },
          remark: { type: "string", description: "Any text following 'REMARK :'" },
          footerStatus: { type: "string", description: "The small text at the very bottom, e.g. 'Status: T1 EDIT BY MJULIE DATE ...'" }
        },
        required: ["header", "poDetails", "productDescription", "sizeBreakdown", "shipmentLots", "processes"]
      }
    }
  },
  required: ["orders"]
};

export const extractionPrompt = `
You are extracting the "Order Details" (Comp 02) for style PTCOM227.
This document may contain MULTIPLE PAGES representing different orders.
Please follow the strict schema provided.

CRITICAL RULES:
- If there are multiple pages for different orders, extract EACH page as a separate object inside the "orders" array.
- Do NOT combine pages. Do NOT place the second page in "otherInformation". Put all pages inside the "orders" array.
- The top-left header contains CUSTOMER CODE, CUSTOMER STYLE, QUANTITY. 
- The top-right header contains the title 'Prod. Sheet - Order Details', a boxed factory number (e.g., 'PTCOM227'), PAGES, ORDER DATE, and EX FTY DATE.
- The first table has CUSTOMER PO, CUSTOMER STY, SEASON, and C.O.O.
- The second table has DESCRIPTION, COLOUR, and QUANTITY. It may have multiple rows. Extract all rows into the 'productDescription' array.
- The size breakdown table spans multiple sizes (XS, S, M, L, XL, 2XL). Merge all size columns for the same row into a single 'sizes' object inside 'sizeBreakdown'.
- The COLOUR column in the size breakdown table usually contains both Chinese and English (e.g. "黑色印花" and "BLACK PRINT"). Extract both together in the 'colour' field.
- The shipment lots table has SHIPMENT LOTS, EX FTY DATE, QUANTITY.
- The processes table has PRINT, EMBROIDERY, WASHING, HEAT TRANSFER.
- Capture exactly what is written. Do not miss any text.
- Be sure to capture the 'Status: ... EDIT BY ... PRINT BY ...' line at the very bottom of the page into 'footerStatus'.
`;

export default {
  schema: Comp02_OrderDetails_PTCOM227_Schema,
  rules: extractionPrompt,
};
