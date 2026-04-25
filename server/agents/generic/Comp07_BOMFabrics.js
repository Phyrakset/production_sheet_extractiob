export default {
  schema: `{ "materials": [{"category": "string", "part": "string", "material": "string", "composition": "string", "weight": "string", "width": "string", "color": "string", "colorCode": "string", "supplier": "string", "supplierCode": "string", "quantity": "string", "unitPrice": "string", "comments": "string"}] }`,
  rules: `- Extract EVERY row from fabric BOM tables: category (shell/lining/rib/interlining), part, material name, composition, weight, width, color, supplier, qty.
- Include supplier codes and unit prices if visible.
- Extract from BOM/Multi-level Placements/Style BOM Template/用料清單 sections.`
};
