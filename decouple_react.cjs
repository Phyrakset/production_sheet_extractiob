const fs = require('fs');
const path = require('path');

const renderersDir = path.join(__dirname, 'src', 'renderers');
const styles = ['GPAF6153', 'GPAR12172GD-2', 'GPRT00077C', 'PTBC0047', 'PTCOC270_270A', 'PTCOM227'];

let modifiedCount = 0;

styles.forEach(style => {
  const styleDir = path.join(renderersDir, style);
  if (!fs.existsSync(styleDir)) return;
  
  const files = fs.readdirSync(styleDir);
  files.forEach(file => {
    if (!file.endsWith('.jsx')) return;
    const filePath = path.join(styleDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Look for generic exports like "export { default } from '../Comp...';"
    // or anything similar that is just a re-export
    if (content.includes('export { default } from')) {
      const compNameMatch = file.match(/^(Comp\d+_[a-zA-Z]+)\.jsx$/);
      if (!compNameMatch) return;
      
      const compName = compNameMatch[1];
      const newContent = `import React from 'react';

/**
 * ${style}-specific renderer for ${compName}
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This component has been isolated from generic fallbacks.
 * Please implement the style-specific layout here.
 */
export default function ${compName}_${style.replace(/-/g, '_')}({ data, extraction, slotTitle }) {
  return (
    <div className="comp-section avoid-break" style={{ border: '2px dashed #ff9900', padding: 20, margin: '10px 0' }}>
      <h2 className="comp-title">{slotTitle || '${compName}'} - ${style}</h2>
      <div style={{ color: '#ff9900', fontWeight: 'bold' }}>
        [PENDING PRESS-MATCHING]
      </div>
      <p style={{ marginTop: 10, fontSize: 13 }}>
        This module has been isolated for <strong>${style}</strong>.
        Please provide the original PDF to implement the pixel-perfect layout.
      </p>
    </div>
  );
}
`;
      fs.writeFileSync(filePath, newContent, 'utf-8');
      modifiedCount++;
      console.log(`Updated: ${style}/${file}`);
    }
  });
});

console.log(`Successfully decoupled ${modifiedCount} React components.`);
