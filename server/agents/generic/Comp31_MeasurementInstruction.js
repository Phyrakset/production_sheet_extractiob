export default {
  schema: `{ "instructions": [{ "topic": "string", "details": "string" }], "generalTolerances": "string", "notes": ["string"] }`,
  rules: `- Extract textual instructions, guidelines, or rules regarding how to take measurements.
- Capture specific topics or areas of measurement and the detailed instructions associated with them.
- Identify any general tolerance rules mentioned (e.g., +/- 1/2 inch for length, +/- 1/4 inch for width).
- Note any general comments, warnings, or best practices for the QA or measurement team.`
};
