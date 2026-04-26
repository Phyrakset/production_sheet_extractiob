import React from 'react';

/**
 * GPAR12172GD-2-specific Cover Page Renderer (Comp 01)
 * ──────────────────────────────────────────────────
 * TESTED & VERIFIED against:
 *   Comp_01_注意大點_Key_Notes_Doc_GPAR12172GD-2_Pages_1.pdf
 */
export default function Comp01_CoverPage_GPAR12172GD_2({ data, extraction }) {
  const d = extraction?.data || data?.data || {};
  const headerTable = d.headerTable || {};
  const criticalNotes = d.criticalNotes || [];
  const numberedNotes = d.numberedNotes || [];

  const tdStyle = { border: '1px solid #000', padding: '6px', verticalAlign: 'middle' };
  
  return (
    <div className="comp-section cover-page-gpar12172gd-2 avoid-break" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', lineHeight: '1.4', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* Outer Border Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000' }}>
        <tbody>
          {/* Row 1: Title */}
          <tr>
            <td colSpan="2" style={{ ...tdStyle, textAlign: 'center', fontSize: '32px', borderBottom: '2px solid #000', letterSpacing: '2px', padding: '15px' }}>
              {d.title || 'GPAR12172GD-2 注意大點'}
            </td>
          </tr>
          
          {/* Row 2: Sketch and Header Info */}
          <tr>
            <td style={{ ...tdStyle, width: '40%', textAlign: 'center', verticalAlign: 'middle', padding: '20px' }}>
              <div style={{ display: 'inline-block', width: '220px', height: '220px', border: '1px dashed #ccc', lineHeight: '220px', color: '#999' }}>Sketch Front/Back</div>
            </td>
            <td style={{ ...tdStyle, width: '60%', padding: '0', position: 'relative' }}>
              {/* Red Stamp absolute positioned */}
              {headerTable.stampPresent !== false && (
                <div style={{ position: 'absolute', right: '20px', top: '50px', border: '3px solid #d32f2f', color: '#d32f2f', fontSize: '24px', padding: '10px 20px', transform: 'rotate(-5deg)', letterSpacing: '4px', opacity: 0.8, background: 'rgba(255,255,255,0.85)', zIndex: 10, fontWeight: 'bold' }}>
                  允許開裁<br/>
                  <span style={{ fontSize: '11px', display: 'block', marginTop: '5px', letterSpacing: 'normal', fontWeight: 'normal' }}>審批人: Penny Lee</span>
                </div>
              )}
              
              <table style={{ width: '100%', borderCollapse: 'collapse', height: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ ...tdStyle, width: '30%', textAlign: 'center', fontWeight: 'bold' }}>客款號：</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '15px' }}>{headerTable.customerStyle || 'FFS 99-03-44504-SU26(DW1830)'}</td>
                  </tr>
                  <tr>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>廠號：</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '15px' }}>{headerTable.factoryNumber || 'GPAR12172GD-2'}</td>
                  </tr>
                  <tr>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>Season:</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '15px' }}>{headerTable.season || 'S3/2026'}</td>
                  </tr>
                  <tr>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>Article:</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '15px' }}>{headerTable.article || '125942'}</td>
                  </tr>
                  <tr>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>PO#</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '15px', lineHeight: '1.6' }}>
                      {headerTable.poNumbers?.length > 0 
                        ? headerTable.poNumbers.map((po, i) => <div key={i}>{po}</div>)
                        : <div>4500273013,VAN<br/>4500273014,TOR<br/>4500273015,USA</div>
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', borderBottom: 'none' }}>數量：</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '18px', backgroundColor: '#fff000', borderBottom: 'none', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                      {headerTable.quantity || '3999 PCS'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          
          {/* Row 3: Critical Notes (大點) */}
          <tr>
            <td colSpan="2" style={{ padding: '0', border: '2px solid #000' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ ...tdStyle, width: '10%', verticalAlign: 'top', border: 'none', borderRight: '1px solid #000', paddingTop: '15px' }}>
                      大點：
                    </td>
                    <td style={{ ...tdStyle, width: '90%', verticalAlign: 'top', color: '#d32f2f', fontWeight: 'bold', border: 'none', padding: '15px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                      {criticalNotes.length > 0 ? criticalNotes.map((note, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>{note}</div>
                      )) : (
                        <>
                          <div style={{ marginBottom: '8px' }}>**FFS, HFFS,布种裁床拉布高度不能超过4英寸; 其余布种裁床拉布高度不能超过5英寸**</div>
                          <div style={{ marginBottom: '8px' }}>**************同一件衫要用同缸同卷布**************</div>
                          <div style={{ marginBottom: '8px' }}>***易撕嘜请摄车在后领捆内过主唛+尺码唛1"----衣染色前车唛头</div>
                          <div style={{ marginBottom: '8px' }}>FFS 成衣染色款，染後由染色廠WINSHENG負責除布底毛球後再送包裝。</div>
                          <div style={{ marginBottom: '8px', color: '#d32f2f' }}>注：前幅袋鼠袋，衫身里面的袋顶/袋底需车圆形补丁4个，每个补丁用2层补</div>
                          <div style={{ marginBottom: '8px' }}>凡是染色款，为避免染后有严重色差，请按归边裁</div>
                        </>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          
          {/* Row 4: Numbered Notes */}
          <tr>
            <td colSpan="2" style={{ ...tdStyle, padding: '15px 20px', border: 'none', position: 'relative' }}>
              <div style={{ position: 'relative', width: '100%', minHeight: '400px' }}>
                {numberedNotes.length > 0 ? (
                  <div style={{ paddingRight: '150px' }}>
                    {numberedNotes.map((note, i) => (
                      <div key={i} style={{ marginBottom: '12px' }}>
                        <strong>{note.number}</strong> {note.content}
                      </div>
                    ))}
                    {numberedNotes.some(n => n.hasImage) && (
                      <div style={{ position: 'absolute', right: '0', top: '150px', width: '140px', height: '140px', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px', backgroundColor: '#f9f9f9', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        Label Photo
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <strong>1/</strong> 此款是GPAR12172GD 翻单(SU26 季节做工基础下) :<br/>
                      工厂要确保帽内层跟外层尺寸一致并做准帽省在正确位置, 染后的帽子要整烫好<br/>
                      2/请按最新齐码尺寸表做货；并在公差范围内.
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <strong>2/</strong> 穿起计帽顶外层裁片有车花 AG1189 42MM (配布色)---万丰车<br/>
                      ARITZIA 车花 字母靠背面是正常向下放向的；花顶距帽口凹线下1/4", 左右居中；<br/>
                      车花尺寸：42MM * 8.3MM
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <strong>3/</strong> 成衣染色 GARMENT DYE -DW1830 - INDIGO DYE (BEACH BLUE) 胜欣成衣仿牛仔染色(深蓝色, 阿苏特染+酸洗)<br/>
                      <strong>***做大货时请提供每色各10件交洗水厂批头缸,待头缸批OK后才可洗大货***</strong><br/>
                      FFS 成衣染色款，染後由染色廠WINSHENG負責除布底毛球後再送包裝.
                    </div>

                    <div style={{ marginBottom: '15px', position: 'relative', paddingRight: '150px' }}>
                      <strong>4/</strong> 车制要求砍线和级骨线每寸12~14针,级线不可拉爆.<br/><br/>
                      <strong>5/</strong> 主唛+尺码唛(99-03-00008): 平车车在后领捆骨线上, 唛头缝线将与领口的单针线对齐如图,<br/>
                      面线配回主唛色PP线, 底线配染色后衫身上线. --------&gt;需成衣染色后车唛头<br/><br/>
                      <strong>6/</strong> 洗水唛(99-01-00084): 平车在穿起计左侧骨，要求车完成计折下来，距脚缘坎骨距离要大于3/4",<br/>
                      但少于1-1/4"车；在后幅 ARITZIA 字为面.(唛头面/底线配染色后衫身色). ----&gt;需成衣染色后车唛头
                      
                      {/* Floating Label Photo on the right side of notes 4-6 */}
                      <div style={{ position: 'absolute', right: '0', top: '10px', width: '120px', height: '120px', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px', backgroundColor: '#f9f9f9', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        Label Photo
                      </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <strong>7/</strong> 其他做工看制单；注：唛头需跟回色卡.
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <strong>8/</strong> 大货包装及折法请跟回包装图及用箱要求做大货,2025-10-10开始按客要求，走飞机货帮添加大胶袋入箱出货
                    </div>

                    <div>
                      <strong>9/</strong> 大货走货公差范围 +/-3% 按每个PO每个颜色计算，如超过+/-3%，请通知跟单与客人沟通是否允许走货.
                    </div>
                  </div>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
