# Production Sheet Extractor - System Documentation and Cycle Flow

Last reviewed from codebase: 2026-04-25

This document describes the full Production Sheet Extractor system: frontend components, backend services, the 19 standardized production-sheet components, known reference style formats, extraction/translation/rendering logic, and the complete processing cycle.

## 1. System Purpose

The system converts unstructured garment production sheets into standardized JSON fragments and printable production-sheet output.

It supports two operating modes:

- Smart upload: upload one or more full production-sheet PDFs/images; the backend splits pages, classifies each page into one of 19 component types, groups matching pages, extracts structured JSON, and streams progress back to the UI.
- Manual upload: upload or paste a PDF/image directly into a known component slot; the backend extracts that one slot using the matching component schema.

The system also supports glossary-assisted translation into Khmer, Chinese, and English, plus a printable component-aware master document.

## 2. Runtime Stack

| Layer | Main files | Responsibility |
|---|---|---|
| Frontend | `src/main.jsx`, `src/App.jsx`, `src/MasterDocument.jsx`, `src/styles.css` | React UI, upload workflows, extracted JSON display, translation controls, glossary panel, compiled printable document |
| Backend | `server/index.js` | Express API, Gemini extraction/merge/translation calls, MongoDB glossary APIs, smart auto-extract SSE pipeline |
| Classification helpers | `server/classifyAgent.js` | 19-component signatures, classification prompt, PDF split/merge helpers |
| Build/dev config | `package.json`, `vite.config.js`, `index.html` | Vite React app, API proxy to backend, dev scripts |
| Knowledge base | `test_data_and_knowledge_base/` | Reference production-sheet PDFs, separated component PDFs, page mapping docs |
| Utility scripts | `split_pdfs.js`, `check_glossary.js`, `test_translate.js` | Split reference PDFs, inspect glossary terms, smoke-test extraction/translation |

Required environment variables:

- `GEMINI_API_KEY`: required for extraction, classification, merge, and AI translation.
- `GEMINI_VISION_MODEL`: optional, defaults to `gemini-2.5-flash`.
- `GEMINI_TEXT_MODEL`: optional, defaults to `gemini-2.5-flash`.
- `MONGODB_URI`: optional for glossary APIs and glossary-assisted translation; glossary endpoints return unavailable if MongoDB is not connected.

Do not commit real secret values from `.env`.

## 3. Frontend Components

### `src/main.jsx`

Application entry point. It mounts `App` into `#root` and imports global CSS.

### `src/App.jsx`

Main application shell and state owner.

Primary responsibilities:

- Defines the 19 document slots used by both manual and smart workflows.
- Groups slots into five phases: Order/Identity, Design/Construction, Materials/BOM, Measurement/Fit, Quality/Shipping.
- Manages manual upload, drag/drop, double-click file selection, and clipboard image paste.
- Manages smart upload by calling `/api/auto-extract` and parsing streamed SSE `data:` payloads.
- Displays extraction results as normalized JSON via `buildDisplayJson`.
- Calls `/api/translate` for active-slot translation and caches translations by `slotId::language`.
- Fetches glossary stats and paginated merged glossary rows from `/api/glossary/stats` and `/api/glossary/parallel`.
- Compiles extracted slots into the in-panel `MasterDocument` renderer.

Important frontend state groups:

- Slot state: `slotFiles`, `slotResults`, `activeSlotId`, `draggingSlotId`, `loadingSlotId`.
- Smart upload state: `uploadMode`, `autoExtractPhase`, `autoExtractProgress`, `classifiedPages`, `extractionProgress`, `autoTotalPages`.
- Translation state: `activeLang`, `translatedResults`, `isTranslating`, `translateStats`.
- Glossary state: `glossaryTerms`, `glossaryStats`, `glossarySearch`, `glossaryStatus`, pagination fields.

Important functions:

- `runAutoExtract(files)`: uploads full PDFs/images to `/api/auto-extract`, reads streamed response chunks, and forwards JSON payloads to `handleSSEEvent`.
- `handleSSEEvent(data)`: updates UI progress and final slot results based on event data shape.
- `handleSelect(incomingFiles, slotId)`: accepts one file for a manual component slot and triggers extraction.
- `runExtraction(slotId, file)`: calls `/api/extract` with `slotIds` and `slotTitles`.
- `handleTranslate(lang)`: translates active slot JSON through `/api/translate`.
- `compileMasterTemplate()`: opens `MasterDocument` using current `slotResults`.
- `compileTranslated()`: overlays cached translations onto slot extraction data and opens `MasterDocument`.
- `buildDisplayJson(pageResult)`: normalizes backend extraction output for display/translation.

### `src/MasterDocument.jsx`

Printable output renderer. It receives `slotResults` and renders the extracted component fragments in slot order.

Renderer map:

| Slot title | Renderer | Output style |
|---|---|---|
| Cover Page | `KeyNotesSection` | Header sketch/identity area plus critical notes table |
| Order Details | `OrderDetailsSection` | Two-column order info and size/color tables |
| Construction | `ConstructionSection` | Sewing operation table and list blocks |
| Mfg Standards | `MfgStandardsSection` | Standards and instruction lists |
| POMs | `POMsSection` | Dynamic measurement table based on size/value keys |
| BOM Fabrics | `BOMSection` | Material table |
| BOM Trims | `BOMSection` | Trim/material table |
| Packaging | `PackagingSection` | Packing method fields and instruction lists |
| Other component titles | `GenericSection` | Summary, notes table, items table, and remaining key/value fields |

`MasterDocument` also includes a legacy renderer for old `/api/merge` master template data. Current frontend compile buttons use the component-aware slot renderer directly rather than calling `/api/merge`.

Extraction may store source trace and layout metadata internally, but the compiled factory PDF intentionally hides that metadata so the printed output stays compact and close to the source page format.

### `src/styles.css`

Global UI styling and print styling.

Major style systems:

- Dark application shell with radial gradient atmosphere and glass-like panels.
- Three-panel workspace: upload/components, extracted JSON/master view, glossary.
- Component slot cards with per-slot accent classes.
- Smart upload progress dashboard with split/classify/extract/complete states.
- JSON display and translation status styling.
- Glossary search/filter/table/pagination styling.
- Printable master document styles and `@media print` rules.
- Component-specific print styles for tables, warning rows, headers, and sections.

## 4. Backend API

All backend logic is in `server/index.js`.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Returns service health, whether Gemini key exists, and active model |
| `/api/samples` | GET | Attempts to list `test_data` sample files |
| `/api/extract` | POST multipart | Extracts manually uploaded files using the provided slot title |
| `/api/merge` | POST JSON | Legacy AI merge from slot fragments into a 9-row master template |
| `/api/translate` | POST JSON | Translates extracted JSON using verified glossary terms first, Gemini text model second |
| `/api/glossary` | GET | Paginated glossary term search by source/target/lang/status |
| `/api/glossary/parallel` | GET | Merged parallel glossary table with `en`, `zh`, `km` columns |
| `/api/glossary/stats` | GET | Glossary totals, language-pair counts, and verification-status counts |
| `/api/auto-extract` | POST multipart/SSE | Full smart upload pipeline: split, classify, group, extract |

Upload limits:

- In-memory `multer` storage.
- Max file size: 50 MB.
- Max files per request: 24.

## 5. Backend Extraction Contracts

### Common extraction envelope

Every component extraction is instructed to return:

```json
{
  "pageType": "slot title",
  "brand": "string or null",
  "pageRef": "string or null",
  "styleId": "string or null",
  "summary": "short summary",
  "data": {},
  "otherInformation": [],
  "warnings": []
}
```

The `data` shape changes by component and is defined in `getSlotConfig(slotTitle)`.

### Manual extraction

Manual extraction flow:

1. Frontend sends one or more uploaded files to `/api/extract`.
2. Request includes parallel `slotIds` and `slotTitles`.
3. Backend calls `extractDocumentFromGemini(file, slotTitle)` for each file.
4. `buildSlotInstruction(slotTitle, sourceContext)` builds the component-agent prompt, source trace, layout-memory requirements, schema, and rules.
5. Gemini Vision returns JSON.
6. Backend normalizes the extraction with `normalizeExtractionResult()` so every component has `componentAgent`, `sourceTrace`, `layoutMemory`, `contentOrder`, `qualityChecks`, and `data`.
7. Backend returns `pages[]`, where each result includes `slotId`, `slotTitle`, file metadata, and `extraction`.

For manually uploaded separated component PDFs named like `...Pages_3_10_11.pdf`, the backend infers those original page numbers and stores them in `sourceTrace.sourcePages`.

### Smart extraction

Smart extraction flow:

1. Frontend uploads full PDFs/images to `/api/auto-extract`.
2. Backend starts SSE response.
3. PDF files are split into one-page PDFs with `splitPdfPages`.
4. Image files are treated as single pages.
5. Each page is classified by `classifyPage`.
6. Pages are grouped by `componentId`.
7. Each group is extracted with `extractMultiPage`, sending all pages for that component together.
8. Backend streams progress events and sends final `slots` map.
9. Frontend stores final `slots` in `slotResults`.

Smart pipeline phases:

| Phase | Backend event data | Frontend state |
|---|---|---|
| Splitting | `{ phase: "splitting" }`, then file/page counts | `autoExtractPhase`, `autoExtractProgress` |
| Classifying | `{ phase: "classifying", totalPages }`, then component predictions | `classifiedPages`, `autoTotalPages` |
| Extracting | `{ phase: "extracting", components }`, then extraction success/fail | `extractionProgress` |
| Complete | `{ slots }` | `slotResults`, synthetic `slotFiles`, `autoExtractPhase = "complete"` |

## 6. Classification Agent

`server/classifyAgent.js` defines the production-sheet ontology.

Exports:

- `COMPONENT_SIGNATURES`: 19 component definitions with ID, slot, English title, Chinese name, keywords, and description.
- `buildClassificationPrompt()`: builds a Gemini Vision prompt listing all 19 component descriptions and classification rules.
- `classifyPage(pageBuffer, mimeType, apiKey, model)`: sends one page to Gemini Vision and parses `{ componentId, componentName, confidence, reasoning }`.
- `splitPdfPages(pdfBuffer)`: uses `pdf-lib` to split a PDF into one-page PDF buffers.
- `mergePdfPages(pageBuffers)`: combines single-page PDF buffers into one PDF. Imported by `server/index.js` but not currently used by the active API flow.

## 7. The 19 Standard Components

These 19 components are the stable format vocabulary for all known production-sheet styles.

| # | Slot | Phase | Component | Main use | Extraction `data` format |
|---|---|---|---|---|---|
| 1 | `page-01` | A | Cover Page / Key Notes | Style identity, order summary, sketch summary, high-priority warnings | Header fields, notes, critical warnings, color-size matrix, sample requirements, approval stamp |
| 2 | `page-02` | A | Order Details | PO/order data, delivery, lots, quantities, destination/process summary | Customer/factory/PO/style, delivery dates, shipment lots, color-size breakdown, processes, fabric/wash info |
| 3 | `page-03` | B | Tech Sketch | Front/back/detail garment drawings and callouts | Page label, garment, views, callouts, measurement points, construction notes |
| 4 | `page-04` | B | Construction | Sewing operation process and workmanship rules | Operations, seams, wash instructions, label placements, production instructions, attention points |
| 5 | `page-05` | B | Mfg Standards | Cutting, fusing, sewing, pressing, finishing, labeling standards | Cutting/fusing/needle/stitching/pressing/finishing/labeling rows, minimum standards, diagrams |
| 6 | `page-06` | B | Colorways | Color plans, Pantone/color code, wash/color approval | Colorways, color-match photos, BOM per colorway |
| 7 | `page-07` | C | BOM Fabrics | Shell/lining/rib/interlining fabric BOM | Materials with category, part, composition, weight, width, color, supplier, quantity, price, comments |
| 8 | `page-08` | C | BOM Trims | Zippers, buttons, elastic, thread, packaging materials | Trims, threads, packing materials |
| 9 | `page-09` | C | Labels | Brand/care/size/content labels, hangtags, heat transfers | Labels, hangtags, heat transfers with placement/material/supplier/quantity/content |
| 10 | `page-10` | C | Artwork | Print, embroidery, heat-transfer placement and specs | Artwork code/type/placement/position/dimensions/colors/stitch count, renders, approval, notes |
| 11 | `page-11` | D | POMs | Finished-garment size specification table | Measurement set, UOM, sample size, tolerances, measurement points with size columns |
| 12 | `page-12` | D | Grading | Size grading rules and increments | Approval status/date, base size, size range, per-dimension increments |
| 13 | `page-13` | D | HTM Guide | How-to-measure diagrams and rules | Garment type, measurement instructions, start/end points, diagram descriptions, criteria |
| 14 | `page-14` | D | Measure QA | Actual-vs-target QC measurement checks | Sample size/type/date, tables with target/actual/difference/tolerance/pass, comments |
| 15 | `page-15` | E | PP Comments | Pre-production sample feedback and bulk correction notes | Sample type/date/status, comments, measurement comparisons, bulk notes, defect photos |
| 16 | `page-16` | E | Fit Photos | Photos of garment fit, visual correctness, mannequin/model notes | Photo descriptions by view/area, garment-on-form flag, model/sample size, fit comment |
| 17 | `page-17` | E | QA Standards | AQL, defect classifications, testing, finishing checks | AQL, inspection level, critical/major/minor defects, testing requirements, checklist |
| 18 | `page-18` | E | Packaging | Folding, polybag, carton, barcode, packing/shipping details | Folding, diagram, polybag, tissue, inner pack, carton, carton mark, barcodes, instructions, shipment details |
| 19 | `page-19` | E | Revision History | Document/style change log | Revisions with date/version/section/description/changed by/approved by, carryover note, total revisions |

Phase labels used by the UI:

- Phase A: Order and Identity.
- Phase B: Design and Construction.
- Phase C: Materials and BOM.
- Phase D: Measurement and Fit.
- Phase E: Quality and Shipping.

## 8. Component Render Formats

The extraction schema covers all 19 components, but the printable renderer has specialized layouts for the highest-value sections and a generic fallback for the rest.

| Component | Printable renderer status | Notes |
|---|---|---|
| Cover Page | Specialized | Critical notes table and identity header |
| Order Details | Specialized | Order info and breakdown grids |
| Construction | Specialized | Operation table plus instruction lists |
| Mfg Standards | Specialized | Standards/list layout |
| BOM Fabrics | Specialized shared BOM table | Reads `materials`, `fabrics`, `trims`, or `items` |
| BOM Trims | Specialized shared BOM table | Same renderer as BOM Fabrics with trims title |
| POMs | Specialized | Dynamic size-column table from measurement object keys |
| Packaging | Specialized | Packing fields plus instruction/note lists |
| Tech Sketch, Colorways, Labels, Artwork, Grading, HTM Guide, Measure QA, PP Comments, Fit Photos, QA Standards, Revision History | Generic | Renders summary, notes, items/details, and remaining key/value data |

Important implementation detail: adding a more polished print format for any generic component means adding a renderer function to `src/MasterDocument.jsx` and registering it in `COMPONENT_MAP`.

## 9. Known Reference Style Formats

The knowledge base contains six reference documents. These are split into separated component PDFs using `split_pdfs.js`.

| Code | Style/order | Source document | Pages | Notes |
|---|---|---|---|---|
| A | `W02-490014` / `GPRT00077C` | `(result) GPRT00077C production sheet` | 19 | Has cover, sketch, construction, mfg standards, color/artwork, POM/grading/HTM, PP comments, photos, packaging |
| B | `122260171` / `GPAF6153` | `GPAF6153 -- 122260171 bulk production sheet - R1` | 28 | Broadest style after C; includes labels, QA, revision history |
| C | `125942` / `GPAR12172GD-2` | `GPAR12172GD-2 bulk production sheet` | 41 | Most complete reference; includes long mfg standards, POM/grading/measure QA, revision history |
| D | `PTBC0047` | `PTBC0047 production sheet` | 15 | Strong colorways/BOM/packaging coverage |
| E | `STCO4143` / `PTCOC270_270A` | `PTCOC270 270A two-style bulk production sheet` | 11 | Compact style: cover, order, sketch, construction, POM, packaging |
| F | `PTCOM227` | `PTCOM227 bulk production sheet` | 7 | Minimal style: cover, order, construction, fabrics, POM, HTM, packaging |

Known page availability by component:

| # | Component | A | B | C | D | E | F | Coverage |
|---|---|---|---|---|---|---|---|---|
| 1 | Key Notes | 1 | 1 | 1 | 1 | 1 | 1 | 6/6 |
| 2 | Order Details | 9 | 2 | 5 | 2 | 2-3 | 2 | 6/6 |
| 3 | Tech Sketch | 2 | 18 | 16 | - | 11 | - | 4/6 |
| 4 | Construction | 8,10 | 5-6 | 6 | - | 5-7 | 4 | 5/6 |
| 5 | Mfg Standards | 11-12 | 8 | 11-18 | - | - | - | 3/6 |
| 6 | Colorways | 3 | 9 | 21-23 | 5-10 | - | - | 4/6 |
| 7 | BOM Fabrics | - | 4,19-20 | 18-19 | 5-8 | - | 3 | 4/6 |
| 8 | BOM Trims | - | 4,22 | 19-20 | 9 | - | - | 3/6 |
| 9 | Labels | - | 6,18,21 | 13-14,20 | - | - | - | 2/6 |
| 10 | Artwork | 3 | 9 | 21,24 | 10 | - | - | 4/6 |
| 11 | POMs | 16-17 | 3,10-13 | 2-4,24-35 | 3-4 | 4 | 5 | 6/6 |
| 12 | Grading | 7 | - | 28-35 | - | - | - | 2/6 |
| 13 | HTM Guide | 18 | 25-28 | 36-39 | 15 | - | 7 | 5/6 |
| 14 | Measure QA | - | 10-13 | 28-35 | - | - | - | 2/6 |
| 15 | PP Comments | 4-6 | 12,16-17 | - | - | - | - | 2/6 |
| 16 | Fit Photos | 19 | 14-15 | 10 | - | - | - | 3/6 |
| 17 | QA Standards | - | 8 | 11-14 | - | - | - | 2/6 |
| 18 | Packaging | 13-14 | 7,23-24 | 6-10 | 11-14 | 8-10 | 6 | 6/6 |
| 19 | Revision History | - | 17 | 41 | - | - | - | 2/6 |

Rare/sparse components:

- Mfg Standards appears only in A, B, and C.
- Labels appears only in B and C.
- Grading appears only in A and C.
- Measure QA appears only in B and C.
- QA Standards appears only in B and C.
- Revision History appears only in B and C.

## 10. Knowledge Base and Split PDF Utility

`test_data_and_knowledge_base/` stores original PDFs and split component PDFs.

Naming convention:

```text
Comp_[Number]_[Chinese_Name]_[English_Name]_Doc_[Style_Number]_Pages_[Page_Numbers].pdf
```

Example:

```text
Comp_11_成品尺寸_POMs_Doc_GPAF6153_Pages_3_10_11_12_13.pdf
```

`split_pdfs.js` contains the hard-coded page mapping for documents A-F and regenerates `test_data_and_knowledge_base/separated_components/`.

Important behavior:

- It deletes and recreates `separated_components` before writing outputs.
- It creates one folder per style.
- It writes component PDFs only when the mapping says that component exists in that source document.

## 11. Translation and Glossary Flow

Translation endpoint: `/api/translate`.

Request shape:

```json
{
  "jsonData": {},
  "targetLang": "km | zh | en",
  "slotTitle": "Cover Page"
}
```

Processing logic:

1. Recursively collect all strings from `jsonData`.
2. Query MongoDB collection `glossaryterms` for verified glossary terms.
3. Build exact and partial-match glossary replacements.
4. Identify strings not translated by glossary.
5. Batch remaining strings, include path/context, and send them to the Gemini text model.
6. Merge AI translations with glossary translations.
7. Apply translations recursively back into the JSON.
8. Return translated JSON plus stats.

Glossary priority:

- Verified glossary matches override AI translation.
- Exact matches are checked first.
- Partial matches are applied longest-first.

Response shape:

```json
{
  "translatedAt": "ISO timestamp",
  "targetLang": "km",
  "glossaryMatches": 0,
  "aiTranslations": 0,
  "totalTexts": 0,
  "data": {}
}
```

Frontend behavior:

- Translations are cached as `slotId::targetLang`.
- Clicking the active language again returns to original.
- Compiling while a language is active uses translated slot data where available and original slot data where not available.

## 12. Compile and Print Flow

Current primary compile flow:

1. User has one or more `slotResults`.
2. User clicks `Compile` or translated compile button.
3. Frontend sets `masterData = { compiled: true }`.
4. `MasterDocument` receives `slotResults`.
5. Slots are sorted numerically by `page-XX`.
6. Each slot is rendered by a specific renderer from `COMPONENT_MAP` or by `GenericSection`.
7. User can print/save PDF using browser print.

Legacy merge flow:

- `/api/merge` exists and sends all slot results to Gemini to synthesize a 9-row master template.
- `LegacyMasterContent` can render this old structure.
- The current frontend compile path does not call `/api/merge`.

## 13. End-to-End Cycle Flow

### Smart Upload Cycle

```text
User uploads full style PDFs/images
  -> App.runAutoExtract()
  -> POST /api/auto-extract
  -> multer stores files in memory
  -> splitPdfPages() splits PDFs into single-page buffers
  -> classifyPage() predicts componentId for each page
  -> backend groups pages by componentId
  -> extractMultiPage() extracts each component group with slot-specific schema
  -> SSE streams split/classified/extracted/complete updates
  -> frontend updates progress UI
  -> final slots map becomes slotResults
  -> user reviews JSON
  -> optional translation
  -> compile to MasterDocument
  -> print/save PDF
```

### Manual Upload Cycle

```text
User chooses target slot
  -> drops/double-clicks/selects/pastes PDF or image
  -> App.handleSelect()
  -> POST /api/extract with slotId and slotTitle
  -> extractDocumentFromGemini() builds slot-specific prompt
  -> Gemini Vision extracts JSON
  -> frontend stores slotResults[slotId]
  -> user reviews JSON
  -> optional translation
  -> compile to MasterDocument
```

### Glossary Cycle

```text
App mount
  -> GET /api/glossary/stats
  -> GET /api/glossary/parallel
  -> user searches/filters/pages glossary
  -> backend queries MongoDB glossaryterms
  -> frontend renders parallel en/zh/km glossary table
```

## 14. Important Data Shapes

### `slotResults`

Smart upload returns and frontend stores:

```json
{
  "page-01": {
    "slotId": "page-01",
    "slotTitle": "Cover Page",
    "fileName": "source.pdf",
    "sourcePages": ["source.pdf p1"],
    "pageCount": 1,
    "extraction": {}
  }
}
```

Manual extraction stores:

```json
{
  "page-01": {
    "slotId": "page-01",
    "slotTitle": "Cover Page",
    "fileName": "page.pdf",
    "mimeType": "application/pdf",
    "size": 12345,
    "extraction": {}
  }
}
```

### Display JSON

`buildDisplayJson()` converts a page result into:

```json
{
  "slotTitle": "Cover Page",
  "fileName": "page.pdf",
  "pageType": "Cover Page",
  "brand": null,
  "pageRef": null,
  "styleId": null,
  "summary": null,
  "data": {},
  "otherInformation": [],
  "warnings": []
}
```

## 15. Known Caveats and Maintenance Notes

- `.env` currently contains real credentials locally; do not include or commit them.
- `check_glossary.js` contains a hard-coded MongoDB URI and should be sanitized before sharing.
- `split_pdfs.js` is destructive for `test_data_and_knowledge_base/separated_components`; run it only when regenerating reference components is intended.
- Smart upload frontend parses SSE by reading `data:` lines and inferring event type from payload shape. It does not rely on the actual `event:` name.
- The UI defines `phaseTitles`, but the visible slot grouping currently uses `phaseLabels`.
- `glossaryLangPair` state exists but `/api/glossary/parallel` ignores a language-pair filter; the current UI mainly uses search/status/pagination.
- `/api/samples` reads a `test_data` directory, while this repo's visible reference data is under `test_data_and_knowledge_base`.
- `/api/merge` exists as legacy functionality, but the current compile button uses direct component-aware rendering instead.
- Eight of the 19 components have custom printable renderers. The remaining components are explicitly mapped to `GenericSection`, which now renders original content order and all remaining structured fields.

## 16. Extension Guide

To add a new or improved component format:

1. Update `documentSlots` in `src/App.jsx` if the slot list changes.
2. Update `COMPONENT_SIGNATURES` in `server/classifyAgent.js` for classification.
3. Update `getSlotConfig()` in `server/index.js` for extraction schema and page-specific rules.
4. Add or improve a renderer in `src/MasterDocument.jsx`.
5. Register the renderer in `COMPONENT_MAP`.
6. Add CSS in `src/styles.css` if the print layout needs custom styling.
7. Add reference page mappings in `split_pdfs.js` if using the knowledge base for validation.

To add another target language:

1. Add UI labels/flag code in `src/App.jsx`.
2. Ensure `/api/translate` maps the language code to a target language name.
3. Ensure glossary data uses consistent `sourceLang` and `targetLang` codes.
4. Test exact glossary, partial glossary, and AI fallback translation.
