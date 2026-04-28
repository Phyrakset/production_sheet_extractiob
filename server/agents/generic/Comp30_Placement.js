export default {
  schema: `{ "placementItems": [{ "itemName": "string", "position": "string", "dimensions": "string", "distanceFromSeam": "string", "method": "string", "notes": "string" }], "generalNotes": ["string"] }`,
  rules: `- Extract details regarding the physical placement of elements on the garment (e.g., logos, labels, prints, embroideries, trims).
- List each placement detail in the placementItems array.
- For each item, capture its name, exact position/location, specified dimensions, and any required distance from seams or edges.
- Note the method of attachment or application (e.g., heat transfer, sewn, embroidered).
- Capture any item-specific notes, as well as general notes or instructions for placements.`
};
