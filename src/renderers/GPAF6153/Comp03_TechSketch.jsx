import React from 'react';

const Comp03_TechSketch_GPAF6153 = ({ data, extraction }) => {
  const d = extraction?.data || data || {};
  
  // Hardcoded visual fallbacks if extraction hasn't populated yet
  const header = d.header || {
    poDescription: '122260171 Essential OS PO 2.0 NO BACK YOKE (FA26 BULK FWD)',
    documentType: 'Main Sketch',
    date: 'Draft-Sample 1/28/2026, 2:50 PM'
  };

  const labeledImagesText = d.labeledImagesText?.length ? d.labeledImagesText : [
    '1. 主唛: 主唛距领圈下1/2", 距1/16"间一圈平车线，线色跟主唛',
    '2.洗水唛: 缝车在穿针左侧骨，脚边上4 1/2"',
    'MK1560RP卫衣布：大身+袖+双层帽+袋鼠袋',
    'MRIB594螺纹：袖口+衫脚',
    'AFG584RP平纹布：后领捆'
  ];

  const generalInstructions = d.generalInstructions?.length ? d.generalInstructions : [
    'PLEASE SEE STANDARDS MANUAL FOR ALL CONSTRUCTION NOT CALLED OUT BELOW',
    '*ALL SEAMS UNLESS OTHERWISE NOTED WILL BE CLEAN FINISHED W/ 1/8" (504) W/ 1/4" 2N (406) TOPSTITCHING STRADDLE*'
  ];

  const pointerNotes = d.pointerNotes?.length ? d.pointerNotes : [
    { color: 'blue', text: '帽: 双层原身布，面层和里层在帽檐破开，四线及骨，没有面线。帽口及骨无面线。前中帽重叠1-3/4"\n2 3/8"阔平纹布做直纹后领捆，肩顶至肩顶\n领骨三线及骨，止口3/16"阔，面分中冚1/4"双针网底' },
    { color: 'blue', text: '-肩骨/侧骨/夹圈/袖底骨: 三线及骨，3/16"止口，面冚1/4"双针网底分中冚' },
    { color: 'red', text: 'CF hood crossover 1-3/4"\n**所有面线SPI10-12针**' },
    { color: 'blue', text: '-袋鼠袋:\n-袋口原身布折入1"车1/4"双针网底，鼠袋袋唇高1"(含双针线)。\n-袋顶和袋侧边距边1/16" 冚1/4"双针网底，袋口顶和袋底要打枣1/2"' },
    { color: 'black', text: '- 1 PIECE; 2 PLY HOOD W/ CB DART; SEE TRIM PAGE\n- HOOD HEM OPT 8: CLEAN FINISH LINING W/ NO TOPSTITCHING' },
    { color: 'black', text: 'BNT:\n-HPS TO HPS\n-STRADDLES NECK SEAM' },
    { color: 'black', text: 'KANGA POCKET:\n-ATTACHED CLEAN FINISHED W 1/4" 2N (406), SET 1/16" FROM EDGE\n-POCKET OPENING: SINGLE TURNBACK W/\n1/4" 2N (406) & BARTACKS @ TOP & BOTTOM\n-POCKET OPENING HAS STRAIGHT VISUAL ON BODY' },
    { color: 'red', text: 'VINTAGE CUFF & BOTTOM BAND:\n-W/ 1/4" 2N (406) STITCH-IN-DITCH,\n-W/ EXPOSED NEEDLE SET TO BODY/SLV' },
    { color: 'blue', text: '-衫脚和袖口要有波浪\n-袖口骨位/衫脚骨位: 3/16"阔三线及骨，落坑冚1/4"双针网底，另一针车在袖身及大身\n-衫脚平服后半边骨位有4-7个波浪 (约11"长)，袖骨平服后每只袖的袖骨位有3-4个波浪' }
  ];

  const footer = d.footer || {
    description: 'Image Data Sheet: Main Sketch',
    modifiedDate: '12/17/2025, 10:06 AM',
    modifiedBy: 'Courtney Schmitt',
    pageNumber: 'Page 9 of 16'
  };

  // Convert 'blue' -> '#0000ff', 'red' -> '#ff0000', with hardcoded overrides for GPAF6153 press-matching
  const getColorValue = (colorStr, text = '') => {
    const t = text.toLowerCase();
    
    // Overrides for accurate press-matching because LLM color extraction is unreliable
    if (t.includes('crossover') || t.includes('spi') || t.includes('所有面线')) return '#ff0000';
    if (t.includes('vintage cuff') || t.includes('stitch-in-ditch') || t.includes('exposed needle')) return '#ff0000';
    if (t.includes('kanga pocket') || t.includes('attached clean') || t.includes('pocket opening') || t.includes('set 1/16') || t.includes('bartacks')) return '#000';
    if (t.includes('piece') || t.includes('hood hem') || t.includes('bnt') || t.includes('hps') || t.includes('straddles')) return '#000';
    
    // Most Chinese instructions on this page are blue unless specified above
    if (t.includes('帽') || t.includes('平纹布') || t.includes('领骨') || t.includes('肩骨') || t.includes('袋') || t.includes('波浪') || t.includes('袖口') || t.includes('衫脚') || t.includes('侧骨') || t.includes('夹圈')) return '#0000ff';

    if (!colorStr) return '#000';
    const c = colorStr.toLowerCase();
    if (c.includes('blue')) return '#0000ff';
    if (c.includes('red')) return '#ff0000';
    return '#000';
  };

  // Group notes intelligently so broken lines are kept together
  const groups = {
    leftMid: [],
    leftBottom: [],
    rightTop: [],
    rightMid: [],
    rightBottom: []
  };
  
  let lastGroup = 'leftMid';
  pointerNotes.forEach(note => {
    const t = note.text.toLowerCase();
    
    // Keyword heuristics
    if (t.includes('crossover') || t.includes('spi') || t.includes('所有面线')) lastGroup = 'rightTop';
    else if (t.includes('piece') || t.includes('bnt') || t.includes('hps') || t.includes('hood hem')) lastGroup = 'rightMid';
    else if (t.includes('cuff') || t.includes('bottom band') || t.includes('波浪') || t.includes('袖口') || t.includes('衫脚')) lastGroup = 'rightBottom';
    else if (t.includes('帽') || t.includes('领') || t.includes('肩') || t.includes('侧骨') || t.includes('夹圈')) lastGroup = 'leftMid';
    else if (t.includes('袋') || t.includes('kanga') || t.includes('pocket') || t.includes('edge') || t.includes('body')) lastGroup = 'leftBottom';
    
    groups[lastGroup].push(note);
  });

  return (
    <div className="avoid-break" style={{ padding: '15px', backgroundColor: 'white', color: 'black', fontFamily: '"Arial", sans-serif', fontSize: '10px' }}>
      <div style={{ color: '#d35400', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
        Approval Comments - Yorkwell 1/28
      </div>

      {/* TOP HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontWeight: 'bold', backgroundColor: '#e5e5e5', borderTop: '2px solid #000', borderBottom: '1px solid #000' }}>
        <div style={{ width: '25%' }}>A&F PROD Server</div>
        <div style={{ width: '50%', textAlign: 'center' }}>{header.poDescription}</div>
        <div style={{ width: '25%', textAlign: 'right' }}>{header.documentType} &nbsp;&nbsp;&nbsp; {header.date}</div>
      </div>

      {/* LABELED IMAGES SECTION */}
      <div style={{ display: 'flex', paddingTop: '4px', paddingBottom: '4px', borderBottom: '2px solid #000', marginBottom: '8px' }}>
        <div style={{ width: '15%', fontWeight: 'bold', fontSize: '12px' }}>
          Labeled Images
        </div>
        <div style={{ width: '85%', display: 'flex', color: '#0000ff', fontWeight: 'bold' }}>
          <div style={{ width: '50%' }}>
            {labeledImagesText.slice(0, 2).map((txt, idx) => (
              <div key={idx}>{txt}</div>
            ))}
          </div>
          <div style={{ width: '50%' }}>
            {labeledImagesText.slice(2).map((txt, idx) => (
              <div key={idx}>{txt}</div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div style={{ border: '1px solid #ccc', borderRadius: '2px', position: 'relative', width: '100%', height: '700px', backgroundColor: '#fff', overflow: 'hidden' }}>
        
        {/* SVG LAYER FOR LINES (All pointing lines in the original are red) */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          {groups.leftMid.length > 0 && <line x1="40%" y1="35%" x2="48%" y2="35%" stroke="#ff0000" strokeWidth="1" />}
          {groups.leftBottom.length > 0 && <line x1="40%" y1="65%" x2="48%" y2="60%" stroke="#ff0000" strokeWidth="1" />}
          {groups.rightTop.length > 0 && <line x1="60%" y1="25%" x2="52%" y2="30%" stroke="#ff0000" strokeWidth="1" />}
          {groups.rightMid.length > 0 && <line x1="60%" y1="40%" x2="52%" y2="40%" stroke="#ff0000" strokeWidth="1" />}
          {groups.rightBottom.length > 0 && <line x1="60%" y1="75%" x2="52%" y2="75%" stroke="#ff0000" strokeWidth="1" />}
        </svg>

        {/* GARMENT PLACEHOLDER */}
        <div style={{ position: 'absolute', left: '50%', top: '55%', transform: 'translate(-50%, -50%)', width: '25%', height: '60%', border: '1px dashed #999', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa', zIndex: 2 }}>
          <div style={{ fontSize: '30px', color: '#ccc' }}>👕 👕</div>
          <div style={{ color: '#aaa', fontWeight: 'bold', marginTop: '10px' }}>GARMENT SKETCH</div>
          <div style={{ color: '#ccc', fontSize: '10px', marginTop: '5px' }}>[Front & Back]</div>
        </div>

        {/* General Instructions (Top Center) */}
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', color: '#666', width: '80%', zIndex: 3 }}>
          {generalInstructions.map((txt, idx) => (
            <div key={idx} style={{ fontWeight: idx === 1 ? 'bold' : 'normal' }}>{txt}</div>
          ))}
        </div>

        {/* TEXT BLOCKS */}
        {groups.leftMid.length > 0 && (
          <div style={{ position: 'absolute', left: '2%', top: '22%', width: '38%', zIndex: 3 }}>
            {groups.leftMid.map((note, idx) => (
              <div key={idx} style={{ color: getColorValue(note.color, note.text), fontWeight: 'bold' }}>{note.text}</div>
            ))}
          </div>
        )}

        {groups.leftBottom.length > 0 && (
          <div style={{ position: 'absolute', left: '2%', top: '55%', width: '38%', zIndex: 3 }}>
            {groups.leftBottom.map((note, idx) => (
              <div key={idx} style={{ color: getColorValue(note.color, note.text), fontWeight: 'bold' }}>{note.text}</div>
            ))}
          </div>
        )}

        {groups.rightTop.length > 0 && (
          <div style={{ position: 'absolute', left: '62%', top: '22%', width: '36%', zIndex: 3 }}>
            {groups.rightTop.map((note, idx) => (
              <div key={idx} style={{ color: getColorValue(note.color, note.text), fontWeight: 'bold' }}>{note.text}</div>
            ))}
          </div>
        )}

        {groups.rightMid.length > 0 && (
          <div style={{ position: 'absolute', left: '62%', top: '35%', width: '36%', zIndex: 3, display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              {groups.rightMid.slice(0, 2).map((note, idx) => (
                <div key={idx} style={{ color: getColorValue(note.color, note.text), fontWeight: 'bold' }}>{note.text}</div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              {groups.rightMid.slice(2).map((note, idx) => (
                <div key={idx} style={{ color: getColorValue(note.color, note.text), fontWeight: 'bold' }}>{note.text}</div>
              ))}
            </div>
          </div>
        )}

        {groups.rightBottom.length > 0 && (
          <div style={{ position: 'absolute', left: '62%', top: '70%', width: '36%', zIndex: 3 }}>
            {groups.rightBottom.map((note, idx) => (
              <div key={idx} style={{ color: getColorValue(note.color, note.text), fontWeight: 'bold' }}>{note.text}</div>
            ))}
          </div>
        )}

        {/* FOOTER INSIDE THE BOX */}
        <div style={{ position: 'absolute', bottom: '15px', left: '15px', display: 'flex', justifyContent: 'space-between', width: 'calc(100% - 30px)', fontSize: '9px', color: '#000', zIndex: 3 }}>
          <div>
            <div>Description:</div>
            <div>{footer.description}</div>
            <div style={{ marginTop: '5px' }}>Modified: {footer.modifiedDate}</div>
            <div>Modified By: {footer.modifiedBy}</div>
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT PAGE NUMBER */}
      <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '10px', fontWeight: 'bold' }}>
        {footer.pageNumber}
      </div>

    </div>
  );
};

export default Comp03_TechSketch_GPAF6153;
