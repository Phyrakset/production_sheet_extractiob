import React from 'react';

/**
 * GPAR12172GD-2-specific renderer for Comp03_TechSketch
 * ──────────────────────────────────────────────────
 */
export default function Comp03_TechSketch_GPAR12172GD_2({ data, extraction, slotTitle }) {
  // Use mock data if extraction is not yet complete
  const header = extraction?.header || {
    title: "FFS 99-03-44504-SP26(DW1853) CO/NS Tech Pack YORKWELL-YORKMARS Jul-23-25",
    systemName: "Centric 8",
    sub1: "FFS 99-03-44504-SU26(DW1830)___128870",
    sub2: "FFS 99-03-44504-SU26(DW1830) CO/NS Tech Pack YORKWELL-YORKMARS Jul-23-25",
    date: "July 23, 2025 at 10:26:49 AM Pacific Daylight Time",
    sectionTitle: "Properties"
  };

  const pointerNotes = extraction?.pointerNotes || [
    { text: "穿起计帽顶外层裁片有车花 AG1189 42MM\n(配布色)——万丰车\nARITZIA 车花字母靠背面是正常向下放向\n的;花顶距帽口冚线下1/4\",左右居中;\n车花尺寸: 42MM * 8.3MM" },
    { text: "前中原身布贴车袋鼠袋,袋\n口高原身布内折3/4\"高,冚\n1/4\"双针网底\n袋:高边1/16\"车1/4\"双针平\n车线。袋顶和袋底打枣,\n衫身里面的袋顶/袋底需车圆\n形补丁 4个,每个补丁用2层\n朴." },
    { text: "帽口-帽高1 1/8\",冚1/4\"双针网底。\n帽省:四线及骨。\n帽重叠在前中,重叠阔度做2-1/4\",跟图左叠右。帽内层用主布固定\n后领落织带:离边1/16\"车单针平车线,织带停顿位置再后牛角袖过3/4\"\n注:按技术部建议试mock up:车缝时半漂泊织带客位需加大1/4\"" },
    { text: "前领/牛角骨/袖口/脚口-四线及骨,\n分骨压1/4\"双针网底,部份位置线尾需要\n打到针,避免散口" },
    { text: "袖口驳口/脚口驳口:做开骨,间单针平车线。订死骨缝\n衫脚双针网底位置止口要求包满,成品后(含水洗\n后)外露止口接受允许+1/16。\n注:下摆罗纹齐码破2块,驳骨位与侧骨对齐" }
  ];

  const footer = extraction?.footer || {
    pageNumber: "Page 1 of 28"
  };

  // Group notes for absolute positioning
  const groups = {
    topLeft: [],
    bottomLeft: [],
    topRight: [],
    midRight: [],
    bottomRight: []
  };

  pointerNotes.forEach(note => {
    const t = note.text.toLowerCase();
    if (t.includes('穿起计帽顶') || t.includes('车花')) groups.topLeft.push(note);
    else if (t.includes('袋鼠袋') || t.includes('袋顶') || t.includes('补丁')) groups.bottomLeft.push(note);
    else if (t.includes('帽口') || t.includes('帽省') || t.includes('重叠')) groups.topRight.push(note);
    else if (t.includes('前领') || t.includes('牛角骨') || t.includes('散口')) groups.midRight.push(note);
    else if (t.includes('袖口驳口') || t.includes('脚口驳口') || t.includes('下摆罗纹')) groups.bottomRight.push(note);
    else groups.midRight.push(note); // fallback
  });

  return (
    <div className="comp-section avoid-break" style={{ padding: '20px', backgroundColor: 'white', color: 'black', fontFamily: '"Arial", sans-serif' }}>
      
      {/* HEADER SECTION */}
      <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
        <div style={{ marginBottom: '5px' }}>{header.title || "FFS 99-03-44504-SP26(DW1853) CO/NS Tech Pack YORKWELL-YORKMARS Jul-23-25"}</div>
        
        <div style={{ 
          backgroundColor: '#ddd', 
          display: 'flex', 
          padding: '8px 10px',
          alignItems: 'center'
        }}>
          <div style={{ width: '10%' }}>
            <div>{header.systemName || "Centric"}</div>
            <div>{extraction?.otherInformation?.[0] || "8"}</div>
          </div>
          <div style={{ width: '25%' }}>
            <div>{extraction?.styleId?.split('_')[0] || "FFS 99-03-44504-SU26(DW1830)"}</div>
            <div>{extraction?.styleId?.split('_')[1] ? `___${extraction.styleId.split('_').pop()}` : "___128870"}</div>
          </div>
          <div style={{ width: '35%' }}>
             <div>{header.title?.split(' YORKWELL')[0] || "FFS 99-03-44504-SU26(DW1830) CO/NS Tech Pack"}</div>
             <div>{header.sub1 || "YORKWELL-YORKMARS Jul-23-25"}</div>
          </div>
          <div style={{ width: '30%', textAlign: 'right' }}>{header.sub2 || header.date || "July 23, 2025 at 10:26:49 AM Pacific Daylight Time"}</div>
        </div>
      </div>

      {/* PROPERTIES SECTION */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{header.sectionTitle}</div>
        <div style={{ borderBottom: '3px solid #000', marginTop: '5px', marginBottom: '20px' }}></div>
      </div>

      {/* MAIN SKETCH CONTAINER */}
      <div style={{ position: 'relative', width: '100%', height: '700px', backgroundColor: '#fff', overflow: 'hidden' }}>
        
        {/* SVG LAYER FOR RED LINES */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          {groups.topLeft.length > 0 && <line x1="37%" y1="28%" x2="48%" y2="35%" stroke="#ff0000" strokeWidth="1" />}
          {groups.bottomLeft.length > 0 && <line x1="35%" y1="65%" x2="45%" y2="70%" stroke="#ff0000" strokeWidth="1" />}
          
          {groups.topRight.length > 0 && <line x1="55%" y1="25%" x2="52%" y2="35%" stroke="#ff0000" strokeWidth="1" />}
          {groups.midRight.length > 0 && <line x1="58%" y1="48%" x2="51%" y2="48%" stroke="#ff0000" strokeWidth="1" />}
          
          {/* Note: In the original, the bottom right text has two lines pointing to BOTH the left cuff and right cuff. */}
          {groups.bottomRight.length > 0 && (
            <>
              <line x1="45%" y1="85%" x2="40%" y2="78%" stroke="#ff0000" strokeWidth="1" />
              <line x1="55%" y1="85%" x2="60%" y2="78%" stroke="#ff0000" strokeWidth="1" />
            </>
          )}
        </svg>

        {/* GARMENT PLACEHOLDER */}
        <div style={{ position: 'absolute', left: '50%', top: '55%', transform: 'translate(-50%, -50%)', width: '30%', height: '65%', border: '1px dashed #999', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa', zIndex: 2 }}>
          <div style={{ fontSize: '30px', color: '#ccc' }}>👕 👕</div>
          <div style={{ color: '#aaa', fontWeight: 'bold', marginTop: '10px' }}>GARMENT SKETCH</div>
          <div style={{ color: '#ccc', fontSize: '10px', marginTop: '5px' }}>[Front & Back]</div>
        </div>

        {/* TEXT BLOCKS */}
        {groups.topLeft.length > 0 && (
          <div style={{ position: 'absolute', left: '15%', top: '20%', width: '22%', zIndex: 3, fontSize: '10px', whiteSpace: 'pre-wrap' }}>
            {groups.topLeft.map((note, idx) => (
              <div key={idx}>{note.text}</div>
            ))}
          </div>
        )}

        {groups.bottomLeft.length > 0 && (
          <div style={{ position: 'absolute', left: '12%', top: '55%', width: '23%', zIndex: 3, fontSize: '10px', whiteSpace: 'pre-wrap' }}>
            {groups.bottomLeft.map((note, idx) => (
              <div key={idx}>{note.text}</div>
            ))}
          </div>
        )}

        {groups.topRight.length > 0 && (
          <div style={{ position: 'absolute', left: '55%', top: '20%', width: '30%', zIndex: 3, fontSize: '10px', whiteSpace: 'pre-wrap' }}>
            {groups.topRight.map((note, idx) => (
              <div key={idx}>{note.text}</div>
            ))}
          </div>
        )}

        {groups.midRight.length > 0 && (
          <div style={{ position: 'absolute', left: '58%', top: '46%', width: '25%', zIndex: 3, fontSize: '10px', whiteSpace: 'pre-wrap' }}>
            {groups.midRight.map((note, idx) => (
              <div key={idx}>{note.text}</div>
            ))}
          </div>
        )}

        {groups.bottomRight.length > 0 && (
          <div style={{ position: 'absolute', left: '50%', top: '85%', transform: 'translateX(-50%)', width: '60%', zIndex: 3, fontSize: '10px', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
            {groups.bottomRight.map((note, idx) => (
              <div key={idx}>{note.text}</div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '20px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold' }}>
        {footer.pageNumber}
      </div>

    </div>
  );
}
