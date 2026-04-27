import React from 'react';

const Comp02_OrderDetails_GPRT00077C = ({ data, extraction }) => {
  const d = extraction?.data || data || {};
  if (!Object.keys(d).length) return null;

  const { header, poDetails, productDescription, sizeBreakdown, shipmentLots, processes, remark, footerStatus } = d;

  // Table generic styles
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontFamily: '"Times New Roman", Times, serif', fontSize: '12px' };
  const thStyle = { border: '1px solid black', padding: '2px 4px', textAlign: 'center', backgroundColor: '#fff', fontWeight: 'normal' };
  const tdStyle = { border: '1px solid black', padding: '2px 4px', textAlign: 'left', verticalAlign: 'top' };
  const tdCenterStyle = { ...tdStyle, textAlign: 'center' };

  // Group sizes into arrays of up to 7 sizes for wrapping rows if needed
  const renderSizeBreakdowns = () => {
    if (!sizeBreakdown || !sizeBreakdown.length) return null;

    return sizeBreakdown.map((item, idx) => {
      const sizeKeys = Object.keys(item.sizes || {});
      const chunkSize = 7;
      const chunks = [];
      for (let i = 0; i < sizeKeys.length; i += chunkSize) {
        chunks.push(sizeKeys.slice(i, i + chunkSize));
      }

      // Try to split colour if it contains English and Chinese parts (for GPRT00077C)
      let colorPart1 = item.colour || '';
      let colorPart2 = '';
      const splitMatch = colorPart1.match(/^([\u4e00-\u9fa5/]+)\s*(.*)/);
      if (splitMatch) {
        colorPart1 = splitMatch[1];
        colorPart2 = splitMatch[2];
      }

      return chunks.map((chunk, chunkIdx) => (
        <table key={`${idx}-${chunkIdx}`} style={{ ...tableStyle, marginBottom: chunkIdx === chunks.length - 1 ? '20px' : '0', borderBottom: chunkIdx === chunks.length - 1 ? '1px solid black' : 'none' }}>
          <thead>
            <tr>
              {chunkIdx === 0 && <th style={{ ...thStyle, width: '10%' }}>COL CODE</th>}
              {chunkIdx === 0 && <th colSpan={colorPart2 ? 2 : 1} style={{ ...thStyle, width: '30%' }}>COLOUR</th>}
              {chunkIdx !== 0 && <th colSpan={colorPart2 ? 3 : 2} style={{ ...thStyle, width: '40%' }}></th>}
              {chunk.map((size) => (
                <th key={size} style={{ ...thStyle, width: `${50 / chunk.length}%` }}>{size}</th>
              ))}
              <th style={{ ...thStyle, width: '10%' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {chunkIdx === 0 && <td style={tdStyle}>{item.colCode}</td>}
              {chunkIdx === 0 && <td style={tdStyle}>{colorPart1}</td>}
              {chunkIdx === 0 && colorPart2 && <td style={tdStyle}>{colorPart2}</td>}
              {chunkIdx !== 0 && <td colSpan={colorPart2 ? 3 : 2} style={{ ...tdStyle, borderTop: 'none', borderBottom: 'none' }}></td>}
              {chunk.map((size) => (
                <td key={size} style={tdCenterStyle}>{item.sizes[size] !== undefined ? item.sizes[size].toLocaleString() : ''}</td>
              ))}
              <td style={tdCenterStyle}>{chunkIdx === 0 ? '' : item.total?.toLocaleString()}</td>
            </tr>
            <tr>
              {chunkIdx === 0 ? <td style={tdStyle}>TOTAL</td> : <td colSpan={colorPart2 ? 3 : 2} style={{ ...tdStyle, borderTop: 'none', borderBottom: 'none' }}>{chunkIdx === chunks.length - 1 ? 'TOTAL' : ''}</td>}
              {chunkIdx === 0 && <td style={tdStyle}></td>}
              {chunkIdx === 0 && colorPart2 && <td style={tdStyle}></td>}
              {chunk.map((size) => (
                <td key={`total-${size}`} style={tdCenterStyle}>{chunkIdx === 0 ? item.sizes[size]?.toLocaleString() : ''}</td>
              ))}
              <td style={tdCenterStyle}>{chunkIdx === 0 ? '' : item.total?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      ));
    });
  };

  return (
    <div style={{ padding: '40px', backgroundColor: 'white', color: 'black', fontFamily: '"Times New Roman", Times, serif', minHeight: '100%', position: 'relative' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        
        {/* Left Section */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '20px', marginBottom: '20px', whiteSpace: 'nowrap' }}>
            Yorkmars (Cambodia) Garment MFG. Co. Ltd.
          </div>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginTop: '10px' }}>
            <tbody>
              <tr>
                <td style={{ width: '130px', padding: '1px 0' }}>CUSTOMER CODE</td>
                <td style={{ padding: '1px 0' }}>: {header?.customerCode || 'RT'}</td>
              </tr>
              <tr>
                <td style={{ padding: '1px 0' }}>CUSTOMER STYLE</td>
                <td style={{ padding: '1px 0' }}>: {header?.customerStyle || 'W02-490014 (W02-490014)'}</td>
              </tr>
              <tr>
                <td style={{ padding: '1px 0' }}>QUANTITY</td>
                <td style={{ padding: '1px 0' }}>: {header?.quantity || '3200 PCS'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Middle Section: Images */}
        <div style={{ flex: '0 0 auto', display: 'flex', gap: '5px', marginTop: '20px', marginRight: '20px' }}>
          <div style={{ width: '60px', height: '80px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>
            Front
          </div>
          <div style={{ width: '60px', height: '80px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>
            Back
          </div>
        </div>

        {/* Right Section */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: '16px', marginBottom: '10px' }}>
            Prod. Sheet - Order Details
          </div>
          <div style={{ display: 'inline-block', border: '1px solid black', padding: '2px 8px', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>
            {header?.factoryNumber || 'GPRT00077C'}
          </div>
          <table style={{ width: '200px', marginLeft: 'auto', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '80px', padding: '1px 0' }}>PAGES</td>
                <td style={{ padding: '1px 0' }}>: {header?.pages || '1 / 1'}</td>
              </tr>
              <tr>
                <td style={{ padding: '1px 0' }}>ORDER DATE</td>
                <td style={{ padding: '1px 0' }}>: {header?.orderDate || '2024.12.02'}</td>
              </tr>
              <tr>
                <td style={{ padding: '1px 0' }}>EX FTY DATE</td>
                <td style={{ padding: '1px 0' }}>: {header?.exFtyDate || '2025.04.11'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER PO TABLE */}
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={{ ...tdStyle, width: '20%' }}>CUSTOMER PO</td>
            <td style={tdStyle}>{poDetails?.customerPo}</td>
          </tr>
          <tr>
            <td style={tdStyle}>CUSTOMER STY</td>
            <td style={tdStyle}>{poDetails?.customerStyleDesc || poDetails?.customerStyle}</td>
          </tr>
          <tr>
            <td style={tdStyle}>SEASON</td>
            <td style={tdStyle}>{poDetails?.season}</td>
          </tr>
          <tr>
            <td style={tdStyle}>C.O.O.</td>
            <td style={tdStyle}>{poDetails?.coo}</td>
          </tr>
        </tbody>
      </table>

      {/* DESCRIPTION TABLE */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '45%' }}>DESCRIPTION</th>
            <th style={{ ...thStyle, width: '40%' }}>COLOUR</th>
            <th style={{ ...thStyle, width: '15%' }}>QUANTITY</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>{productDescription?.description}</td>
            <td style={tdStyle}>{productDescription?.colour}</td>
            <td style={tdCenterStyle}>{productDescription?.quantity?.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* SIZE BREAKDOWN */}
      {renderSizeBreakdowns()}

      {/* SHIPMENT LOTS */}
      <table style={{ ...tableStyle, width: '50%' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '30%' }}>SHIPMENT LOTS</th>
            <th style={{ ...thStyle, width: '40%' }}>EX FTY DATE</th>
            <th style={{ ...thStyle, width: '30%' }}>QUANTITY</th>
          </tr>
        </thead>
        <tbody>
          {shipmentLots && shipmentLots.map((lot, idx) => (
            <tr key={idx}>
              <td style={tdCenterStyle}>{lot.lot}</td>
              <td style={tdCenterStyle}>{lot.exFtyDate}</td>
              <td style={tdCenterStyle}>{lot.quantity?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PROCESSES */}
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={{ ...tdStyle, width: '20%' }}>PRINT</td>
            <td style={tdStyle}>{processes?.print}</td>
          </tr>
          <tr>
            <td style={tdStyle}>EMBROIDERY</td>
            <td style={tdStyle}>{processes?.embroidery}</td>
          </tr>
          <tr>
            <td style={tdStyle}>WASHING</td>
            <td style={tdStyle}>{processes?.washing}</td>
          </tr>
          <tr>
            <td style={tdStyle}>HEAT TRANSFER</td>
            <td style={tdStyle}>{processes?.heatTransfer}</td>
          </tr>
        </tbody>
      </table>

      {/* REMARK */}
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        <strong>REMARK : </strong> {remark}
      </div>

      {/* FOOTER */}
      {footerStatus && (
        <div style={{ marginTop: '40px', fontSize: '10px', textAlign: 'left', wordSpacing: '2px', color: '#333' }}>
          {footerStatus}
        </div>
      )}

    </div>
  );
};

export default Comp02_OrderDetails_GPRT00077C;

