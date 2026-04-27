/**
 * GPAR12172GD-2-specific extraction agent for Comp18_Packaging
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default {
  schema: `{ "foldingMethod": "string", "foldingDiagram": "string", "polybag": {"size": "string", "type": "string", "suffocationWarning": "boolean"}, "tissue": "string", "innerPack": {"method": "string", "quantity": "string"}, "carton": {"dimensions": "string", "weight": "string", "maxPieces": "number", "assortmentRatio": "string"}, "cartonMark": {"content": ["string"], "layout": "string"}, "barcodes": [{"type": "string", "position": "string", "content": "string"}], "packingInstructions": ["string"], "shipmentDetails": [{"lot": "string", "color": "string", "destination": "string", "quantity": "number", "cartons": "number"}] }`,
  rules: `- Extract ALL packing details: folding method, polybag size/type, tissue paper, inner pack.
- Extract carton specs: dimensions, weight limit, max pieces, assortment ratio.
- Extract carton mark content and layout description.
- Extract barcode placement and type (UPC, EAN, etc.).
- Extract shipment lot details with destination, quantities, number of cartons.
- Describe folding instruction diagrams if visible.`
};
