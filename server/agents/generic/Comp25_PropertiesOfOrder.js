export default {
  schema: `{ "styleNumber": "string", "season": "string", "buyer": "string", "brand": "string", "vendor": "string", "factory": "string", "orderQuantity": "number", "shipDate": "string", "destination": "string", "terms": "string", "properties": [{"key": "string", "value": "string"}], "notes": ["string"] }`,
  rules: `- Extract all fundamental properties, metadata, and attributes of the order.
- Identify the style number, season, buyer, brand, vendor, and factory if present.
- Capture order quantity, ship date, destination, and shipping terms (e.g., FOB, CIF).
- Extract any additional key-value properties or order attributes into the properties array.
- Capture any general notes or remarks regarding the order.`
};
