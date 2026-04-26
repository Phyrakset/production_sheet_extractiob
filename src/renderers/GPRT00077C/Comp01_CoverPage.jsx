import React from 'react';
import '../../styles.css'; // Make sure to use existing styles if any

export default function Comp01_CoverPage_GPRT00077C({ data, extraction }) {
  // Use either the new extraction format or fallback to raw data
  const d = extraction?.data || data?.data || {};

  // Extract structured data with fallbacks
  const title = d.title || 'GPRT00077C 注意大點';
  const headerTable = d.headerTable || {};
  const keyNotes = d.keyNotes || [];
  const tableA = d.tableA || {};
  const tableB = d.tableB || {};

  // Common styles
  const tdStyle = {
    border: '1px solid #000',
    padding: '8px',
    verticalAlign: 'middle',
  };

  return (
    <div className="comp-section cover-page-gprt00077c avoid-break" style={{ position: 'relative', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Title Block */}
      <div style={{ display: 'flex', alignItems: 'flex-end', border: '1px solid #000', borderBottom: 'none', padding: '10px 20px' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{title.split(' ')[0] || 'GPRT00077C'}</div>
        <div style={{ flexGrow: 1, textAlign: 'center', fontSize: '32px', letterSpacing: '2px' }}>{title.split(' ').slice(1).join(' ') || '注意大點'}</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000' }}>
        <tbody>
          {/* Top Section */}
          <tr>
            <td style={{ ...tdStyle, width: '40%', textAlign: 'center', verticalAlign: 'middle', padding: '10px' }} rowSpan="4">
              {/* Sketch Placeholder */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <div style={{ width: '100px', height: '140px', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px', backgroundColor: '#f9f9f9', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  Front Sketch
                </div>
                <div style={{ width: '100px', height: '140px', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px', backgroundColor: '#f9f9f9', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  Back Sketch
                </div>
              </div>
            </td>
            <td style={{ ...tdStyle, width: '25%', textAlign: 'center', fontWeight: 'bold' }}>客款號：</td>
            <td style={{ ...tdStyle, width: '35%', fontWeight: 'bold', fontSize: '16px' }}>{headerTable.customerStyle || 'W02-490014'}</td>
          </tr>
          <tr>
            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>廠號：</td>
            <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '16px' }}>{headerTable.factoryNumber || 'GPRT00077C'}</td>
          </tr>
          <tr>
            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>PO#</td>
            <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '16px' }}>{headerTable.poNumber || '709331'}</td>
          </tr>
          <tr>
            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>數量：</td>
            <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '16px' }}>{headerTable.quantity || '3,200 pcs'}</td>
          </tr>

          {/* Row 5: 大點 & Retail单 */}
          <tr>
            <td style={{ ...tdStyle, fontWeight: 'bold', backgroundColor: '#fff000', fontSize: '18px', paddingLeft: '10px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>大點：</td>
            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>Retail单</td>
            <td style={{ ...tdStyle, fontWeight: 'bold' }}>{headerTable.retailOrder || '要PO#+RETEK 组合唛'}</td>
          </tr>

          {/* Key Notes (Blue Text) */}
          <tr>
            <td colSpan="3" style={{ ...tdStyle, padding: '10px', borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
              {keyNotes.length > 0 ? (
                keyNotes.map((note, i) => (
                  <div key={i} style={{ color: 'blue', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                    {note.isStrikethrough ? (
                      <span style={{ position: 'relative' }}>
                        {note.number}{note.text}
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: 'red' }}></div>
                      </span>
                    ) : (
                      <>{note.number}{note.text}</>
                    )}
                  </div>
                ))
              ) : (
                <>
                  <div style={{ color: 'blue', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>1.GPRT00077C W02-490014 前幅印花（PP办评语看附页明细）</div>
                  <div style={{ color: 'blue', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', position: 'relative', display: 'inline-block' }}>
                    2.圈起的数量加裁+10%
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: 'red', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
                  </div>
                  <div style={{ color: 'blue', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>3.中查明细表如图</div>
                </>
              )}
            </td>
          </tr>

          {/* Table A (M码 usage) */}
          <tr>
            <td colSpan="3" style={{ ...tdStyle, padding: '20px' }}>
              <table style={{ width: '80%', margin: '0 auto', borderCollapse: 'collapse', border: '1px solid #000' }}>
                <thead>
                  <tr>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>款號/STYLE</th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>顏色/COLOR</th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>M码(件)</th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>用途</th>
                  </tr>
                </thead>
                <tbody>
                  {tableA.rows && tableA.rows.length > 0 ? (
                    tableA.rows.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...tdStyle, textAlign: 'center', fontSize: '12px', whiteSpace: 'pre-line' }}>{row.style}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontSize: '12px', whiteSpace: 'pre-line' }}>{row.color}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontSize: '12px', backgroundColor: '#fff000', fontWeight: 'bold', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{row.mSizeCount}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontSize: '12px', whiteSpace: 'pre-line' }}>{row.usage}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={{ ...tdStyle, textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        GPRT00077C<br/>W02-490014<br/>大货需加裁抽办数量
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        611 RED OCHRE COTE D'AZUR STRIPE<br/>(3004B stripe Spellbound /Snow White)<br/>深蓝/米白间条
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontSize: '14px', backgroundColor: '#fff000', fontWeight: 'bold', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        5 pc
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        中查生产办<br/>+船头办+留底办
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="2" style={{ ...tdStyle, textAlign: 'right', fontSize: '12px' }}>Total 合计:</td>
                    <td colSpan="2" style={{ ...tdStyle, textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>{tableA.total || '5 pc'}</td>
                  </tr>
                </tbody>
              </table>

              <br />

              {/* Table B (中查明细表) */}
              <table style={{ width: '100%', margin: '0 auto', borderCollapse: 'collapse', border: '1px solid #000' }}>
                <thead>
                  <tr>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>
                      款號/STYLE---<br/><span style={{ color: 'red' }}>中查明细表</span>
                    </th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>颜色/COLOR</th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>订单数</th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>XXS</th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>XS</th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>S</th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>M</th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>L</th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>XL</th>
                    <th style={{ ...tdStyle, textAlign: 'center', fontSize: '12px' }}>XXL</th>
                  </tr>
                </thead>
                <tbody>
                  {tableB.rows && tableB.rows.length > 0 ? (
                    tableB.rows.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'pre-line' }}>{row.style}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'pre-line' }}>{row.color}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontSize: '11px' }}>{row.orderCount}</td>
                        <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#66ff66', whiteSpace: 'pre-line', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                          {row.sizeDetails}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                        GPRT00077C<br/>W02-490014<br/>PO#709331
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                        611 RED OCHRE COTE<br/>D'AZUR STRIPE<br/>(3004B stripe Spellbound<br/>/Snow White)<br/>深蓝/米白间条
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontSize: '11px' }}>3200</td>
                      <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#66ff66', padding: '10px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        第1个颜色齐码共30件<br/>
                        每色S/M各4件<br/>
                        共30件 (包括洗水测试办)<br/>
                        M码=1件，中查前要有洗水报告)<br/>
                        E-COM办不需要抽
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Spacer for red stamp at bottom right */}
              <div style={{ minHeight: '100px' }}></div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Red Stamp positioned at bottom right */}
      {d.stampPresent !== false && (
        <div style={{ position: 'absolute', right: '40px', bottom: '40px', border: '3px solid #d32f2f', color: '#d32f2f', padding: '8px 15px', textAlign: 'center', fontFamily: 'sans-serif', fontWeight: 'bold', transform: 'rotate(-5deg)', opacity: '0.85', zIndex: 10 }}>
          <div style={{ fontSize: '18px', letterSpacing: '4px', marginBottom: '5px' }}>允許開裁</div>
          <span style={{ fontSize: '12px', display: 'block', color: 'blue' }}>KIM + DEE<br/>2025.2.5</span>
          <div style={{ fontSize: '8px', color: '#d32f2f', marginTop: '2px', borderTop: '1px solid #d32f2f', paddingTop: '2px' }}>審批日期: &nbsp;&nbsp;&nbsp;&nbsp;年 &nbsp;&nbsp;&nbsp;&nbsp;月 &nbsp;&nbsp;&nbsp;&nbsp;日</div>
        </div>
      )}
    </div>
  );
}
