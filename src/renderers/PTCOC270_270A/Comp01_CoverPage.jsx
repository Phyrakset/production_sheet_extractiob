import React from 'react';
import '../../styles.css';

export default function Comp01_CoverPage_PTCOC270_270A({ data, extraction }) {
  const d = extraction?.data || data?.data || {};

  const title = d.title || 'PTCOC270+270A注意大點';
  const headerTable = d.headerTable || {};
  const importantNote = d.importantNote || '注意入箱后衣服不能皱';
  const notesTable = d.notesTable || [];

  const tdStyle = {
    border: '1px solid #000',
    padding: '10px',
    verticalAlign: 'middle',
  };

  return (
    <div className="comp-section cover-page-ptcoc270 avoid-break" style={{ position: 'relative', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', padding: '40px', fontFamily: '"Times New Roman", SimSun, serif' }}>
      
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
              <td style={{ ...tdStyle, width: '45%', fontWeight: 'bold', fontSize: '18px', color: '#000', borderRight: 'none', borderTop: 'none' }}>{headerTable.customerStyle || 'STCO4143'}</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>廠號：</td>
              <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '18px', color: '#000', borderRight: 'none' }}>{headerTable.factoryNumber || 'PTCOC270/270A'}</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>PO#</td>
              <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '18px', color: '#000', borderRight: 'none' }}>{headerTable.poNumber || 'TBA'}</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>數量：</td>
              <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '18px', color: '#000', borderRight: 'none', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{headerTable.quantity || 'PTCOC270:163744pcs\nPTCOC270A:4416pcs'}</td>
            </tr>

            {/* Row 5: 大點 (with important note beside it) */}
            <tr>
              <td style={{ ...tdStyle, fontWeight: 'bold', backgroundColor: '#fff000', fontSize: '20px', paddingLeft: '10px', borderLeft: 'none', verticalAlign: 'top', padding: '15px 10px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>大點：</td>
              <td colSpan="2" style={{ ...tdStyle, borderRight: 'none', textAlign: 'center', color: 'red', fontSize: '24px', letterSpacing: '2px', fontWeight: 'bold' }}>{importantNote}</td>
            </tr>
          </tbody>
        </table>

        {/* Notes Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: 'none' }}>
          <tbody>
            {notesTable.length > 0 ? (
              notesTable.map((note, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, width: '8%', textAlign: 'center', borderLeft: 'none', borderTop: 'none', borderBottom: i === notesTable.length - 1 ? 'none' : '1px solid #000', fontSize: '14px', verticalAlign: 'top' }}>{note.number}</td>
                  <td style={{ ...tdStyle, width: '92%', borderRight: 'none', borderTop: 'none', borderBottom: i === notesTable.length - 1 ? 'none' : '1px solid #000', fontSize: '14px', paddingLeft: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{note.content}</td>
                </tr>
              ))
            ) : (
              <>
                <tr>
                  <td style={{ ...tdStyle, width: '8%', textAlign: 'center', borderLeft: 'none', borderTop: 'none', fontSize: '14px' }}>1</td>
                  <td style={{ ...tdStyle, width: '92%', borderRight: 'none', borderTop: 'none', fontSize: '14px', paddingLeft: '10px' }}>全件車縫針步 12-13針、 調較好針步鬆緊度，不可有跳線、 鬆線、 掉線、 拉爆情況</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>2</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>腰位間鎖鍊底隧道線闊窄要均勻; 后中位重叠線位不可過長，及要整潔平順</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>3</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>駁腰位骨需平順勿起拱或起皺、 溶位需均勻</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>4</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>斜插袋左右長度要一致，左右口袋需对称，不可大小</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>5</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>褲頭繩需順正方向、 内裏不能扭曲，在后中要打枣，外露部份要對稱，長短一致</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>6</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>熨畫需管控好質量，注意銀光效果，成衣不能重压烫</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>7</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>整件衫不同部位不可出现色差，尺寸要求控制在客人要求的公差范围内</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px', verticalAlign: 'top' }}>8</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px', lineHeight: '1.5' }}>駁頭夾褲身的駁骨重線位在穿計左側后幅、不能在后中太當眼、重線長度不能超過3/4"，所有駁骨重線位都需在側骨位，腳位重線在內脾骨（穿計后幅，長度不能超過3/4"）。</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>9</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>褲腳左右要對稱，不能有長短</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', fontSize: '14px' }}>10</td>
                  <td style={{ ...tdStyle, borderRight: 'none', fontSize: '14px', paddingLeft: '10px' }}>此款做成衣燙縮</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: 'center', borderLeft: 'none', borderBottom: 'none', fontSize: '14px', verticalAlign: 'top' }}>11</td>
                  <td style={{ ...tdStyle, borderRight: 'none', borderBottom: 'none', fontSize: '14px', paddingLeft: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    PP办评语:<br />
                    1. 尺寸OK<br />
                    2. 腰掛牌車線不整洁，但位置正确，请改善車線問題<br />
                    3. 褲頭帶要綁，收到部份辦沒有綁上，請確保大貨包裝必須正確<br />
                    4. 大貨包裝浪位必須折入<br />
                    5. 掛牌應打在穿起計右邊<br />
                    6. 若紙箱因為不同碼又有空位，客人現時可接受加可循環再用的卡紙，但必須提前申請及提供圖片作批核<br />
                    7. <b>PPS批生產做大貨，但必須留意此款包裝，不可以皺。此款第一單貨曾經客人投訴皺而要全批翻燙</b>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Red Stamp positioned over Notes 9 and 10 */}
        {d.stampPresent !== false && (
          <div style={{ position: 'absolute', bottom: '100px', right: '50px', border: '3px solid #f07b82', color: '#f07b82', padding: '10px 20px', textAlign: 'center', fontFamily: '"Times New Roman", SimSun, serif', transform: 'rotate(-2deg)', opacity: '0.85', width: '180px', backgroundColor: 'rgba(255,255,255,0.8)' }}>
            <div style={{ fontSize: '24px', letterSpacing: '4px', marginBottom: '10px', fontWeight: 'bold' }}>允許開裁</div>
            <div style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f07b82', paddingTop: '10px' }}>
              <span>審批人:</span> <span style={{ fontSize: '20px', fontStyle: 'italic', marginLeft: '10px', marginRight: '10px' }}>李婷</span>
            </div>
            <div style={{ fontSize: '10px', borderTop: '1px solid #f07b82', paddingTop: '5px' }}>審批日期: <span style={{ fontStyle: 'italic', color: '#44b5d6' }}>20年11月30日</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
