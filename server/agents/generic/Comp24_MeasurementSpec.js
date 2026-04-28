export default {
  schema: `{ "styleNumber": "string", "season": "string", "title": "string", "specifications": [{"code": "string", "description": "string", "tolerance": "string", "measurement": "string", "notes": "string"}], "sampleSize": "string", "unit": "string", "remarks": ["string"] }`,
  rules: `- Extract the measurement specification details.
- Identify the style number, season, and title.
- Capture the sample size and unit of measurement (e.g., cm, inch).
- Extract all specifications including code, description, tolerance, measurement value, and any notes per item.
- Capture any general remarks or footnotes.`
};
