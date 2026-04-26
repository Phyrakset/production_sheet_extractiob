import React from 'react';

const Comp02_OrderDetails_GPAR12172GD_2 = ({ data, extraction }) => {
  const d = extraction?.data || data || {};
  if (!Object.keys(d).length) return null;

  const { header, poDetails, productDescription, sizeBreakdown, shipmentLots, processes, remark, footerStatus } = d;

  // Table generic styles
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontFamily: '"Times New Roman", Times, serif', fontSize: '14px' };
  const thStyle = { border: '1px solid black', padding: '4px', textAlign: 'center', backgroundColor: '#f9f9f9', fontWeight: 'normal' };
  const tdStyle = { border: '1px solid black', padding: '4px', textAlign: 'left' };
  const tdCenterStyle = { ...tdStyle, textAlign: 'center' };

  // Group sizes into arrays of up to 6 sizes for wrapping rows if needed
  const renderSizeBreakdowns = () => {
    if (!sizeBreakdown || !sizeBreakdown.length) return null;

    return sizeBreakdown.map((item, idx) => {
      const sizeKeys = Object.keys(item.sizes || {});
      const chunkSize = 6;
      const chunks = [];
      for (let i = 0; i < sizeKeys.length; i += chunkSize) {
        chunks.push(sizeKeys.slice(i, i + chunkSize));
      }

      return chunks.map((chunk, chunkIdx) => (
        <table key={`${idx}-${chunkIdx}`} style={tableStyle}>
          <thead>
            <tr>
              {chunkIdx === 0 && <th style={{ ...thStyle, width: '15%' }}>COL CODE</th>}
              {chunkIdx === 0 && <th style={{ ...thStyle, width: '35%' }}>COLOUR</th>}
              {chunkIdx !== 0 && <th colSpan={2} style={{ ...thStyle, width: '50%' }}></th>}
              {chunk.map((size) => (
                <th key={size} style={{ ...thStyle, width: `${40 / chunk.length}%` }}>{size}</th>
              ))}
              <th style={{ ...thStyle, width: '10%' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {chunkIdx === 0 && <td style={tdStyle}>{item.colCode}</td>}
              {chunkIdx === 0 && <td style={tdStyle}>{item.colour}</td>}
              {chunkIdx !== 0 && <td colSpan={2} style={tdStyle}></td>}
              {chunk.map((size) => (
                <td key={size} style={{ ...tdCenterStyle, verticalAlign: 'top' }}>{item.sizes[size]}</td>
              ))}
              <td style={tdCenterStyle}>{chunkIdx === 0 ? '' : item.total}</td>
            </tr>
            <tr>
              {chunkIdx === 0 ? <td style={tdStyle}>TOTAL</td> : <td colSpan={2} style={tdStyle}>TOTAL</td>}
              {chunkIdx === 0 && <td style={tdStyle}></td>}
              {chunk.map((size) => (
                <td key={`total-${size}`} style={{ ...tdCenterStyle, verticalAlign: 'top' }}>{item.sizes[size]}</td>
              ))}
              <td style={tdCenterStyle}>{chunkIdx === 0 ? '' : item.total}</td>
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
        <div style={{ flex: 1 }}>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', marginTop: '60px' }}>
            <tbody>
              <tr>
                <td style={{ width: '140px', padding: '2px 0' }}>CUSTOMER CODE</td>
                <td style={{ padding: '2px 0' }}>: {header?.customerCode}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0' }}>CUSTOMER STYLE</td>
                <td style={{ padding: '2px 0' }}>: {header?.customerStyle}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0' }}>QUANTITY</td>
                <td style={{ padding: '2px 0' }}>: {header?.quantity}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
            Prod. Sheet - Order Details
          </div>
          <div style={{ display: 'inline-block', border: '1px solid black', padding: '4px 8px', fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
            {header?.factoryNumber}
          </div>
          <table style={{ width: '250px', marginLeft: 'auto', fontSize: '13px', textAlign: 'left' }}>
            <tbody>
              <tr>
                <td style={{ width: '100px', padding: '2px 0' }}>PAGES</td>
                <td style={{ padding: '2px 0' }}>: {header?.pages}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0' }}>ORDER DATE</td>
                <td style={{ padding: '2px 0' }}>: {header?.orderDate}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0' }}>EX FTY DATE</td>
                <td style={{ padding: '2px 0' }}>: {header?.exFtyDate}</td>
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
            <td style={tdStyle}>CUSTOMER ST</td>
            <td style={tdStyle}>{poDetails?.customerStyleDesc}</td>
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
            <th style={{ ...thStyle, width: '60%' }}>DESCRIPTION</th>
            <th style={{ ...thStyle, width: '25%' }}>COLOUR</th>
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
              <td style={tdStyle}>{lot.exFtyDate}</td>
              <td style={tdCenterStyle}>{lot.quantity?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PROCESSES */}
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={{ ...tdStyle, width: '15%' }}>PRINT</td>
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
      <div style={{ marginTop: '20px', fontSize: '14px' }}>
        <strong>REMARK : </strong> {remark}
      </div>

      {/* FOOTER */}
      {footerStatus && (
        <div style={{ marginTop: '60px', fontSize: '10px', textAlign: 'left', wordSpacing: '2px', color: '#333' }}>
          {footerStatus}
        </div>
      )}

    </div>
  );
};

export default Comp02_OrderDetails_GPAR12172GD_2;
