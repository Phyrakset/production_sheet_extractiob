export const Comp03_TechSketch_GPAF6153_Schema = {
  type: "object",
  properties: {
    header: {
      type: "object",
      properties: {
        poDescription: { type: "string", description: "e.g., '122260171 Essential OS PO 2.0 NO BACK YOKE (FA26 BULK FWD)'" },
        documentType: { type: "string", description: "e.g., 'Main Sketch'" },
        date: { type: "string", description: "e.g., 'Draft-Sample 1/28/2026, 2:50 PM'" }
      }
    },
    labeledImagesText: {
      type: "array",
      items: { type: "string" },
      description: "Any blue or black text specifically under the 'Labeled Images' header at the top left and top right."
    },
    generalInstructions: {
      type: "array",
      items: { type: "string" },
      description: "The grey or black text inside the top of the main drawing box (e.g. 'PLEASE SEE STANDARDS MANUAL...')."
    },
    pointerNotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          color: { type: "string", description: "Infer the color of the text (e.g. 'blue', 'red', 'black')" },
          text: { type: "string", description: "The full text block of the pointer note" }
        }
      },
      description: "All the floating text notes pointing to different parts of the garment."
    },
    footer: {
      type: "object",
      properties: {
        description: { type: "string", description: "e.g., 'Image Data Sheet: Main Sketch'" },
        modifiedDate: { type: "string", description: "e.g., '12/17/2025, 10:06 AM'" },
        modifiedBy: { type: "string", description: "e.g., 'Courtney Schmitt'" },
        pageNumber: { type: "string", description: "e.g., 'Page 9 of 16'" }
      }
    }
  },
  required: ["header", "pointerNotes"]
};

export const extractionPrompt = `
You are extracting the "Tech Sketch" (Comp 03) page for style GPAF6153.
This page contains labeled drawings of a garment. 
DO NOT try to extract the images themselves. Only extract the text.

CRITICAL RULES:
- The top header has a grey bar with PO Description, Document Type, and Date.
- Below that is a section with 'Labeled Images' and various blue text notes. Extract all of this text into 'labeledImagesText'.
- Inside the main box, there is a general instruction block (e.g. "*ALL SEAMS UNLESS OTHERWISE NOTED..."). Extract this into 'generalInstructions'.
- Spread around the garment are pointer notes in different colors (red, blue, black).
  - Extract EACH text block as an object in 'pointerNotes'.
  - Attempt to correctly identify the 'color' of the text (e.g., "blue", "red", "black"). This is important for the renderer!
- The bottom left has 'Description:', 'Modified:', 'Modified By:'. The bottom right has the Page Number. Extract these into 'footer'.
- Do not miss any text. Capture Chinese and English text exactly as written.
`;

export default {
  schema: Comp03_TechSketch_GPAF6153_Schema,
  rules: extractionPrompt,
};
