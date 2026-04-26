import React from 'react';
import '../../styles.css';

export default function Comp01_CoverPage_PTCOM227({ data, extraction }) {
  const d = extraction?.data || data?.data || {};

  const title = d.title || 'PTCOM227注意大點';
  const headerTable = d.headerTable || {};
  const importantNote = d.importantNote || '大货成衣烫缩';
  const notesTable = d.notesTable || [];

  const tdStyle = {
    border: '1px solid #000',
    padding: '10px',
    verticalAlign: 'middle',
  };

  return (
    <div className="comp-section cover-page-ptcom227 avoid-break" style={{ position: 'relative', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', padding: '40px', fontFamily: '"Times New Roman", SimSun, serif' }}>
      
      {/* Container for the main border */}
      <div style={{ border: '2px solid #000', position: 'relative' }}>
        
        {/* Title Block */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', padding: '15px' }}>
          <span style={{ fontSize: '38px', color: '#000', fontWeight: 'bold', letterSpacing: '2px' }}>{title}</span>
        </div>

        {/* Top Section */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, width: '35%', textAlign: 'center', padding: '10px', borderLeft: 'none', borderRight: '1px solid #000', borderTop: 'none' }} rowSpan="4">
                {/* Sketch Placeholder */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                  <div style={{ width: '150px', height: '150px', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px', backgroundColor: '#f9f9f9', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    Sketch Placeholder
                  </div>
                </div>
              </td>
              <td style={{ ...tdStyle, width: '20%', textAlign: 'center', fontWeight: 'bold', fontSize: '18px', borderTop: 'none' }}>客款號：</td>
              <td style={{ ...tdStyle, width: '45%', fontWeight: 'bold', fontSize: '18px', color: '#000', borderRight: 'none', borderTop: 'none' }}>{headerTable.customerStyle || '3AFESHSP1-571'}</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>廠號：</td>
              <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '18px', color: '#000', borderRight: 'none' }}>{headerTable.factoryNumber || 'PTCOM227'}</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>PO#</td>
              <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '18px', color: '#000', borderRight: 'none' }}>{headerTable.poNumber || 'A001559'}</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>數量：</td>
              <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '18px', color: '#000', borderRight: 'none' }}>{headerTable.quantity || '8,005 pcs'}</td>
            </tr>

            {/* Row 5: 大點 (with yellow background extending across both cells) */}
            <tr>
              <td style={{ ...tdStyle, fontWeight: 'bold', backgroundColor: '#fff000', fontSize: '20px', paddingLeft: '10px', borderLeft: 'none', verticalAlign: 'top', padding: '10px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>大點：</td>
              <td colSpan="2" style={{ ...tdStyle, borderRight: 'none', backgroundColor: '#fff000', color: 'red', fontSize: '16px', fontWeight: 'bold', textAlign: 'left', paddingLeft: '10px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{importantNote}</td>
            </tr>
          </tbody>
        </table>

        {/* Notes Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: 'none' }}>
          <tbody>
            {notesTable.length > 0 ? (
              notesTable.map((note, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, width: '10%', textAlign: 'center', borderLeft: 'none', borderTop: 'none', borderBottom: i === notesTable.length - 1 ? 'none' : '1px solid #000', fontSize: '14px', verticalAlign: 'top' }}>{note.number}</td>
                  <td style={{ ...tdStyle, width: '90%', borderRight: 'none', borderTop: 'none', borderBottom: i === notesTable.length - 1 ? 'none' : '1px solid #000', fontSize: '14px', paddingLeft: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{note.content}</td>
                </tr>
              ))
            ) : (
              <>
                <tr>
                  <td style={{ ...tdStyle, width: '10%', textAlign: 'center', borderLeft: 'none', borderTop: 'none', fontSize: '14px' }}>1</td>
                  <td style={{ ...tdStyle, width: '90%', borderRight: 'none', borderTop: 'none', fontSize: '14px', paddingLeft: '10px' }}>烫画不可歪斜，要居中，不可升华，洗水15次不可脱落或断裂</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>2</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>整件裤不同部位不可出现色差</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>3</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>所有止口和冚车底都不能毛边</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>4</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>腰头顶及腰骨的车线松紧度要调好，定位线一定要拉爆后才能出货</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>5</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>丈根溶位要均匀，不可起波浪</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>6</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>前浪顶位置要圆顺，不能是"V"</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>7</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>一寸12针，车线需调试好松紧度，注意线的手感不能太"鞋"，要柔软平滑，也不可有拉爆线的情况</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>8</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>口袋要左右对称，位置高低要一致，袋口要平顺，不能笑口</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>9</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>做工和尺寸要好，尺寸需控制在公差范围内</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>10</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>此款做成衣烫缩</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>11</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>左右侧骨口袋改为做无缝，袋口原身布折入1/2”，做无缝</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', borderBottom: 'none', fontSize: '14px' }}>12</td>
                  <td style={{ ...tdStyle, borderRight: 'none', borderBottom: 'none', fontSize: '14px', paddingLeft: '10px' }}>洗水唛位置：穿计左前幅，距离前中5"</td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Red Stamp positioned floating at the bottom right */}
        {d.stampPresent !== false && (
          <div style={{ position: 'absolute', bottom: '-40px', right: '40px', border: '3px solid #f07b82', color: '#f07b82', padding: '10px 20px', textAlign: 'center', fontFamily: '"Times New Roman", SimSun, serif', transform: 'rotate(-2deg)', opacity: '0.85', width: '180px', backgroundColor: 'rgba(255,255,255,0.8)' }}>
            <div style={{ fontSize: '24px', letterSpacing: '4px', marginBottom: '10px', fontWeight: 'bold' }}>允許開裁</div>
            <div style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f07b82', paddingTop: '10px' }}>
              <span>審批人:</span> <span style={{ fontSize: '20px', fontStyle: 'italic', marginLeft: '10px', marginRight: '10px' }}>李婷</span>
            </div>
            <div style={{ fontSize: '10px', borderTop: '1px solid #f07b82', paddingTop: '5px' }}>審批日期: <span style={{ fontStyle: 'italic', color: '#44b5d6' }}>20年12月08日</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
