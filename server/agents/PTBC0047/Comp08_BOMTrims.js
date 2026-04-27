/**
 * PTBC0047-specific extraction agent for Comp08_BOMTrims
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "trims": [{"category": "string", "part": "string", "description": "string", "size": "string", "color": "string", "colorCode": "string", "quantity": "string", "unit": "string", "supplier": "string", "supplierCode": "string", "comments": "string"}], "threads": [{"type": "string", "color": "string", "colorCode": "string", "ticketNumber": "string", "usage": "string"}], "packingMaterials": [{"item": "string", "size": "string", "quantity": "string", "supplier": "string"}] }`,
  rules: `- Extract EVERY row from trims BOM: zippers, buttons, elastic, drawcord, rivets, etc.
- Separate thread details (type, color, ticket#, usage area).
- Separate packing materials (polybag, tissue, hanger, etc.) if listed in same BOM.
- Include all supplier codes, sizes, and color codes.`
};
