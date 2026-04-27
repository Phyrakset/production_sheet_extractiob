/**
 * GPAR12172GD-2-specific extraction agent for Comp03_TechSketch
 * ──────────────────────────────────────────────────
 */
export const Comp03_TechSketch_GPAR12172GD_2_Schema = {
  type: "object",
  properties: {
    header: {
      type: "object",
      properties: {
        title: { type: "string", description: "The main top title e.g. 'FFS 99-03-44504-SP26(DW1853) CO/NS Tech Pack YORKWELL-YORKMARS Jul-23-25'" },
        systemName: { type: "string", description: "The system name, typically 'Centric 8'" },
        sub1: { type: "string", description: "The left subheader under the system name e.g. 'FFS 99-03-44504-SU26(DW1830)___128870'" },
        sub2: { type: "string", description: "The right subheader e.g. 'FFS 99-03-44504-SU26(DW1830) CO/NS Tech Pack YORKWELL-YORKMARS Jul-23-25'" },
        date: { type: "string", description: "The extraction date e.g. 'July 23, 2025 at 10:26:49 AM Pacific Daylight Time'" },
        sectionTitle: { type: "string", description: "The section header below the grey bar, usually 'Properties'" }
      }
    },
    pointerNotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string", description: "The full text block of the pointer note. Keep multiline blocks together." }
        }
      },
      description: "All the floating text notes pointing to different parts of the garment."
    },
    footer: {
      type: "object",
      properties: {
        pageNumber: { type: "string", description: "e.g., 'Page 1 of 28'" }
      }
    }
  },
  required: ["header", "pointerNotes"]
};

export const extractionPrompt = `
You are extracting the "Tech Sketch" (Comp 03) page for style GPAR12172GD-2.
This page contains labeled drawings of a garment.
DO NOT try to extract the images themselves. Only extract the text.

CRITICAL RULES:
- The top header has a grey bar. Extract 'systemName' (like "Centric 8"), 'sub1', 'sub2', and 'date' accurately.
- Below the grey bar is 'sectionTitle' (like "Properties").
- Spread around the garment are pointer notes.
  - Extract EACH text block as an object in 'pointerNotes'. Keep multiline sentences as a single string.
- The bottom right has the Page Number. Extract this into 'footer'.
- Do not miss any text. Capture Chinese and English text exactly as written.
`;

export default {
  schema: Comp03_TechSketch_GPAR12172GD_2_Schema,
  rules: extractionPrompt,
};
