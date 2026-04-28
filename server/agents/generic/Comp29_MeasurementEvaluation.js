export default {
  schema: `{ "evaluationDate": "string", "sampleStage": "string", "evaluator": "string", "overallResult": "string", "measurements": [{ "pom": "string", "description": "string", "spec": "string", "actual": "string", "deviation": "string", "tolerance": "string", "passFail": "string" }], "comments": ["string"] }`,
  rules: `- Extract details of the measurement evaluation or sample audit.
- Capture metadata such as the date of evaluation, the sample stage (e.g., PP Sample, TOP), evaluator/inspector name, and the overall pass/fail result.
- For each point of measure (POM) evaluated, list it in the measurements array.
- Capture the POM code, description, the required spec, the actual measured value, the deviation (difference), allowed tolerance, and whether that specific measurement passed or failed.
- Note any specific comments, corrections, or follow-up actions required.`
};
