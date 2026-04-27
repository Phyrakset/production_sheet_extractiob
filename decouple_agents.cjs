const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, 'server', 'agents');
const styles = ['GPAF6153', 'GPAR12172GD-2', 'GPRT00077C', 'PTBC0047', 'PTCOC270_270A', 'PTCOM227'];

let modifiedCount = 0;

styles.forEach(style => {
  const styleDir = path.join(agentsDir, style);
  if (!fs.existsSync(styleDir)) return;
  
  const files = fs.readdirSync(styleDir);
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    const filePath = path.join(styleDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Look for generic import
    if (content.includes("from '../generic/")) {
      const compNameMatch = file.match(/^(Comp\d+_[a-zA-Z]+)\.js$/);
      if (!compNameMatch) return;
      const compName = compNameMatch[1];
      
      const genericPath = path.join(agentsDir, 'generic', file);
      if (!fs.existsSync(genericPath)) return;
      
      const genericContent = fs.readFileSync(genericPath, 'utf-8');
      
      // We will parse the generic file by capturing what's inside export default { ... }
      const exportMatch = genericContent.match(/export default\s*(\{[\s\S]*?\});/);
      let newBody = '';
      if (exportMatch) {
        newBody = exportMatch[1];
      } else {
        // fallback if it doesn't match perfectly
        newBody = genericContent.replace('export default ', '');
      }

      const newContent = `/**
 * ${style}-specific extraction agent for ${compName}
 * ──────────────────────────────────────────────────
 * Status: PENDING PRESS-MATCHING
 * This agent has been decoupled from the generic configuration.
 * Please update the schema and prompt below to match the actual PDF.
 */
export default ${newBody};
`;
      fs.writeFileSync(filePath, newContent, 'utf-8');
      modifiedCount++;
      console.log(`Updated: ${style}/${file}`);
    }
  });
});

console.log(`Successfully decoupled ${modifiedCount} agent files.`);
