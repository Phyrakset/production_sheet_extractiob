import React from 'react';

const styles = {
  container: {
    padding: "20px",
    background: "#fff",
    fontFamily: "sans-serif",
    width: "100%",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#cc0000",
    textAlign: "center",
    marginBottom: "20px"
  },
  sketchArea: {
    width: "100%",
    height: "600px",
    position: "relative",
    border: "1px solid #ddd",
    backgroundColor: "#f9f9f9"
  },
  svgLayer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0
  },
  blueText: {
    fontSize: "12px",
    fontWeight: "bold",
    fill: "#0000ff",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap"
  }
};

// Helper to draw the red measurement lines
const MeasurementLine = ({ x1, y1, x2, y2, isDashed }) => (
  <line 
    x1={x1} y1={y1} x2={x2} y2={y2} 
    stroke="#ff0000" 
    strokeWidth="2" 
    strokeDasharray={isDashed ? "4,4" : "none"} 
  />
);

// Helper to draw blue text
const FloatingText = ({ x, y, text, align = "middle" }) => {
  if (!text) return null;
  return (
    <text x={x} y={y} textAnchor={align} style={styles.blueText}>
      {text}
    </text>
  );
};

export default function Comp03_TechSketch({ extraction }) {
  const d = extraction?.data || {};
  const pointerNotes = d.pointerNotes || [];

  // Helper to find specific note text by partial match of pointsTo or text
  const findNote = (keywords) => {
    const note = pointerNotes.find(n => 
      keywords.some(k => 
        (n.pointsTo && n.pointsTo.toLowerCase().includes(k)) || 
        (n.text && n.text.includes(k))
      )
    );
    return note ? note.text : null;
  };

  // Map the blue texts
  const labels = {
    waistTop: findNote(["waist", "腰阔", "松度"]),
    highHip: findNote(["high hip", "上坐围"]),
    lowHip: findNote(["low hip", "下坐围"]),
    frontRise: findNote(["front rise", "前浪长"]),
    thigh: findNote(["thigh", "脾围"]),
    knee: findNote(["knee", "膝围"]),
    inseam: findNote(["inseam", "内长"]),
    legOpening: findNote(["leg opening", "脚阔"]),
    waistbandHeight: findNote(["waistband height", "腰头高"]),
    
    sideTop: findNote(["侧骨驳幅阔", "腰骨度"]),
    sideFrontHip: findNote(["侧线距离前", "前幅度"]),
    sideSeam: findNote(["侧骨长", "侧线长"]),
    sideBackHip: findNote(["侧线距离顶", "后幅度"]),
    sideBottom: findNote(["脚口度"]),
    
    backRise: findNote(["back rise", "后浪长"])
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        {d.header?.title || "3A-571度尺图 / PTCOM227"}
      </div>
      
      <div style={styles.sketchArea}>
        <svg style={styles.svgLayer} viewBox="0 0 1000 600">
          
          {/* ================= FRONT VIEW (Left) ================= */}
          <g transform="translate(0, 50)">
            {/* Main Leggings Outline */}
            <path
              d="M 120,50 
                 L 280,50 
                 C 300,100 305,150 300,250 
                 C 295,350 280,450 270,500 
                 L 240,500 
                 C 240,400 230,300 200,200 
                 C 170,300 160,400 160,500 
                 L 130,500 
                 C 120,450 105,350 100,250 
                 C 95,150 100,100 120,50 Z"
              fill="#ffffff"
              stroke="#000"
              strokeWidth="1.5"
            />
            {/* Waistband bottom seam */}
            <path d="M 115,85 C 160,95 240,95 285,85" fill="none" stroke="#000" strokeWidth="1" />
            {/* Front rise seam */}
            <path d="M 200,90 C 200,130 195,180 200,200" fill="none" stroke="#000" strokeWidth="1" />
            {/* Thigh / Knee decorative seams (like the image) */}
            <path d="M 102,200 L 140,220 L 130,300 L 110,280" fill="none" stroke="#000" strokeWidth="1" />
            <path d="M 298,200 L 260,220 L 270,300 L 290,280" fill="none" stroke="#000" strokeWidth="1" />

            {/* Red Measurement Lines */}
            <MeasurementLine x1="120" y1="50" x2="280" y2="50" />
            <MeasurementLine x1="110" y1="120" x2="290" y2="120" />
            <MeasurementLine x1="102" y1="200" x2="200" y2="220" />
            <MeasurementLine x1="200" y1="220" x2="298" y2="200" />
            <MeasurementLine x1="200" y1="90" x2="200" y2="200" />
            <MeasurementLine x1="210" y1="230" x2="295" y2="230" />
            <MeasurementLine x1="220" y1="400" x2="280" y2="400" />
            <MeasurementLine x1="200" y1="200" x2="160" y2="500" />
            <MeasurementLine x1="130" y1="500" x2="160" y2="500" />
            <MeasurementLine x1="285" y1="50" x2="290" y2="85" />

            {/* Blue Texts */}
            <FloatingText x="200" y="35" text={labels.waistTop || "腰阔-松度"} />
            <FloatingText x="150" y="110" text={labels.highHip || "上坐围"} />
            <FloatingText x="150" y="190" text={labels.lowHip || "下坐围"} />
            <FloatingText x="220" y="160" text={labels.frontRise || "前浪长"} />
            <FloatingText x="250" y="220" text={labels.thigh || "脾围"} />
            <FloatingText x="260" y="390" text={labels.knee || "膝围"} />
            <FloatingText x="150" y="350" text={labels.inseam || "内长"} />
            <FloatingText x="145" y="520" text={labels.legOpening || "脚阔"} />
            <FloatingText x="320" y="70" text={labels.waistbandHeight || "腰头高"} align="start" />
          </g>

          {/* ================= SIDE VIEW (Middle) ================= */}
          <g transform="translate(450, 50)">
            {/* Side Leggings Outline */}
            <path
              d="M 50,50 
                 L 110,50 
                 C 130,120 140,180 100,250 
                 C 90,300 80,400 70,500 
                 L 30,500 
                 C 30,400 50,300 50,250 
                 C 50,180 30,120 50,50 Z"
              fill="#ffffff"
              stroke="#000"
              strokeWidth="1.5"
            />
            {/* Waistband */}
            <path d="M 45,85 L 115,85" fill="none" stroke="#000" strokeWidth="1" />
            {/* Side Seam */}
            <path d="M 80,85 C 80,200 65,300 50,500" fill="none" stroke="#000" strokeWidth="1" />
            {/* Decorative pocket */}
            <path d="M 80,180 L 115,200" fill="none" stroke="#000" strokeWidth="1" />
            <path d="M 80,280 L 105,250" fill="none" stroke="#000" strokeWidth="1" />

            {/* Red Measurement Lines */}
            <MeasurementLine x1="50" y1="50" x2="110" y2="50" />
            <MeasurementLine x1="80" y1="85" x2="80" y2="280" />
            <MeasurementLine x1="50" y1="120" x2="80" y2="120" />
            <MeasurementLine x1="80" y1="150" x2="125" y2="150" />
            <MeasurementLine x1="30" y1="500" x2="70" y2="500" />

            {/* Blue Texts */}
            <FloatingText x="80" y="35" text={labels.sideTop || "侧骨驳幅阔-腰骨度"} />
            <FloatingText x="35" y="110" text={labels.sideFrontHip || "侧线距离前幅度"} align="end" />
            <FloatingText x="90" y="220" text={labels.sideSeam || "侧骨长"} align="start" />
            <FloatingText x="135" y="140" text={labels.sideBackHip || "侧线距离顶-后幅度"} align="start" />
            <FloatingText x="50" y="520" text={labels.sideBottom || "侧骨驳幅阔-脚口度"} />
          </g>

          {/* ================= BACK VIEW (Right) ================= */}
          <g transform="translate(680, 50)">
            {/* Back Leggings Outline */}
            <path
              d="M 40,50 
                 L 200,50 
                 C 220,100 225,150 220,250 
                 C 215,350 200,450 190,500 
                 L 160,500 
                 C 160,400 150,300 120,200 
                 C 90,300 80,400 80,500 
                 L 50,500 
                 C 40,450 25,350 20,250 
                 C 15,150 20,100 40,50 Z"
              fill="#ffffff"
              stroke="#000"
              strokeWidth="1.5"
            />
            {/* Waistband */}
            <path d="M 35,85 C 80,95 160,95 205,85" fill="none" stroke="#000" strokeWidth="1" />
            {/* Back yoke curve */}
            <path d="M 30,120 C 120,150 120,150 210,120" fill="none" stroke="#000" strokeWidth="1" />
            {/* Center back seam */}
            <path d="M 120,90 L 120,200" fill="none" stroke="#000" strokeWidth="1" />
            {/* Small brand logo circle */}
            <circle cx="120" cy="70" r="3" fill="#a0a0a0" />

            {/* Red Measurement Lines */}
            <MeasurementLine x1="120" y1="50" x2="120" y2="200" />

            {/* Blue Texts */}
            <FloatingText x="130" y="160" text={labels.backRise || "后浪长"} align="start" />
            
            {/* Orange Mark's Logo (bottom right) */}
            <g transform="translate(140, 480)">
              <rect x="0" y="-10" width="10" height="10" fill="#e47911" />
              <text x="12" y="0" style={{ fontSize: "14px", fontWeight: "bold", fill: "#808080" }}>Mark's</text>
            </g>
          </g>
          
        </svg>
      </div>
    </div>
  );
}
