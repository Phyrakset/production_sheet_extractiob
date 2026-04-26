export default {
  schema: `{
  "headerInfo": {
    "customerCode": "string",
    "customerStyle": "string",
    "quantity": "string",
    "styleId": "string",
    "pages": "string",
    "orderDate": "string",
    "exFtyDate": "string"
  },
  "metadata": {
    "customerPo": "string",
    "customerSty": "string",
    "season": "string",
    "coo": "string"
  },
  "materials": {
    "description": "string",
    "colour": "string",
    "quantity": "string"
  },
  "sizeBreakdown": [
    {
      "colCode": "string",
      "colourZh": "string",
      "colourEn": "string",
      "xs": "string",
      "s": "string",
      "m": "string",
      "l": "string",
      "xl": "string",
      "xxl": "string",
      "total": "string"
    }
  ],
  "sizeTotals": {
    "xs": "string",
    "s": "string",
    "m": "string",
    "l": "string",
    "xl": "string",
    "xxl": "string",
    "total": "string"
  },
  "shipments": [
    {
      "lot": "string",
      "exFtyDate": "string",
      "quantity": "string"
    }
  ],
  "processes": {
    "print": "string",
    "embroidery": "string",
    "washing": "string",
    "heatTransfer": "string"
  },
  "remark": "string",
  "footerStatus": "string"
}`,
  rules: `- Extract strictly according to the visual tables in the document.
- In the Size Breakdown table, split the COLOUR column into colourZh (e.g. "米白") and colourEn (e.g. "178 BIRCH").
- Extract the TOTAL row into sizeTotals.
- Keep exact string matches for Chinese and English.
- Extract the bottom footer text (e.g., Status: T2YM ...) into footerStatus.`
};
