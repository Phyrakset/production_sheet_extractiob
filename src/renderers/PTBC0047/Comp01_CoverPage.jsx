import React from 'react';
import '../../styles.css';

export default function Comp01_CoverPage_PTBC0047({ data, extraction }) {
  const d = extraction?.data || data?.data || {};

  const title = d.title || 'PTBC0047 注意大點';
  const headerTable = d.headerTable || {};
  const notesTable = d.notesTable || [];
  const floatingNote = d.floatingNote || '9. 袋口要水平，不可歪扭，不可左右高低，注意色差';

  const tdStyle = {
    border: '1px solid #000',
    padding: '10px',
    verticalAlign: 'middle',
  };

  return (
    <div className="comp-section cover-page-ptbc0047 avoid-break" style={{ position: 'relative', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', padding: '40px', fontFamily: '"Times New Roman", SimSun, serif' }}>
      
      {/* Container for the main border to allow floating elements outside */}
      <div style={{ border: '1px solid #000' }}>
        
        {/* Title Block */}
        <div style={{ textAlign: 'center', borderBottom: '1px solid #000', padding: '15px' }}>
          <span style={{ fontSize: '32px', color: '#444', marginRight: '30px' }}>{title.split(' ')[0] || 'PTBC0047'}</span>
          <span style={{ fontSize: '38px', color: '#444', letterSpacing: '4px' }}>{title.split(' ').slice(1).join(' ') || '注意大點'}</span>
        </div>

        {/* Top Section */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, width: '30%', textAlign: 'center', padding: '10px', borderLeft: 'none', borderRight: '1px solid #000', borderTop: 'none' }} rowSpan="4">
                {/* Sketch Placeholder */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                  <div style={{ width: '110px', height: '150px', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px', backgroundColor: '#f9f9f9', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    Front Sketch
                  </div>
                  <div style={{ width: '110px', height: '150px', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px', backgroundColor: '#f9f9f9', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    Back Sketch
                  </div>
                </div>
              </td>
              <td style={{ ...tdStyle, width: '25%', textAlign: 'center', fontWeight: 'bold', fontSize: '18px', borderTop: 'none' }}>客款號：</td>
              <td style={{ ...tdStyle, width: '45%', fontWeight: 'bold', fontSize: '18px', color: '#333', borderRight: 'none', borderTop: 'none' }}>{headerTable.customerStyle || 'BLED0132C'}</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>廠號：</td>
              <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '18px', color: '#333', borderRight: 'none' }}>{headerTable.factoryNumber || 'PTBC0047'}</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>PO#</td>
              <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '18px', color: '#333', borderRight: 'none' }}>{headerTable.poNumber || 'TBA'}</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>數量：</td>
              <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '18px', color: '#333', borderRight: 'none' }}>{headerTable.quantity || '210,000 pcs'}</td>
            </tr>

            {/* Row 5: 大點 (with empty cell beside it) */}
            <tr>
              <td style={{ ...tdStyle, fontWeight: 'bold', backgroundColor: '#fff000', fontSize: '20px', paddingLeft: '10px', borderLeft: 'none', verticalAlign: 'top', padding: '15px 10px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>大點：</td>
              <td colSpan="2" style={{ ...tdStyle, borderRight: 'none' }}></td>
            </tr>
          </tbody>
        </table>

        {/* Notes Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: 'none' }}>
          <tbody>
            {notesTable.length > 0 ? (
              notesTable.map((note, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, width: '12%', textAlign: 'center', borderLeft: 'none', borderTop: 'none', fontSize: '16px' }}>{note.number}</td>
                  <td style={{ ...tdStyle, width: '88%', borderRight: 'none', borderTop: 'none', fontSize: '16px', paddingLeft: '15px' }}>{note.content}</td>
                </tr>
              ))
            ) : (
              <>
                <tr>
                  <td style={{ ...tdStyle, width: '12%', textAlign: 'center', borderLeft: 'none', borderTop: 'none', fontSize: '16px' }}>1</td>
                  <td style={{ ...tdStyle, width: '88%', borderRight: 'none', borderTop: 'none', fontSize: '16px', paddingLeft: '15px' }}>此款做成衣烫缩,请注意布的手感要與批辦一致</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '16px' }}>2</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '16px', paddingLeft: '15px' }}>拇指孔口的车线一拉就容易爆口，车线要调配好，避免大货存有此问题</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '16px' }}>3</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '16px', paddingLeft: '15px' }}>前胸植毛印花要顺直，布的条子斜度只接受1.5cm公差，从B字至H字</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '16px' }}>4</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '16px', paddingLeft: '15px' }}>布纹斜度接受3.3度, 1cm = 0.057度（前鼠袋/衫脚/后幅/袖口）</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '16px' }}>5</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '16px', paddingLeft: '15px' }}>烫衫时要注意所有子口的导向要正确</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '16px' }}>6</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '16px', paddingLeft: '15px' }}>全件针步需夠一吋 12 针，線露需調較好，保持應有的拉力，不可有拉爆線情況</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '16px' }}>7</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '16px', paddingLeft: '15px' }}>袖长尺寸改短，帽开口阔-直度加阔, 详情见尺寸表</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', borderBottom: 'none', fontSize: '16px' }}>8</td>
                  <td style={{ ...tdStyle, borderRight: 'none', borderBottom: 'none', fontSize: '16px', paddingLeft: '15px' }}>做工和尺寸要好，尺寸需控制在接受范围内</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Note (outside the main border) */}
      <div style={{ display: 'flex', width: '100%', marginTop: '10px' }}>
        <div style={{ width: '12%', textAlign: 'center', fontSize: '16px' }}>9.</div>
        <div style={{ width: '88%', fontSize: '16px', paddingLeft: '15px' }}>{floatingNote.replace(/^9\.\s*/, '')}</div>
      </div>

      {/* Red Stamp positioned at bottom center */}
      {d.stampPresent !== false && (
        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', marginLeft: '-50px' }}>
          <div style={{ border: '3px solid #f07b82', color: '#f07b82', padding: '10px 20px', textAlign: 'center', fontFamily: '"Times New Roman", SimSun, serif', transform: 'rotate(-2deg)', opacity: '0.85', width: 'fit-content' }}>
            <div style={{ fontSize: '24px', letterSpacing: '4px', marginBottom: '10px', fontWeight: 'bold' }}>允許開裁</div>
            <div style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f07b82', paddingTop: '10px' }}>
              <span>審批人:</span> <span style={{ fontSize: '20px', fontStyle: 'italic', marginLeft: '10px', marginRight: '10px' }}>李婷</span>
            </div>
            <div style={{ fontSize: '10px', borderTop: '1px solid #f07b82', paddingTop: '5px' }}>審批日期: <span style={{ fontStyle: 'italic' }}>18年4月25日</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
