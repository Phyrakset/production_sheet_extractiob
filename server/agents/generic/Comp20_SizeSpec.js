export default {
  schema: `{ "styleNumber": "string", "season": "string", "sampleSize": "string", "sizeRange": ["string"], "unit": "string", "specTable": [{"code": "string", "description": "string", "tolerance": "string", "sizes": {"sizeLabel": "value"}}], "fitType": "string", "fabricShrinkage": "string", "notes": ["string"] }`,
  rules: `- Extract the full size specification table including all measurement points (code, description) and values for each size column.
- Capture sample/base size and the full size range (e.g., XS, S, M, L, XL, XXL).
- Extract tolerance values (+ / -) for each measurement point if available.
- Record the unit of measurement (cm, inches).
- Extract fit type (e.g., Regular, Slim, Relaxed) if specified.
- Extract fabric shrinkage allowance if present.
- Capture any footnotes or special notes related to sizing.`
};
