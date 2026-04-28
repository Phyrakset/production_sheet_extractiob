export default {
  schema: `{ "styleNumber": "string", "season": "string", "processTitle": "string", "department": "string", "processSteps": [{"stepNo": "number", "operation": "string", "machineType": "string", "needleType": "string", "stitchType": "string", "SPI": "string", "seam": "string", "time": "string", "remarks": "string"}], "totalSAM": "string", "efficiency": "string", "operatorCount": "number", "criticalProcesses": ["string"], "notes": ["string"] }`,
  rules: `- Extract the full process sheet table with all step numbers, operations, machine types, needle types, stitch types, SPI, seam allowances, and time allocations.
- Capture the total SAM (Standard Allowed Minutes) if present.
- Extract efficiency target and operator count if available.
- Identify critical processes highlighted or marked specially.
- Record the department or section the process sheet belongs to (e.g., cutting, sewing, finishing).
- Capture any footnotes, remarks, or special instructions per step.
- Extract style number, season, and process title from the header.`
};
