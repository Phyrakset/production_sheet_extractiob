export default {
  schema: `{ "customerName": "string", "factoryName": "string", "poNumber": "string", "styleNumber": "string", "deliveryDates": ["string"], "totalQuantity": "number", "shipmentLots": [{"lot": "string", "color": "string", "quantity": "number", "date": "string", "destination": "string"}], "colorSizeBreakdown": [{"color": "string", "colorCode": "string", "sizeQuantities": {}}], "processes": [{"name": "string", "details": "string"}], "fabricInfo": "string", "washType": "string" }`,
  rules: `- Extract ALL header fields: customer, factory, PO#, style#.
- Extract every shipment lot row with lot number, color, qty, date, destination.
- Extract full color×size quantity table preserving all columns.
- Extract process summary (Print, Wash, Heat Transfer, etc.) with details.`
};
