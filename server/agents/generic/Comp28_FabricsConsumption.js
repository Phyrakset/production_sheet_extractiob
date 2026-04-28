export default {
  schema: `{ "consumptions": [{ "fabricReference": "string", "fabricDescription": "string", "color": "string", "cuttableWidth": "string", "consumptionPerGarment": "string", "wastagePercentage": "string", "netYield": "string" }], "totalGarments": "string", "notes": ["string"] }`,
  rules: `- Extract fabric consumption, yield, and marker details.
- List each fabric's consumption details in the consumptions array.
- Capture fabric reference/code, description, and color.
- Note the cuttable width, consumption per garment (allowance/yield), wastage percentage, and net yield if provided.
- Identify the total order/garment quantity referenced in the consumption calculation if present.
- Capture any general notes regarding markers, grain lines, shrinkage, or cutting.`
};
