import React from 'react';

export default function MasterDocument({ masterData, onClose }) {
  // If we don't have masterData, show loading or fallback
  if (!masterData || masterData.error) {
    return (
      <div className="master-doc-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: 40, borderRadius: 8, color: 'black' }}>
          <h2>Error rendering template</h2>
          <p>{masterData?.error || "No data compiled."}</p>
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    );
  }

  const r1 = masterData.row1_basicInfo || {};
  const r2 = masterData.row2_productionInstructions || {};
  const r4 = masterData.row4_sizeSpec || {};
  const r5 = masterData.row5_packing || {};
  const r6 = masterData.row6_graphicPlacement || {};
  const r7 = masterData.row7_operationSequence || {};
  const r8 = masterData.row8_constructions || {};
  const r9 = masterData.row9_threadConsumption || {};

  // Helper renderer for lists
  const ListSection = ({ title, items }) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    return (
      <div className="doc-section" style={{ marginBottom: title ? '15px' : '5px' }}>
        {title && <h4>{title}</h4>}
        <ul>
          {items.map((it, i) => <li key={i}>{typeof it === 'string' ? it : JSON.stringify(it)}</li>)}
        </ul>
      </div>
    );
  };

  return (
    <div className="master-doc-overlay">
      <div className="master-doc-controls no-print">
        <button onClick={onClose} className="btn-secondary">Close View</button>
        <button onClick={() => window.print()} className="btn-primary">Print / Save PDF</button>
      </div>

      <div className="master-document">
        
        {/* ROW 1: HEADER BLOCK */}
        <div className="doc-header">
          <div className="doc-header-left">
            <h1>PRODUCTION SHEET</h1>
            <p><strong>Job number:</strong> {r1.jobNumber || "N/A"}</p>
            <p><strong>PO Number:</strong> {r1.poNumber || "N/A"}</p>
            <p><strong>Style Number:</strong> {r1.styleNumber || "N/A"}</p>
          </div>
          <div className="doc-header-right">
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Order QTY:</strong> {r1.orderQuantity || "N/A"}</p>
            <p><strong>Size Ratio:</strong> {r1.sizeRatio || "N/A"}</p>
          </div>
        </div>

        {/* ROW 2: PRODUCTION INSTRUCTIONS ALERTS */}
        <div className="doc-alert-box">
          <h2>MAIN PRODUCTION INSTRUCTIONS</h2>
          {r2.ppComments?.length > 0 && <div><strong>PP Comments:</strong> {r2.ppComments.join(" | ")}</div>}
          {r2.washingRequests?.length > 0 && <div><strong>Washing:</strong> {r2.washingRequests.join(" | ")}</div>}
          {r2.printingWarnings?.length > 0 && <div><strong>Printing:</strong> {r2.printingWarnings.join(" | ")}</div>}
          {r2.tolerances?.length > 0 && <div><strong>Tolerances:</strong> {r2.tolerances.join(" | ")}</div>}
          {r2.overCutPercentage && <div><strong>Over Cut %:</strong> {r2.overCutPercentage}</div>}
        </div>

        {/* TWO COLUMN GRID FOR CONTINUED SECTIONS */}
        <div className="doc-grid-2">
          {/* LEFT COLUMN */}
          <div className="doc-column">
            
            <div className="doc-section">
              <h3>Color Breakdown</h3>
              {r1.colorBreakdown?.length > 0 ? (
                <table className="doc-table">
                  <thead><tr><th>Color</th><th>QTY</th></tr></thead>
                  <tbody>
                    {r1.colorBreakdown.map((c, i) => (
                      <tr key={i}><td>{c.color}</td><td>{c.quantity}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="empty-text">No color breakdown provided</p>}
            </div>

            {/* ROW 5: PACKING */}
            <div className="doc-section">
              <h3>Packing</h3>
              {r5.foldingMethod && <p><strong>Folding:</strong> {r5.foldingMethod}</p>}
              {r5.cartonSizeLimits && <p><strong>Carton Limits:</strong> {r5.cartonSizeLimits}</p>}
              {r5.barcodeDetails && <p><strong>Barcodes:</strong> {r5.barcodeDetails}</p>}
            </div>

            {/* ROW 6: GRAPHIC PLACEMENT */}
            <div className="doc-section">
              <h3>Graphic Placement</h3>
              {r6.logoType && <p><strong>Type:</strong> {r6.logoType}</p>}
              {r6.positionVertical && <p><strong>Vertical:</strong> {r6.positionVertical}</p>}
              {r6.positionHorizontal && <p><strong>Horizontal:</strong> {r6.positionHorizontal}</p>}
              
              {r6.scalingRule?.length > 0 && (
                <table className="doc-table" style={{ marginTop: '10px' }}>
                  <thead><tr><th>Size</th><th>Scale</th></tr></thead>
                  <tbody>
                    {r6.scalingRule.map((r, i) => (
                      <tr key={i}><td>{r.size}</td><td>{r.scale}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
          </div>

          {/* RIGHT COLUMN */}
          <div className="doc-column">
            
             {/* ROW 7: OPERATION SEQUENCE */}
             <div className="doc-section">
               <h3>Operation Sequence</h3>
               <ListSection title="" items={r7.sewingOperations} />
             </div>
             
             {/* ROW 8: CONSTRUCTIONS */}
             <div className="doc-section">
               <h3>Constructions</h3>
               <ListSection title="Stitch Types" items={r8.stitchTypes} />
               <ListSection title="Seam Finishes" items={r8.seamFinishes} />
               <ListSection title="Binding Methods" items={r8.bindingMethods} />
               <ListSection title="Special Notes" items={r8.specialNotes} />
             </div>

             {/* ROW 9: THREAD CONSUMPTION */}
             <div className="doc-section">
               <h3>Thread Consumption</h3>
               {r9.totalPerGarment && <p><strong>Total:</strong> {r9.totalPerGarment}</p>}
               {r9.detailsBySeam && Array.isArray(r9.detailsBySeam) && (
                 <ul>{r9.detailsBySeam.map((s,i) => <li key={i}>{s.seam || s}: {s.length || ""}</li>)}</ul>
               )}
             </div>

          </div>
        </div>

        {/* FULL WIDTH: SIZE SPECS (ROW 4) */}
        <div className="doc-section avoid-break">
          <h3>Measurement Size Spec</h3>
          {r4.measurements?.length > 0 ? (
            <table className="doc-table size-table">
              <thead><tr><th>Point of Measure</th><th>Target</th><th>Tolerance</th></tr></thead>
              <tbody>
                {r4.measurements.map((m, i) => (
                  <tr key={i}><td>{m.point}</td><td>{m.target}</td><td>{m.tolerance}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="empty-text">No target measurements provided</p>}
        </div>

      </div>
    </div>
  );
}
