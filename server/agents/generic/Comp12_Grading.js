export default {
  schema: `{ "approvalStatus": "string", "approvalDate": "string", "baseSize": "string", "sizeRange": ["string"], "rules": [{"code": "string", "dimension": "string", "baseValue": "string", "increments": [{"fromSize": "string", "toSize": "string", "increment": "string"}], "unit": "string"}] }`,
  rules: `- Extract grading approval status and date (e.g., "GRADING APPROVED").
- Extract base size and full size range.
- For each dimension extract the base value and increments between each size jump.
- Include measurement codes if visible.`
};
