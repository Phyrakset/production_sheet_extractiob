export default {
  schema: `{ "sampleSize": "string", "sampleType": "string", "measureDate": "string", "tables": [{"pom": "string", "code": "string", "target": "string", "actual": "string", "difference": "string", "tolerance": "string", "pass": "boolean"}], "overallResult": "string", "comments": ["string"] }`,
  rules: `- Extract ALL rows from QA measurement evaluation tables.
- Include target spec, actual measured value, difference, tolerance, and pass/fail per point.
- Note sample type (PP/TOP/SIZE SET) and size being measured.
- Extract overall result and any inspector comments.`
};
