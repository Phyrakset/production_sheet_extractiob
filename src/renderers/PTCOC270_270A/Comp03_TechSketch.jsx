import React from "react";

// Inline styles for press matching the PTCOC270_270A PDF exactly
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    background: "#ffffff", // Pure white like the PDF
    border: "1px solid #ddd",
    color: "#000000",
    fontFamily: "sans-serif"
  },
  title: {
    fontSize: "20px",
    fontWeight: "normal",
    marginBottom: "20px"
  },
  sketchArea: {
    position: "relative",
    width: "100%",
    height: "600px",
    background: "#ffffff",
    marginBottom: "20px"
  },
  svgLayer: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%"
  },
  tableContainer: {
    width: "100%",
    border: "1px solid #000",
    borderTop: "none"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "10px",
    color: "#000"
  },
  th: {
    border: "1px solid #000",
    padding: "4px",
    textAlign: "left"
  },
  tr: {
    borderTop: "1px solid #000"
  },
  td: {
    border: "1px solid #000",
    padding: "4px"
  },
  whiteBox: {
    background: "#ffffff",
    border: "1px solid #000",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#000"
  }
};

// Double-headed arrow component
const DoubleArrow = ({ x1, y1, x2, y2, labelText, labelX, labelY }) => (
  <g>
    {/* Line */}
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff0000" strokeWidth="2" />
    
    {/* Arrow heads (calculating angle for rotation) */}
    <g transform={`translate(${x1}, ${y1}) rotate(${Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI})`}>
      <polygon points="0,0 8,-4 8,4" fill="#ff0000" />
    </g>
    <g transform={`translate(${x2}, ${y2}) rotate(${Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI})`}>
      <polygon points="0,0 8,-4 8,4" fill="#ff0000" />
    </g>
    
    {/* Number Box */}
    <foreignObject x={labelX - 15} y={labelY - 10} width="30" height="25">
      <div style={{ ...styles.whiteBox, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', boxSizing: 'border-box' }}>
        {labelText}
      </div>
    </foreignObject>
  </g>
);

// Green/Red mixed arrow for back shorts top (#10)
const MixedArrow = ({ x1, y1, x2, y2, labelText, labelX, labelY }) => {
  const midY = (y1 + y2) / 2;
  return (
    <g>
      {/* Green part */}
      <line x1={x1} y1={y1} x2={x2} y2={midY} stroke="#00b050" strokeWidth="2" />
      <g transform={`translate(${x1}, ${y1}) rotate(${Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI})`}>
        <polygon points="0,0 8,-4 8,4" fill="#00b050" />
      </g>
      {/* Red part */}
      <line x1={x1} y1={midY} x2={x2} y2={y2} stroke="#ff0000" strokeWidth="2" />
      <g transform={`translate(${x2}, ${y2}) rotate(${Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI})`}>
        <polygon points="0,0 8,-4 8,4" fill="#ff0000" />
      </g>

      <foreignObject x={labelX - 15} y={labelY - 10} width="30" height="25">
        <div style={{ ...styles.whiteBox, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', boxSizing: 'border-box' }}>
          {labelText}
        </div>
      </foreignObject>
    </g>
  );
};

export default function Comp03_TechSketch({ extraction }) {
  // Extract the table from otherInformation since the AI provides it there
  const otherInfo = extraction?.otherInformation || [];
  const tableData = Array.isArray(otherInfo) 
    ? otherInfo.find(item => item && typeof item === 'object' && item.type === "table")
    : null;

  const d = extraction?.data || {};
  const pointerNotes = d.pointerNotes || [];

  return (
    <div style={styles.container}>
      <div style={styles.title}>STCO4143款SKETCH</div>
      
      <div style={styles.sketchArea}>
        <svg style={styles.svgLayer} viewBox="0 0 800 600">
          <defs>
            <marker id="arrowRed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff0000" />
            </marker>
          </defs>

          {/* FRONT SHORTS (Left side, larger) */}
          <g transform="translate(100, 150)">
            <path
              d="
                M 50,0 
                L 350,0 
                C 360,0 370,10 380,30 
                L 430,200 
                L 230,170 
                L 200,80 
                L 170,170 
                L -30,200 
                C 20,30 30,10 40,0 
                Z"
              fill="#5f666f"
              stroke="#000"
              strokeWidth="1"
            />
            {/* Waistband details */}
            <path d="M 40,40 C 150,50 250,50 365,40" fill="none" stroke="#000" strokeWidth="1" />
            <path d="M 200,45 L 200,80" fill="none" stroke="#000" strokeWidth="1" />
            {/* Crotch seam */}
            <path d="M 200,80 C 180,100 180,150 170,170" fill="none" stroke="#000" strokeWidth="1" />
            <path d="M 200,80 C 220,100 220,150 230,170" fill="none" stroke="#000" strokeWidth="1" />
            {/* Pocket lines */}
            <path d="M 20,100 L 40,160" fill="none" stroke="#000" strokeWidth="1" />
            <path d="M 380,100 L 360,160" fill="none" stroke="#000" strokeWidth="1" />
            {/* Drawstrings */}
            <path d="M 180,0 C 170,-50 160,-80 190,-40" fill="none" stroke="#000" strokeWidth="3" />
            <path d="M 220,0 C 230,-50 240,-80 210,-40" fill="none" stroke="#000" strokeWidth="3" />
            
            {/* Waist Top (1) */}
            <DoubleArrow x1="50" y1="-5" x2="350" y2="-5" labelText="1" labelX="185" labelY="-20" />
            
            {/* Hip (2) */}
            <DoubleArrow x1="25" y1="60" x2="370" y2="60" labelText="2" labelX="120" labelY="70" />
            
            {/* Thigh (3) */}
            <DoubleArrow x1="200" y1="120" x2="400" y2="120" labelText="3" labelX="300" labelY="130" />
            
            {/* Bottom Opening (4) */}
            <DoubleArrow x1="-25" y1="195" x2="165" y2="165" labelText="4" labelX="50" labelY="180" />
            
            {/* Inseam (8) */}
            <DoubleArrow x1="200" y1="80" x2="225" y2="165" labelText="8" labelX="235" labelY="130" />
            
            {/* Bottom Hem (9) */}
            <DoubleArrow x1="330" y1="180" x2="330" y2="155" labelText="9" labelX="330" labelY="140" />
          </g>

          {/* BACK SHORTS (Top right, smaller) */}
          <g transform="translate(450, 40) scale(0.8)">
            <path
              d="
                M 50,0 
                L 350,0 
                C 360,0 370,10 380,30 
                L 430,200 
                L 230,170 
                L 200,80 
                L 170,170 
                L -30,200 
                C 20,30 30,10 40,0 
                Z"
              fill="#5f666f"
              stroke="#000"
              strokeWidth="1"
            />
            {/* Waistband details */}
            <path d="M 40,40 C 150,50 250,50 365,40" fill="none" stroke="#000" strokeWidth="1" />
            <path d="M 200,0 L 200,80" fill="none" stroke="#000" strokeWidth="1" />
            {/* Yoke seam */}
            <path d="M 30,70 L 200,100 L 370,70" fill="none" stroke="#000" strokeWidth="1" />
            
            {/* Flower logo */}
            <circle cx="340" cy="50" r="10" fill="#a0a0a0" />
            
            {/* Back Yoke Height (10) - Mixed Green/Red Arrow */}
            <MixedArrow x1="200" y1="0" x2="200" y2="100" labelText="10" labelX="230" labelY="50" />
            
            {/* Back Rise (6) */}
            <DoubleArrow x1="200" y1="100" x2="200" y2="140" labelText="6" labelX="230" labelY="120" />
          </g>
        </svg>
      </div>

      {/* MATCHED TABLE SECTION */}
      {tableData && tableData.rows && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <tbody>
              {tableData.rows.map((row, i) => {
                const desc = row.Description || row["English Description"] || "";
                // Sometimes the JSON has \n, sometimes \\n
                const lines = desc.includes("\\n") ? desc.split("\\n") : desc.split("\n");
                return (
                  <tr key={i} style={styles.tr}>
                    <td style={{ ...styles.td, textAlign: 'center', width: '40px' }}>{row.Number}</td>
                    <td style={{ ...styles.td, width: '40%' }}>{lines[0] || ""}</td>
                    <td style={styles.td}>{lines.slice(1).join(" ") || ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
