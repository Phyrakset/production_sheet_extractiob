import React from 'react';

/**
 * GPRT00077C-specific Cover Page Renderer (Comp 01)
 * ──────────────────────────────────────────────────
 * PRESS-MATCHED against: Comp_01_注意大點_Key_Notes_Doc_GPRT00077C_Pages_1.pdf
 */
export default function Comp01_CoverPage_GPRT00077C({ data, extraction }) {
  const d = extraction?.data || data?.data || {};
  
  // Use extracted data if available, fallback to press-matched defaults
  const styleNumber = d.styleNumber || extraction?.styleId || 'W02-490014';
  const factoryNumber = d.factoryNumber || 'GPRT00077C';
  const poNumber = d.poNumber || '709331';
  const totalQuantity = d.totalQuantity || '3,200 pcs';
  const retailOrder = d.retailOrder || d.retail || '要PO#+RETEK 组合唛';
  
  const sketchDesc = d.sketchDescription || extraction?.summary || 'Front and back views of a t-shirt sketch are visible.';
  const notes = d.notes || [
    "GPRT00077C W02-490014 前幅印花 ( PP办评语看附页明细 )",
    "圆起的数量加裁+10%",
    "中查明细表如图"
  ];

  return (
    <div className="comp-section avoid-break" style={{ 
      border: '2px solid #000', 
      padding: 0, 
      margin: '0 auto', 
      background: 'white', 
      color: 'black',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
        <div style={{ 
          flex: 1, 
          padding: '10px 20px', 
          fontSize: '24px', 
          fontWeight: 'bold', 
          borderRight: '2px solid #000', 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          GPRT00077C
        </div>
        <div style={{ 
          flex: 2, 
          padding: '10px', 
          fontSize: '36px', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          letterSpacing: '8px'
        }}>
          注意大點
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
        {/* SKETCHES */}
        <div style={{ 
          flex: 1, 
          borderRight: '2px solid #000', 
          padding: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
           {/* Placeholder for sketch images */}
           <div style={{ border: '1px dashed #ccc', padding: '40px 20px', textAlign: 'center', color: '#666', fontSize: '12px', width: '100%' }}>
             [ T-Shirt Sketches Placeholder ]<br/><br/>
             {sketchDesc}
           </div>
        </div>
        
        {/* INFO TABLE */}
        <div style={{ flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', height: '100%', fontSize: '16px' }}>
            <tbody>
              <tr>
                <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '12px', fontWeight: 'bold', width: '30%', textAlign: 'center' }}>客款號:</td>
                <td style={{ borderBottom: '1px solid #000', padding: '12px', fontWeight: 'bold' }}>{styleNumber}</td>
              </tr>
              <tr>
                <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>廠號:</td>
                <td style={{ borderBottom: '1px solid #000', padding: '12px', fontWeight: 'bold' }}>{factoryNumber}</td>
              </tr>
              <tr>
                <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>PO#</td>
                <td style={{ borderBottom: '1px solid #000', padding: '12px', fontWeight: 'bold' }}>{poNumber}</td>
              </tr>
              <tr>
                <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>數量:</td>
                <td style={{ borderBottom: '1px solid #000', padding: '12px', fontWeight: 'bold' }}>{totalQuantity}</td>
              </tr>
              <tr>
                <td style={{ borderRight: '1px solid #000', padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>Retail单</td>
                <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '18px' }}>{retailOrder}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* NOTES TITLE */}
      <div style={{ 
        background: '#ffff00', 
        padding: '6px 12px', 
        borderBottom: '1px solid #000', 
        fontWeight: 'bold', 
        fontSize: '18px' 
      }}>
        大點 :
      </div>

      {/* NOTES CONTENT */}
      <div style={{ padding: '10px 15px', color: '#0000ff', fontWeight: 'bold', fontSize: '15px', lineHeight: '1.6' }}>
        {notes.map((note, i) => {
          // Identify red strikethrough based on note content or index
          const isStrikethrough = note.includes("加裁") && note.includes("10%");
          const text = note.replace(/^\d+[\.\s]*/, ''); // Remove leading numbers
          
          return (
            <div key={i}>
              {i + 1}. {isStrikethrough ? (
                <span style={{ textDecoration: 'line-through', textDecorationColor: 'red', textDecorationThickness: '2px', color: 'red' }}>
                  {text}
                </span>
              ) : (
                <span>{text}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* DYNAMIC TABLES (Hardcoded layout for exact press-matching) */}
      <div style={{ padding: '15px 25px' }}>
        
        {/* First Data Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', fontSize: '12px', textAlign: 'center', marginBottom: '25px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '6px' }}>款號/STYLE</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>颜色/COLOR</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>M码(件)</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>用途</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', lineHeight: '1.4' }}>
                GPRT00077C<br/>W02-490014<br/>大货需加裁抽办数量
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', lineHeight: '1.4' }}>
                611 RED OCHRE COTE D'AZUR STRIPE<br/>(3004B stripe Spellbound /Snow White )<br/>深蓝/米白间条
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', background: '#ffff00', fontSize: '14px' }}>
                5 pc
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', lineHeight: '1.4' }}>
                中查生产办<br/>+船头办+留底办
              </td>
            </tr>
            <tr>
              <td colSpan="2" style={{ border: '1px solid #000', padding: '6px 15px', textAlign: 'right', fontSize: '11px' }}>Total 合计:</td>
              <td colSpan="2" style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', fontSize: '14px' }}>5 pc</td>
            </tr>
          </tbody>
        </table>

        {/* Second Data Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', fontSize: '12px', textAlign: 'center' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '4px', lineHeight: '1.2' }}>款號/STYLE...<br/><span style={{color: 'red'}}>中查明细表</span></th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>颜色/COLOR</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>订单数</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>XXS</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>XS</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>S</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>M</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>L</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>XL</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>XXL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', lineHeight: '1.3' }}>
                GPRT00077C<br/>W02-490014<br/>PO#709331
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', fontSize: '10px', lineHeight: '1.3' }}>
                611 RED OCHRE COTE<br/>D'AZUR STRIPE<br/>(3004B stripe Spellbound<br/>/Snow White)<br/>深蓝/米白间条
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>
                3200
              </td>
              <td colSpan="7" style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold', background: '#55ff55', lineHeight: '1.5' }}>
                第1个颜色齐码共30件<br/>
                每色S/M各4件<br/>
                共30件 (包括洗水测试办<br/>
                M码=1件，中查前要有洗水报告)<br/>
                E-COM办不需要抽
              </td>
            </tr>
          </tbody>
        </table>
        
        {/* APPROVAL STAMP PLACEHOLDER */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px', marginBottom: '20px' }}>
           <div style={{ border: '2px solid rgba(255, 105, 180, 0.5)', padding: '10px', color: 'rgba(255, 105, 180, 0.5)', textAlign: 'center', width: '160px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '6px', marginBottom: '8px' }}>允許開裁</div>
              <div style={{ fontSize: '13px', color: 'blue', fontWeight: 'bold', lineHeight: '1.3' }}>KIM + DEE<br/>2025.2.5</div>
              <div style={{ fontSize: '11px', marginTop: '8px' }}>审批日期 : &nbsp;&nbsp;&nbsp;年 &nbsp;&nbsp;&nbsp;月 &nbsp;&nbsp;&nbsp;日</div>
           </div>
        </div>
      </div>
    </div>
  );
}
