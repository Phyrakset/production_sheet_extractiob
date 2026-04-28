export default {
  schema: `{ "teamName": "string", "date": "string", "subject": "string", "notes": [{"category": "string", "content": "string", "priority": "high|medium|low", "assignee": "string"}], "actionItems": [{"item": "string", "responsible": "string", "deadline": "string", "status": "string"}], "attachments": [{"name": "string", "description": "string"}], "generalRemarks": ["string"] }`,
  rules: `- Extract all technical team notes, comments, and observations.
- Identify the team name, date, and subject/topic of the notes.
- Categorize notes by area (e.g., fabric, stitching, fitting, finishing, QC).
- Extract action items with responsible person, deadline, and status if available.
- Note priority levels (high/medium/low) for each item when indicated.
- Capture any attached reference documents or images mentioned.
- Extract general remarks or summary statements.`
};
