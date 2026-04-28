export default {
  schema: `{ "placement": "string", "technique": "string", "dimensions": { "width": "string", "height": "string" }, "colors": [{ "colorCode": "string", "colorName": "string", "threadType": "string" }], "stitchCount": "string", "backing": "string", "notes": ["string"] }`,
  rules: `- Extract all details related to embroidery specifications and artwork.
- Identify the placement/position of the embroidery on the garment.
- Note the specific embroidery technique (e.g., flat, 3D puff, applique).
- Capture dimensions (width and height).
- List all thread colors used, including codes, names, and thread types if specified.
- Capture the total stitch count and any required backing material.
- Note any specific instructions, warnings, or general notes regarding the embroidery.`
};
