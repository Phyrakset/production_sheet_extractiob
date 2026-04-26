import React from 'react';

/**
 * GPAF6153-specific Cover Page Renderer (Comp 01)
 * ──────────────────────────────────────────────────
 * TESTED & VERIFIED against:
 *   Comp_01_注意大點_Key_Notes_Doc_GPAF6153_Pages_1.pdf
 * 
 * This is the proven, press-matched renderer for GPAF6153's cover page.
 * It handles: header info grid, sketch area, numbered notes with
 * red-text detection (isRedText) and yellow-highlight (hasYellowHighlight).
 */
export default function Comp01_CoverPage_GPAF6153({ data, extraction }) {
  const d = extraction?.data || data?.data || {};
  const brand = extraction?.brand || data?.brand || '';
  const sketchDesc = d.sketchDescription || extraction?.summary || '';
  const notes = d.notes || [];
  const criticalWarnings = d.criticalWarnings || [];
  const factoryNumber = d.factoryNumber || '';
  const poNumber = d.poNumber || '';
  const totalQuantity = d.totalQuantity || '';

  return (
    <div className="comp-section cover-page-section gpaf6153-cover avoid-break">
      {/* Top Table: Header and Sketch/Info */}
      <table className="gpaf6153-table-top" style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', borderBottom: 'none', fontSize: '14px' }}>
        <tbody>
          {/* Row 1: Main Title */}
          <tr>
            <td colSpan="2" style={{ textAlign: 'center', fontSize: '32px', fontWeight: 'bold', padding: '10px', borderBottom: '2px solid #000', letterSpacing: '4px' }}>
              注意大点
            </td>
          </tr>
          
          {/* Row 2: Sketch and Header Info */}
          <tr>
            <td style={{ width: '60%', borderRight: '2px solid #000', padding: '20px', textAlign: 'center', verticalAlign: 'middle' }}>
              {sketchDesc && <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '10px' }}>{sketchDesc}</p>}
              {brand && <p style={{ fontWeight: 'bold', fontSize: '20px', color: '#1a365d' }}>{brand}</p>}
            </td>
            <td style={{ width: '40%', padding: '0', verticalAlign: 'top' }}>
              <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px 15px', borderBottom: '1px solid #000', borderRight: '1px solid #000', width: '30%', fontWeight: 'bold' }}>客款號：</td>
                    <td style={{ padding: '10px 15px', borderBottom: '1px solid #000', fontWeight: 'bold', fontSize: '18px' }}>{extraction?.styleId || d.styleNumber || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 15px', borderBottom: '1px solid #000', borderRight: '1px solid #000', fontWeight: 'bold' }}>廠號：</td>
                    <td style={{ padding: '10px 15px', borderBottom: '1px solid #000', fontSize: '16px' }}>{factoryNumber || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 15px', borderBottom: '1px solid #000', borderRight: '1px solid #000', fontWeight: 'bold' }}>PO#</td>
                    <td style={{ padding: '10px 15px', borderBottom: '1px solid #000', fontWeight: 'bold', fontSize: '16px' }}>{poNumber || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 15px', borderRight: '1px solid #000', fontWeight: 'bold' }}>數量：</td>
                    <td style={{ padding: '10px 15px', fontSize: '16px' }}>{totalQuantity || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bottom Table: Notes */}
      <table className="gpaf6153-table-bottom" style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', borderTop: '2px solid #000', fontSize: '14px' }}>
        <tbody>
          {/* Row 3: 大點 Header Row */}
          <tr>
            <td style={{ width: '60px', textAlign: 'center', background: 'yellow', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px', fontWeight: 'bold', fontSize: '12px' }}>大點：</td>
            <td style={{ borderBottom: '1px solid #000' }}></td>
          </tr>

          {/* Row 4+: Notes */}
          {notes.map((note, i) => {
            const rawNote = d.rawNotes?.find(rn => rn.text && (rn.text === note || rn.text.includes(note) || note.includes(rn.text)));
            const isRedText = rawNote?.isRedText || criticalWarnings.some(w => note.includes(w) || w.includes(note));
            const hasYellowHighlight = rawNote?.hasYellowHighlight || false;
            
            // Extract number from start of string if it exists
            const match = note.match(/^(\d+[\.\s]+)?(.*)$/);
            const numText = match && match[1] ? match[1].replace(/[\.\s]+$/, '') : (i + 1);
            const contentText = match && match[1] ? match[2] : note;
            
            const rowBg = hasYellowHighlight ? 'yellow' : 'transparent';
            
            return (
              <tr key={i} style={{ background: rowBg }}>
                <td style={{ width: '60px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '8px' }}>{numText}</td>
                <td style={{ 
                  fontWeight: 'bold', 
                  color: isRedText ? '#cc0000' : '#000',
                  borderBottom: '1px solid #000',
                  padding: '8px 12px'
                }}>
                  {contentText}
                </td>
              </tr>
            );
          })}
          
          {/* Render any critical warnings not already in notes */}
          {criticalWarnings.filter(w => !notes.some(n => n.includes(w) || w.includes(n))).map((w, i) => {
            const rawNote = d.rawNotes?.find(rn => rn.text && (rn.text === w || rn.text.includes(w) || w.includes(rn.text)));
            const hasYellowHighlight = rawNote?.hasYellowHighlight || false;
            
            const match = w.match(/^(\d+[\.\s]+)?(.*)$/);
            const numText = match && match[1] ? match[1].replace(/[\.\s]+$/, '') : (notes.length + i + 1);
            const contentText = match && match[1] ? match[2] : w;
            
            const rowBg = hasYellowHighlight ? 'yellow' : 'transparent';
            
            return (
              <tr key={`cw-${i}`} style={{ background: rowBg }}>
                <td style={{ width: '60px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '8px' }}>{numText}</td>
                <td style={{ 
                  fontWeight: 'bold', 
                  color: '#cc0000',
                  borderBottom: '1px solid #000',
                  padding: '8px 12px'
                }}>
                  {contentText}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
