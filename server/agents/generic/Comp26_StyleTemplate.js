export default {
  schema: `{ "templateName": "string", "styleReference": "string", "basePattern": "string", "designElements": ["string"], "notes": ["string"] }`,
  rules: `- Extract information related to the overall style template or base design block.
- Identify the template name, style reference, or base pattern number if mentioned.
- List any specific design elements or blocks that make up this style template.
- Capture any general notes, warnings, or instructions associated with the template.`
};
