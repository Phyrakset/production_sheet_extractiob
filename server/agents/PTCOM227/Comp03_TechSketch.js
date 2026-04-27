/**
 * PTCOM227-specific extraction agent for Comp03_TechSketch
 * ──────────────────────────────────────────────────
 */
export const Comp03_TechSketch_PTCOM227_Schema = {
  type: "object",
  properties: {
    header: {
      type: "object",
      properties: {
        title: { type: "string", description: "e.g. '3A-571度尺图 / PTCOM227'" }
      }
    },
    pointerNotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string", description: "The text of the pointer note (e.g., '腰阔-松度', '内长')." },
          textColor: { type: "string", description: "The color of the text (e.g. 'blue')." },
          pointsTo: { type: "string", description: "What part of the garment the note is pointing to (e.g. 'Front Waist', 'Front Inseam', 'Side Seam', 'Back Rise')." }
        }
      },
      description: "Blue floating text around the garments pointing to specific parts with red lines."
    }
  },
  required: ["header", "pointerNotes"]
};

export const extractionPrompt = `
You are extracting the "Tech Sketch" (Comp 03) page for style PTCOM227.
This page features 3 views of a leggings garment (Front, Side, Back) with blue text callouts and red lines pointing to different measurement areas.
DO NOT extract the images, only the text.

CRITICAL RULES:
- The top header has a large title. Extract into 'header.title'.
- Around the central garments, there are floating blue texts pointing to different parts.
  - Extract each text block into 'pointerNotes'.
  - Note the 'textColor' (e.g. blue).
  - Note 'pointsTo' by observing where the red line points (e.g. "Front Waist", "Front High Hip", "Front Low Hip", "Front Rise", "Front Thigh", "Front Inseam", "Front Leg Opening", "Waistband Height", "Front Knee", "Side Seam Length", "Back Rise", etc).
`;

export default {
  schema: Comp03_TechSketch_PTCOM227_Schema,
  rules: extractionPrompt,
};
