import React from 'react';

export default function Comp02_OrderDetails_GPAF6153({ data, extraction }) {
  const d = extraction?.data || data?.data || {};
  const headerInfo = d.headerInfo || {};
  const metadata = d.metadata || {};
  const materials = d.materials || {};
  const sizeBreakdown = d.sizeBreakdown || [];
  const sizeTotals = d.sizeTotals || {};
  const shipments = d.shipments || [];
  const processes = d.processes || {};
  const remark = d.remark || '';
  const footerStatus = d.footerStatus || '';

  const thStyle = { border: '1px solid #000', padding: '2px 4px', fontWeight: 'normal', textAlign: 'center' };
  const tdStyle = { border: '1px solid #000', padding: '2px 4px' };
  const tableMargin = '12px';

  return (
    <div className="comp-section order-details-gpaf6153 avoid-break" style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '13px', lineHeight: '1.2', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* Header Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ width: '40%' }}>
          <table style={{ border: 'none', borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr><td style={{ width: '140px', padding: '1px' }}>CUSTOMER CODE</td><td style={{ width: '10px', padding: '1px' }}>:</td><td style={{ padding: '1px' }}>{headerInfo.customerCode || 'A & F'}</td></tr>
              <tr><td style={{ padding: '1px' }}>CUSTOMER STYLE</td><td style={{ padding: '1px' }}>:</td><td style={{ padding: '1px' }}>{headerInfo.customerStyle || '122260171 (122260171)'}</td></tr>
              <tr><td style={{ padding: '1px' }}>QUANTITY</td><td style={{ padding: '1px' }}>:</td><td style={{ padding: '1px' }}>{headerInfo.quantity || '1500 PCS'}</td></tr>
            </tbody>
          </table>
        </div>
        <div style={{ width: '20%', textAlign: 'center' }}>
          {/* Sketch placeholder */}
          <div style={{ display: 'inline-block', width: '45px', height: '65px', border: '1px dashed #ccc', textAlign: 'center', lineHeight: '65px', color: '#999', fontSize: '9px' }}>Sketch</div>
        </div>
        <div style={{ width: '40%' }}>
          <div style={{ fontSize: '16px', marginBottom: '2px', textAlign: 'right' }}>Prod. Sheet - Order Details</div>
          <div style={{ textAlign: 'right', marginBottom: '4px' }}>
            <span style={{ border: '1px solid #000', display: 'inline-block', padding: '1px 4px', fontWeight: 'bold' }}>GPAF6153</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <table style={{ border: 'none', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ width: '100px', padding: '1px' }}>PAGES</td><td style={{ width: '10px', padding: '1px' }}>:</td><td style={{ width: '80px', padding: '1px' }}>{headerInfo.pages || '1 / 1'}</td></tr>
                <tr><td style={{ padding: '1px' }}>ORDER DATE</td><td style={{ padding: '1px' }}>:</td><td style={{ padding: '1px' }}>{headerInfo.orderDate || '2026.02.26'}</td></tr>
                <tr><td style={{ padding: '1px' }}>EX FTY DATE</td><td style={{ padding: '1px' }}>:</td><td style={{ padding: '1px' }}>{headerInfo.exFtyDate || '2026.05.07'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Table 1: Metadata (Partial Width) */}
      <table style={{ borderCollapse: 'collapse', border: '1px solid #000', width: '60%', marginBottom: tableMargin }}>
        <tbody>
          <tr><td style={{...tdStyle, width: '130px'}}>CUSTOMER PO</td><td style={tdStyle}>{metadata.customerPo || '3138227'}</td></tr>
          <tr><td style={tdStyle}>CUSTOMER STY</td><td style={tdStyle}>{metadata.customerSty || 'ABERCROMBIE & FITCH'}</td></tr>
          <tr><td style={tdStyle}>SEASON</td><td style={tdStyle}>{metadata.season || 'FA26'}</td></tr>
          <tr><td style={tdStyle}>C.O.O.</td><td style={tdStyle}>{metadata.coo || 'CAM'}</td></tr>
        </tbody>
      </table>

      {/* Table 2: Materials (Full Width) */}
      <table style={{ borderCollapse: 'collapse', border: '1px solid #000', width: '100%', marginBottom: tableMargin }}>
        <thead>
          <tr>
            <th style={{...thStyle, width: '60%'}}>DESCRIPTION</th>
            <th style={{...thStyle, width: '25%'}}>COLOUR</th>
            <th style={{...thStyle, width: '15%'}}>QUANTITY</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>{materials.description || "MEN'S 70% COTTON 30% POLYESTER\nKNITTED PULLOVER"}</td>
            <td style={{...tdStyle, verticalAlign: 'top'}}>{materials.colour || '178 BIRCH'}</td>
            <td style={{...tdStyle, verticalAlign: 'top', textAlign: 'right'}}>{materials.quantity || '1,500'}</td>
          </tr>
        </tbody>
      </table>

      {/* Table 3: Size Breakdown (Full Width) */}
      <table style={{ borderCollapse: 'collapse', border: '1px solid #000', width: '100%', marginBottom: tableMargin }}>
        <thead>
          <tr>
            <th style={thStyle}>COL CODE</th>
            <th colSpan="2" style={thStyle}>COLOUR</th>
            <th style={thStyle}>XS</th>
            <th style={thStyle}>S</th>
            <th style={thStyle}>M</th>
            <th style={thStyle}>L</th>
            <th style={thStyle}>XL</th>
            <th style={thStyle}>XXL</th>
            <th style={thStyle}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {sizeBreakdown.length > 0 ? sizeBreakdown.map((row, i) => (
            <tr key={i}>
              <td style={tdStyle}>{row.colCode}</td>
              <td style={{...tdStyle, width: '10%'}}>{row.colourZh}</td>
              <td style={tdStyle}>{row.colourEn}</td>
              <td style={{...tdStyle, textAlign: 'right'}}>{row.xs}</td>
              <td style={{...tdStyle, textAlign: 'right'}}>{row.s}</td>
              <td style={{...tdStyle, textAlign: 'right'}}>{row.m}</td>
              <td style={{...tdStyle, textAlign: 'right'}}>{row.l}</td>
              <td style={{...tdStyle, textAlign: 'right'}}>{row.xl}</td>
              <td style={{...tdStyle, textAlign: 'right'}}>{row.xxl}</td>
              <td style={{...tdStyle, textAlign: 'right'}}>{row.total}</td>
            </tr>
          )) : (
            <tr>
              <td style={tdStyle}>AF030</td>
              <td style={{...tdStyle, width: '10%'}}>米白</td>
              <td style={tdStyle}>178 BIRCH</td>
              <td style={{...tdStyle, textAlign: 'right'}}>90</td>
              <td style={{...tdStyle, textAlign: 'right'}}>285</td>
              <td style={{...tdStyle, textAlign: 'right'}}>481</td>
              <td style={{...tdStyle, textAlign: 'right'}}>395</td>
              <td style={{...tdStyle, textAlign: 'right'}}>190</td>
              <td style={{...tdStyle, textAlign: 'right'}}>59</td>
              <td style={{...tdStyle, textAlign: 'right'}}>1,500</td>
            </tr>
          )}
          <tr>
            <td style={tdStyle}>TOTAL</td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
            <td style={{...tdStyle, textAlign: 'right'}}>{sizeTotals.xs || '90'}</td>
            <td style={{...tdStyle, textAlign: 'right'}}>{sizeTotals.s || '285'}</td>
            <td style={{...tdStyle, textAlign: 'right'}}>{sizeTotals.m || '481'}</td>
            <td style={{...tdStyle, textAlign: 'right'}}>{sizeTotals.l || '395'}</td>
            <td style={{...tdStyle, textAlign: 'right'}}>{sizeTotals.xl || '190'}</td>
            <td style={{...tdStyle, textAlign: 'right'}}>{sizeTotals.xxl || '59'}</td>
            <td style={{...tdStyle, textAlign: 'right'}}>{sizeTotals.total || '1,500'}</td>
          </tr>
        </tbody>
      </table>

      {/* Table 4: Shipments (Partial Width) */}
      <table style={{ borderCollapse: 'collapse', border: '1px solid #000', width: '40%', marginBottom: tableMargin }}>
        <thead>
          <tr>
            <th style={thStyle}>SHIPMENT LOTS</th>
            <th style={thStyle}>EX FTY DATE</th>
            <th style={thStyle}>QUANTITY</th>
          </tr>
        </thead>
        <tbody>
          {shipments.length > 0 ? shipments.map((s, i) => (
            <tr key={i}>
              <td style={{...tdStyle, textAlign: 'center'}}>{s.lot}</td>
              <td style={{...tdStyle, textAlign: 'center'}}>{s.exFtyDate}</td>
              <td style={{...tdStyle, textAlign: 'right'}}>{s.quantity}</td>
            </tr>
          )) : (
            <tr>
              <td style={{...tdStyle, textAlign: 'center'}}>1</td>
              <td style={{...tdStyle, textAlign: 'center'}}>2026.05.07</td>
              <td style={{...tdStyle, textAlign: 'right'}}>1,500</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Table 5: Processes (Full Width) */}
      <table style={{ borderCollapse: 'collapse', border: '1px solid #000', width: '100%', marginBottom: tableMargin }}>
        <tbody>
          <tr><td style={{...tdStyle, width: '130px'}}>PRINT</td><td style={tdStyle}>{processes.print || '无'}</td></tr>
          <tr><td style={tdStyle}>EMBROIDERY</td><td style={tdStyle}>{processes.embroidery || 'HUAYU前幅绣花'}</td></tr>
          <tr><td style={tdStyle}>WASHING</td><td style={tdStyle}>{processes.washing || 'WS-WASH:SSW/NGW 胜欣成衣普洗'}</td></tr>
          <tr><td style={tdStyle}>HEAT TRANSFER</td><td style={tdStyle}>{processes.heatTransfer || '无'}</td></tr>
        </tbody>
      </table>

      {/* Footer / Remark */}
      <div style={{ marginTop: '10px' }}>
        <p>REMARK : {remark}</p>
      </div>
      
      {/* Absolute positioned or spaced bottom footer for Status */}
      <div style={{ marginTop: '40px', paddingTop: '10px', fontSize: '11px', color: '#555', wordBreak: 'break-word', whiteSpace: 'normal', width: '100%' }}>
        {footerStatus || 'Status:     T2YM       EDIT BY MSEM.SIDAVIN DATE 2026/03/20 TIME 17:41:57   PRINT BY MMEYLY.HONG DATE 2026/03/25 TIME'}
      </div>

    </div>
  );
}
