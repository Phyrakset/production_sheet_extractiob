import React from 'react';

const OrderBlock = ({ order, isLast }) => {
  const { header, poDetails, productDescription, sizeBreakdown, shipmentLots, processes, remark, footerStatus } = order;

  // Table generic styles
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontFamily: '"Times New Roman", Times, serif', fontSize: '12px' };
  const thStyle = { border: '1px solid black', padding: '2px 4px', textAlign: 'center', backgroundColor: '#fff', fontWeight: 'normal' };
  const tdStyle = { border: '1px solid black', padding: '2px 4px', textAlign: 'left', verticalAlign: 'top' };
  const tdCenterStyle = { ...tdStyle, textAlign: 'center' };

  // Helper to render product description rows
  const renderProductDescription = () => {
    let descriptions = [];
    if (Array.isArray(productDescription)) {
      descriptions = productDescription;
    } else if (productDescription && typeof productDescription === 'object') {
      descriptions = [productDescription];
    } else {
      return null;
    }

    return (
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '50%' }}>DESCRIPTION</th>
            <th style={{ ...thStyle, width: '35%' }}>COLOUR</th>
            <th style={{ ...thStyle, width: '15%' }}>QUANTITY</th>
          </tr>
        </thead>
        <tbody>
          {descriptions.map((desc, idx) => (
            <tr key={idx}>
              <td style={tdStyle}>{desc.description || ''}</td>
              <td style={tdStyle}>{desc.colour || ''}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>{desc.quantity !== undefined && desc.quantity !== null ? desc.quantity.toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderSizeBreakdowns = () => {
    if (!sizeBreakdown || !sizeBreakdown.length) return null;

    // Collect all unique sizes to form the header columns across all rows
    const allSizesSet = new Set();
    sizeBreakdown.forEach(item => {
      if (item.sizes) {
        Object.keys(item.sizes).forEach(size => allSizesSet.add(size));
      }
    });
    
    // Custom sort order for PTCOM227 sizes (XS, S, M, L, XL, 2XL)
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
    const allSizes = Array.from(allSizesSet).sort((a, b) => {
      const idxA = sizeOrder.indexOf(a);
      const idxB = sizeOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

    // Calculate totals per size column
    const sizeTotals = {};
    let grandTotal = 0;
    
    sizeBreakdown.forEach(item => {
      allSizes.forEach(size => {
        if (!sizeTotals[size]) sizeTotals[size] = 0;
        if (item.sizes && item.sizes[size]) {
          sizeTotals[size] += parseInt(item.sizes[size].toString().replace(/,/g, ''), 10) || 0;
        }
      });
      if (item.total) {
        grandTotal += parseInt(item.total.toString().replace(/,/g, ''), 10) || 0;
      }
    });

    return (
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '12%' }}>COL CODE</th>
            <th colSpan={2} style={{ ...thStyle, width: '38%' }}>COLOUR</th>
            {allSizes.map((size) => (
              <th key={size} style={{ ...thStyle, width: `${40 / Math.max(allSizes.length, 1)}%` }}>{size}</th>
            ))}
            <th style={{ ...thStyle, width: '10%' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {sizeBreakdown.map((item, idx) => {
            // Split Chinese and English color names if possible (e.g. "黑色 BLACK")
            let colorPart1 = item.colour || '';
            let colorPart2 = '';
            const splitMatch = colorPart1.match(/^([\u4e00-\u9fa5]+)\s+(.*)/);
            if (splitMatch) {
              colorPart1 = splitMatch[1];
              colorPart2 = splitMatch[2];
            } else if (colorPart1.indexOf(' ') > 0 && /[\u4e00-\u9fa5]/.test(colorPart1.split(' ')[0])) {
              const parts = colorPart1.split(' ');
              colorPart1 = parts[0];
              colorPart2 = parts.slice(1).join(' ');
            }

            return (
              <tr key={idx}>
                <td style={tdStyle}>{item.colCode}</td>
                <td style={{ ...tdStyle, width: '10%', whiteSpace: 'nowrap' }}>{colorPart1}</td>
                <td style={{ ...tdStyle, width: '28%' }}>{colorPart2 || colorPart1}</td>
                {allSizes.map((size) => (
                  <td key={size} style={{ ...tdStyle, textAlign: 'right' }}>
                    {item.sizes && item.sizes[size] !== undefined && item.sizes[size] !== null ? item.sizes[size].toLocaleString() : ''}
                  </td>
                ))}
                <td style={{ ...tdStyle, textAlign: 'right' }}>{item.total?.toLocaleString()}</td>
              </tr>
            );
          })}
          {/* TOTAL ROW */}
          <tr>
            <td colSpan={3} style={tdStyle}>TOTAL</td>
            {allSizes.map((size) => (
              <td key={`total-${size}`} style={{ ...tdStyle, textAlign: 'right' }}>
                {sizeTotals[size]?.toLocaleString()}
              </td>
            ))}
            <td style={{ ...tdStyle, textAlign: 'right' }}>{grandTotal.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="avoid-break" style={{ padding: '40px', backgroundColor: 'white', color: 'black', fontFamily: '"Times New Roman", Times, serif', minHeight: '100%', position: 'relative', marginBottom: isLast ? '0' : '40px', pageBreakAfter: isLast ? 'auto' : 'always' }}>
      
      {/* HEADER SECTION */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', width: '100%' }}>
        
        {/* Left Section */}
        <div style={{ flex: '0 1 auto', zIndex: 1 }}>
          <div style={{ fontSize: '22px', marginBottom: '15px', whiteSpace: 'nowrap', fontFamily: '"Times New Roman", Times, serif' }}>
            Yorkmars (Cambodia) Garment MFG. Co. Ltd.
          </div>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginTop: '10px' }}>
            <tbody>
              <tr>
                <td style={{ width: '130px', padding: '1px 0' }}>CUSTOMER CODE</td>
                <td style={{ padding: '1px 0' }}>: {header?.customerCode || 'C&O APPARE'}</td>
              </tr>
              <tr>
                <td style={{ padding: '1px 0' }}>CUSTOMER STYLE</td>
                <td style={{ padding: '1px 0' }}>: {header?.customerStyle || '3AFESHSP1-571 (3AFESHSP1-571)'}</td>
              </tr>
              <tr>
                <td style={{ padding: '1px 0' }}>QUANTITY</td>
                <td style={{ padding: '1px 0' }}>: {header?.quantity || '8005 PCS'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Middle Section: Images - ABSOLUTE CENTERED */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px', marginTop: '5px', zIndex: 0 }}>
          {/* Leggings drawing placeholder */}
          <div style={{ width: '20px', height: '100px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999', backgroundColor: '#fafafa', borderRadius: '4px' }}>
            Leg
          </div>
          <div style={{ width: '20px', height: '100px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999', backgroundColor: '#fafafa', borderRadius: '4px' }}>
            Leg
          </div>
          <div style={{ width: '20px', height: '100px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999', backgroundColor: '#fafafa', borderRadius: '4px' }}>
            Leg
          </div>
        </div>

        {/* Right Section */}
        <div style={{ flex: '0 1 auto', textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: '16px', marginBottom: '10px', color: '#000080' }}>
            Prod. Sheet - Order Details
          </div>
          <div style={{ display: 'inline-block', border: '1px solid black', padding: '2px 8px', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: '#000080' }}>
            {header?.factoryNumber || 'PTCOM227'}
          </div>
          <table style={{ width: '200px', marginLeft: 'auto', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '80px', padding: '1px 0' }}>PAGES</td>
                <td style={{ padding: '1px 0' }}>: {header?.pages || '1 / 1'}</td>
              </tr>
              <tr>
                <td style={{ padding: '1px 0' }}>ORDER DATE</td>
                <td style={{ padding: '1px 0' }}>: {header?.orderDate || '2020.08.30'}</td>
              </tr>
              <tr>
                <td style={{ padding: '1px 0' }}>EX FTY DATE</td>
                <td style={{ padding: '1px 0' }}>: {header?.exFtyDate || '2020.12.24'}</td>
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
            <td style={tdStyle}>{poDetails?.customerPo || 'A001559'}</td>
          </tr>
          <tr>
            <td style={tdStyle}>CUSTOMER STY</td>
            <td style={tdStyle}>{poDetails?.customerStyleDesc || poDetails?.customerStyle || 'LIVE IN PRINTED 7/8 LEGGING'}</td>
          </tr>
          <tr>
            <td style={tdStyle}>SEASON</td>
            <td style={tdStyle}>{poDetails?.season || 'SPRING 2021'}</td>
          </tr>
          <tr>
            <td style={tdStyle}>C.O.O.</td>
            <td style={tdStyle}>{poDetails?.coo || 'CAM'}</td>
          </tr>
        </tbody>
      </table>

      {/* DESCRIPTION TABLE */}
      {renderProductDescription()}

      {/* SIZE BREAKDOWN */}
      {renderSizeBreakdowns()}

      {/* SHIPMENT LOTS */}
      <table style={{ ...tableStyle, width: '40%' }}>
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
              <td style={{ ...tdStyle, textAlign: 'right' }}>{lot.quantity !== null && lot.quantity !== undefined ? lot.quantity.toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PROCESSES */}
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={{ ...tdStyle, width: '20%' }}>PRINT</td>
            <td style={tdStyle}>{processes?.print || '无'}</td>
          </tr>
          <tr>
            <td style={tdStyle}>EMBROIDERY</td>
            <td style={tdStyle}>{processes?.embroidery || '无'}</td>
          </tr>
          <tr>
            <td style={tdStyle}>WASHING</td>
            <td style={tdStyle}>{processes?.washing || '无'}</td>
          </tr>
          <tr>
            <td style={tdStyle}>HEAT TRANSFER</td>
            <td style={tdStyle}>{processes?.heatTransfer || 'LOGO烫唛'}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        REMARK : 
      </div>
      
      {remark && (
        <div style={{ marginTop: '40px', marginBottom: '40px', marginLeft: '60px', fontSize: '36px', color: '#e60000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
          {remark}
        </div>
      )}

      <div style={{ position: 'absolute', bottom: '20px', left: '40px', right: '40px', fontSize: '10px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <span>{footerStatus?.includes('Status:') ? footerStatus : `Status: T1    ${footerStatus || 'EDIT BY MJULIE DATE 2020/12/07 TIME 13:51:24 PRINT BY MLILIAN DATE 2020/12/08 TIME 15:05:52'}`}</span>
      </div>
    </div>
  );
};

const Comp02_OrderDetails_PTCOM227 = ({ data, extraction }) => {
  const d = extraction?.data || data || {};
  if (!Object.keys(d).length) return null;

  // Determine if we are rendering multiple orders (from the updated schema) or a single order (fallback)
  let orders = [];
  if (Array.isArray(d.orders) && d.orders.length > 0) {
    orders = d.orders;
  } else {
    orders = [d];
    // Fallback logic: If the older JSON schema was used and the AI stuffed the second page into otherInformation
    if (Array.isArray(extraction?.otherInformation)) {
      const extraOrders = extraction.otherInformation.filter(info => info && typeof info === 'object');
      orders = orders.concat(extraOrders);
    }
  }

  return (
    <div className="multi-order-container">
      {orders.map((order, idx) => (
        <OrderBlock key={idx} order={order} isLast={idx === orders.length - 1} />
      ))}
    </div>
  );
};

export default Comp02_OrderDetails_PTCOM227;
