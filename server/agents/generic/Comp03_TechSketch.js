export default {
  schema: `{ "pageLabel": "string", "garment": "string", "views": [{"view": "front|back|side|detail", "description": "string"}], "callouts": [{"text": "string", "view": "front|back|both|unknown", "kind": "construction|measurement|note", "location": "string"}], "measurementPoints": [{"code": "string", "name": "string", "position": "string"}], "constructionNotes": ["string"] }`,
  rules: `- Extract ALL text annotations, callouts, and labels on the technical drawing.
- For each callout note which view (front/back) and where on garment it points.
- Extract measurement point codes and names if shown on the sketch.
- Extract any construction notes written near the drawings.`
};
