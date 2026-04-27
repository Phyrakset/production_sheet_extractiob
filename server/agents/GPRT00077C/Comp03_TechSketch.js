/**
 * GPRT00077C-specific extraction agent for Comp03_TechSketch
 * ──────────────────────────────────────────────────
 */
export const Comp03_TechSketch_GPRT00077C_Schema = {
  type: "object",
  properties: {
    header: {
      type: "object",
      properties: {
        leftLabel: { type: "string", description: "e.g. '002 : Sketch TECHNICAL'" },
        middleLabel: { type: "string", description: "e.g. '001 : SPEC 1'" },
        rightLabel: { type: "string", description: "e.g. 'Page 3 of 9'" }
      }
    },
    coloredBoxes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string", description: "The full text block inside the box." },
          boxColor: { type: "string", description: "The background or border color of the box (e.g. 'green', 'cyan', 'red', 'none')" },
          boxBorder: { type: "string", description: "The border color of the box if any (e.g. 'red')" }
        }
      },
      description: "Any text block that has a colored background or colored border. Exclude loose text pointing to the garment."
    },
    pointerNotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string", description: "The text of the pointer note." },
          textColor: { type: "string", description: "The color of the text (e.g. 'red', 'blue', 'black')." },
          pointsTo: { type: "string", description: "What part of the garment the note is pointing to (e.g. 'Left Sleeve', 'Bottom Hem', 'Center Chest', 'Neck')." }
        }
      },
      description: "Text floating around the garment with lines or circles pointing to specific parts."
    }
  },
  required: ["header", "coloredBoxes", "pointerNotes"]
};

export const extractionPrompt = `
You are extracting the "Tech Sketch" (Comp 03) page for style GPRT00077C.
This page is highly complex, featuring dense colored boxes and many text callouts pointing to a T-shirt sketch.
DO NOT extract the images, only the text.

CRITICAL RULES:
- The top header has '002 : Sketch TECHNICAL' and page numbers. Extract into 'header'.
- There are large colored boxes (e.g., lime green background, cyan background, red borders) covering parts of the page.
  - Extract the contents of EACH box as an item in 'coloredBoxes'.
  - Note the 'boxColor' (background color) and 'boxBorder' (e.g. red).
- Around the central T-shirt garments, there are floating texts pointing to different parts.
  - Extract each text block into 'pointerNotes'.
  - Note the 'textColor' (e.g. blue, red, black).
  - Note 'pointsTo' (e.g. "left sleeve", "bottom hem").
- Keep multiline text as a single string using \\n.
`;

export default {
  schema: Comp03_TechSketch_GPRT00077C_Schema,
  rules: extractionPrompt,
};
