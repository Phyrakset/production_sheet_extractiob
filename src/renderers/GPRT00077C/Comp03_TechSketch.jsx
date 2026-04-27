import React from 'react';

/**
 * GPRT00077C-specific renderer for Comp03_TechSketch
 * ──────────────────────────────────────────────────
 */
export default function Comp03_TechSketch_GPRT00077C({ data, extraction, slotTitle }) {
  const header = extraction?.data?.header || extraction?.header || {
    leftLabel: "002 : Sketch TECHNICAL",
    middleLabel: "001 : SPEC 1",
    rightLabel: "Page 3 of 9"
  };

  const coloredBoxes = extraction?.data?.coloredBoxes || extraction?.coloredBoxes || [];
  const pointerNotes = extraction?.data?.pointerNotes || extraction?.pointerNotes || [];

  // 1. Map Colored Boxes (The big floating blocks)
  const boxTopLeftGreen = coloredBoxes.find(b => b.text.includes('RCL') || b.text.includes('主唛'));
  const boxTopRightCyan1 = coloredBoxes.find(b => b.text.includes('做工图') || b.text.includes('Shor W02'));
  const boxTopRightCyan2 = coloredBoxes.find(b => b.text.includes('前幅裁片印花'));
  const boxTopRightCyan3 = coloredBoxes.find(b => b.text.includes('stripe matching'));
  const boxBottomRightYellow = coloredBoxes.find(b => b.text.includes('生产指示'));
  
  const boxTopRightRed1 = coloredBoxes.find(b => b.text.includes('领:1/2"原身布对折'));
  const boxBottomRightRed2 = coloredBoxes.find(b => b.text.includes('后中脚弯高'));

  // 2. Map Pointer Notes with precise coordinates & SVG paths
  const getNotePosition = (text) => {
    const t = text.toLowerCase();
    
    if (t.includes('shoulder foward')) {
      return { top: '23%', left: '3%', width: '22%', c: 'red', border: '1px solid red', line: [25, 23, 35, 30] }; // x1,y1 to x2,y2
    }
    if (t.includes('5/16"')) {
      return { top: '32%', left: '25%', width: '5%', c: 'red', line: [26, 33, 35, 36] };
    }
    if (t.includes('inside binding')) {
      return { top: '34%', left: '25%', width: '15%', c: 'blue', line: [25, 35, 35, 36] };
    }
    if (t.includes('flat band')) {
      return { top: '37%', left: '42%', width: '15%', c: 'black', line: [42, 38, 48, 32] };
    }
    if (t === '1/2"') {
      return { top: '43%', left: '62%', width: '5%', c: 'red', line: [62, 44, 58, 40] };
    }
    if (t === '3/8"') {
      return { top: '45%', left: '25%', width: '5%', c: 'black', line: [26, 45, 33, 40] };
    }
    if (t.includes('rolled up')) {
      return { top: '47%', left: '11%', width: '20%', c: 'black', line: [20, 48, 29, 58] };
    }
    if (t.includes('印花距肩')) {
      return { top: '53%', left: '28%', width: '15%', c: 'blue', line: [28, 55, 38, 50] };
    }
    if (t.includes('左右居中')) {
      return { top: '57%', left: '30%', width: '15%', c: 'blue', line: null };
    }
    if (t.includes('press seam')) {
      return { top: '52%', left: '65%', width: '15%', c: 'blue', line: [65, 52, 60, 48] };
    }
    if (t.includes('4 tacks')) {
      return { top: '65%', left: '45%', width: '10%', c: 'blue', line: [45, 65, 43, 62] };
    }
    if (t.includes('thread overlock') && !t.includes('shoulder')) {
      return { top: '75%', left: '45%', width: '12%', c: 'blue', line: [45, 75, 43, 70] };
    }
    if (t.includes('双层原身布')) {
      return { top: '63%', left: '3%', width: '25%', c: 'blue', line: [20, 65, 30, 80] };
    }
    if (t.includes('脚:原身布折入')) {
      return { top: '83%', left: '20%', width: '30%', c: 'blue', line: null };
    }
    if (t.includes('self fold')) {
      return { top: '86%', left: '21%', width: '15%', c: 'black', line: [21, 87, 33, 80] };
    }
    
    // Fallback placement (stack on the right)
    return { top: '40%', left: '80%', width: '15%', c: 'black', line: null };
  };

  return (
    <div className="comp-section avoid-break" style={{ 
      position: 'relative', 
      width: '100%', 
      height: '900px', // Fixed high canvas
      backgroundColor: '#ffffff',
      color: '#000',
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #ccc',
      overflow: 'hidden'
    }}>
      {/* HEADER SECTION */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: '12px', 
        fontWeight: 'bold',
        padding: '5px 10px',
        borderBottom: '2px solid #000'
      }}>
        <div>{header.leftLabel}</div>
        <div>{header.middleLabel}</div>
        <div>{header.rightLabel}</div>
      </div>

      {/* BACKGROUND TABLE PLACEHOLDER */}
      <div style={{ width: '100%', height: '100px', borderBottom: '1px solid #000', display: 'flex', opacity: 0.2 }}>
         <div style={{ width: '20%', borderRight: '1px solid #000' }}></div>
         <div style={{ width: '30%', borderRight: '1px solid #000' }}></div>
         <div style={{ width: '30%', borderRight: '1px solid #000' }}></div>
         <div style={{ width: '20%' }}></div>
      </div>

      {/* GARMENT PLACEHOLDER */}
      <div style={{ position: 'absolute', left: '30%', top: '30%', width: '18%', height: '45%', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, backgroundColor: '#fafafa' }}>
        <span style={{color:'#ccc'}}>FRONT</span>
      </div>
      <div style={{ position: 'absolute', left: '55%', top: '30%', width: '18%', height: '45%', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, backgroundColor: '#fafafa' }}>
        <span style={{color:'#ccc'}}>BACK</span>
      </div>

      {/* COLORED BOXES (Absolute Mapping) */}
      {boxTopLeftGreen && (
        <div style={{ position: 'absolute', left: '3%', top: '10%', width: '45%', backgroundColor: '#a8ff00', border: '1px solid red', padding: '5px', fontSize: '10px', lineHeight: 1.2, zIndex: 10, whiteSpace: 'pre-wrap', color: 'blue' }}>
          {boxTopLeftGreen.text}
        </div>
      )}
      {boxTopRightCyan1 && (
        <div style={{ position: 'absolute', right: '3%', top: '10%', width: '45%', backgroundColor: '#e0ffff', border: '1px solid red', padding: '5px', fontSize: '10px', lineHeight: 1.2, zIndex: 10, whiteSpace: 'pre-wrap', color: 'blue' }}>
          {boxTopRightCyan1.text}
        </div>
      )}
      {boxTopRightRed1 && (
        <div style={{ position: 'absolute', right: '12%', top: '23%', width: '25%', border: '1px solid red', padding: '5px', fontSize: '10px', lineHeight: 1.2, zIndex: 10, whiteSpace: 'pre-wrap', color: 'blue' }}>
          {boxTopRightRed1.text}
        </div>
      )}
      {boxTopRightCyan2 && (
        <div style={{ position: 'absolute', right: '3%', top: '32%', width: '25%', backgroundColor: '#e0ffff', border: '1px solid red', padding: '5px', fontSize: '10px', lineHeight: 1.2, zIndex: 10, whiteSpace: 'pre-wrap', color: 'blue' }}>
          {boxTopRightCyan2.text}
        </div>
      )}
      {boxTopRightCyan3 && (
        <div style={{ position: 'absolute', right: '3%', top: '55%', width: '25%', backgroundColor: '#e0ffff', border: '1px solid red', padding: '5px', fontSize: '10px', lineHeight: 1.2, zIndex: 10, whiteSpace: 'pre-wrap', color: 'blue' }}>
          {boxTopRightCyan3.text}
        </div>
      )}
      {boxBottomRightRed2 && (
        <div style={{ position: 'absolute', right: '15%', top: '80%', width: '20%', border: 'none', padding: '0', fontSize: '10px', lineHeight: 1.2, zIndex: 10, whiteSpace: 'pre-wrap', color: 'blue' }}>
          {boxBottomRightRed2.text}
        </div>
      )}
      {boxBottomRightYellow && (
        <div style={{ position: 'absolute', right: '3%', bottom: '2%', width: '32%', backgroundColor: '#a8ff00', border: '1px solid red', padding: '5px', fontSize: '10px', lineHeight: 1.2, zIndex: 10, whiteSpace: 'pre-wrap', color: 'blue' }}>
          {boxBottomRightYellow.text}
        </div>
      )}

      {/* POINTER NOTES LAYER */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
        {pointerNotes.map((note, idx) => {
          const pos = getNotePosition(note.text);
          return (
            <div key={idx} style={{ position: 'absolute', left: pos.left, top: pos.top, width: pos.width, color: pos.c, border: pos.border || 'none', padding: pos.border ? '3px' : '0', fontSize: '9px', lineHeight: 1.2, whiteSpace: 'pre-wrap' }}>
              {note.text}
            </div>
          );
        })}
      </div>

      {/* DYNAMIC SVG POINTER LINES */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 4 }}>
        {pointerNotes.map((note, idx) => {
          const pos = getNotePosition(note.text);
          if (pos.line) {
            const [x1, y1, x2, y2] = pos.line;
            return <line key={idx} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={pos.c} strokeWidth="1" />;
          }
          return null;
        })}
        {/* Missing manual circles from original image */}
        <circle cx="60%" cy="40%" r="2%" stroke="red" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}
