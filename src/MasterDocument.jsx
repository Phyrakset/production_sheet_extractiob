import React from 'react';
import Comp01_CoverPage_GPAF6153 from './renderers/GPAF6153/Comp01_CoverPage';
import Comp02_OrderDetails_GPAF6153 from './renderers/GPAF6153/Comp02_OrderDetails';
import Comp03_TechSketch_GPAF6153 from './renderers/GPAF6153/Comp03_TechSketch';
import Comp01_CoverPage_GPAR12172GD_2 from './renderers/GPAR12172GD-2/Comp01_CoverPage';
import Comp02_OrderDetails_GPAR12172GD_2 from './renderers/GPAR12172GD-2/Comp02_OrderDetails';
import Comp03_TechSketch_GPAR12172GD_2 from './renderers/GPAR12172GD-2/Comp03_TechSketch';
import Comp01_CoverPage_GPRT00077C from './renderers/GPRT00077C/Comp01_CoverPage';
import Comp02_OrderDetails_GPRT00077C from './renderers/GPRT00077C/Comp02_OrderDetails';
import Comp03_TechSketch_GPRT00077C from './renderers/GPRT00077C/Comp03_TechSketch';
import Comp01_CoverPage_PTBC0047 from './renderers/PTBC0047/Comp01_CoverPage';
import Comp02_OrderDetails_PTBC0047 from './renderers/PTBC0047/Comp02_OrderDetails';
import Comp01_CoverPage_PTCOC270_270A from './renderers/PTCOC270_270A/Comp01_CoverPage';
import Comp02_OrderDetails_PTCOC270_270A from './renderers/PTCOC270_270A/Comp02_OrderDetails';
import Comp03_TechSketch_PTCOC270_270A from './renderers/PTCOC270_270A/Comp03_TechSketch';
import Comp01_CoverPage_PTCOM227 from './renderers/PTCOM227/Comp01_CoverPage';
import Comp02_OrderDetails_PTCOM227 from './renderers/PTCOM227/Comp02_OrderDetails';
import Comp03_TechSketch_PTCOM227 from './renderers/PTCOM227/Comp03_TechSketch';
import Comp04_Construction_GPAF6153 from './renderers/GPAF6153/Comp04_Construction';

// ─── Component-Specific Renderers ───

// KeyNotesSection has been removed in favor of style-specific renderers.

function OrderDetailsSection({ data, extraction }) {
  const d = extraction?.data || data?.data || {};
  return (
    <div className="comp-section avoid-break">
      <h2 className="comp-title">订单明细 Order Details</h2>
      <div className="comp-grid-2">
        <div className="doc-section">
          <h4>Order Information</h4>
          <table className="doc-table">
            <tbody>
              {d.styleNumber && <tr><td className="info-label">Style Number</td><td>{d.styleNumber}</td></tr>}
              {d.customerName && <tr><td className="info-label">Customer</td><td>{d.customerName}</td></tr>}
              {d.garmentType && <tr><td className="info-label">Garment Type</td><td>{d.garmentType}</td></tr>}
              {d.factoryNumber && <tr><td className="info-label">Factory</td><td>{d.factoryNumber}</td></tr>}
              {d.poNumber && <tr><td className="info-label">PO Number</td><td>{d.poNumber}</td></tr>}
              {d.totalQuantity && <tr><td className="info-label">Total Quantity</td><td>{d.totalQuantity}</td></tr>}
              {d.deliveryDate && <tr><td className="info-label">Delivery Date</td><td>{d.deliveryDate}</td></tr>}
              {d.season && <tr><td className="info-label">Season</td><td>{d.season}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="doc-section">
          <h4>Size & Color Breakdown</h4>
          {d.colorBreakdown?.length > 0 ? (
            <table className="doc-table">
              <thead><tr><th>Color</th><th>Quantity</th></tr></thead>
              <tbody>
                {d.colorBreakdown.map((c, i) => (
                  <tr key={i}><td>{c.color || c.colorName}</td><td>{c.quantity || c.qty}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="empty-text">No color breakdown</p>}
          {d.sizeBreakdown?.length > 0 && (
            <table className="doc-table" style={{ marginTop: 12 }}>
              <thead><tr><th>Size</th><th>Quantity</th></tr></thead>
              <tbody>
                {d.sizeBreakdown.map((s, i) => (
                  <tr key={i}><td>{s.size}</td><td>{s.quantity || s.qty}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function ConstructionSection({ data, extraction }) {
  const d = extraction?.data || data?.data || {};
  return (
    <div className="comp-section avoid-break">
      <h2 className="comp-title">生产工艺 Construction</h2>
      {d.operations?.length > 0 && (
        <table className="doc-table">
          <thead><tr><th>#</th><th>Operation</th><th>Machine/Type</th><th>SPI</th><th>Notes</th></tr></thead>
          <tbody>
            {d.operations.map((op, i) => (
              <tr key={i}>
                <td>{op.step || i + 1}</td>
                <td>{op.operation || op.description || op.name || (typeof op === 'string' ? op : '')}</td>
                <td>{op.machine || op.machineType || ''}</td>
                <td>{op.spi || op.SPI || ''}</td>
                <td>{op.notes || op.remark || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {d.stitchTypes?.length > 0 && <ListBlock title="Stitch Types" items={d.stitchTypes} />}
      {d.seamDetails?.length > 0 && <ListBlock title="Seam Details" items={d.seamDetails} />}
      {d.specialNotes?.length > 0 && <ListBlock title="Special Notes" items={d.specialNotes} />}
      {d.notes?.length > 0 && <ListBlock title="Notes" items={d.notes} />}
    </div>
  );
}

function MfgStandardsSection({ data, extraction }) {
  const d = extraction?.data || data?.data || {};
  return (
    <div className="comp-section avoid-break">
      <h2 className="comp-title">缝制标准 Mfg Standards</h2>
      {d.standards?.length > 0 && <ListBlock items={d.standards} />}
      {d.stitchRequirements?.length > 0 && <ListBlock title="Stitch Requirements" items={d.stitchRequirements} />}
      {d.sewingInstructions?.length > 0 && <ListBlock title="Sewing Instructions" items={d.sewingInstructions} />}
      {d.notes?.length > 0 && <ListBlock title="Notes" items={d.notes} />}
      {d.tolerances && <p><strong>Tolerances:</strong> {typeof d.tolerances === 'string' ? d.tolerances : JSON.stringify(d.tolerances)}</p>}
    </div>
  );
}

function POMsSection({ data, extraction }) {
  const d = extraction?.data || data?.data || {};
  const measurements = d.measurements || d.pointsOfMeasure || [];
  return (
    <div className="comp-section avoid-break">
      <h2 className="comp-title">成品尺寸 POMs</h2>
      {measurements.length > 0 ? (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Point of Measure</th>
              {measurements[0]?.tolerance !== undefined && <th>Tol.</th>}
              {Object.keys(measurements[0] || {}).filter(k => !['point','pointOfMeasure','name','tolerance','unit','description'].includes(k)).map(k => (
                <th key={k}>{k.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {measurements.map((m, i) => {
              const sizeKeys = Object.keys(m).filter(k => !['point','pointOfMeasure','name','tolerance','unit','description'].includes(k));
              return (
                <tr key={i}>
                  <td>{m.point || m.pointOfMeasure || m.name || m.description}</td>
                  {m.tolerance !== undefined && <td>{m.tolerance}</td>}
                  {sizeKeys.map(k => <td key={k}>{m[k]}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : <p className="empty-text">No measurements provided</p>}
    </div>
  );
}

function BOMSection({ data, extraction, title }) {
  const d = extraction?.data || data?.data || {};
  const items = d.materials || d.fabrics || d.trims || d.items || [];
  return (
    <div className="comp-section avoid-break">
      <h2 className="comp-title">{title}</h2>
      {items.length > 0 ? (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Supplier</th>
              <th>Color</th>
              <th>Consumption</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.name || item.item || item.materialName || ''}</td>
                <td>{item.description || item.specification || item.spec || ''}</td>
                <td>{item.supplier || item.vendor || ''}</td>
                <td>{item.color || item.colorway || ''}</td>
                <td>{item.consumption || item.usage || item.quantity || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {d.notes?.length > 0 && <ListBlock title="Notes" items={d.notes} />}
    </div>
  );
}

function PackagingSection({ data, extraction }) {
  const d = extraction?.data || data?.data || {};
  return (
    <div className="comp-section avoid-break">
      <h2 className="comp-title">包装出货 Packaging</h2>
      <div className="doc-section">
        {d.foldingMethod && <p><strong>Folding:</strong> {d.foldingMethod}</p>}
        {d.packingMethod && <p><strong>Packing Method:</strong> {d.packingMethod}</p>}
        {d.cartonSize && <p><strong>Carton Size:</strong> {typeof d.cartonSize === 'string' ? d.cartonSize : JSON.stringify(d.cartonSize)}</p>}
        {d.polybag && <p><strong>Polybag:</strong> {d.polybag}</p>}
        {d.barcodeDetails && <p><strong>Barcode:</strong> {d.barcodeDetails}</p>}
        {d.assortment && <p><strong>Assortment:</strong> {typeof d.assortment === 'string' ? d.assortment : JSON.stringify(d.assortment)}</p>}
      </div>
      {d.instructions?.length > 0 && <ListBlock title="Instructions" items={d.instructions} />}
      {d.notes?.length > 0 && <ListBlock title="Notes" items={d.notes} />}
    </div>
  );
}

function GenericSection({ data, extraction, slotTitle }) {
  const d = extraction?.data || data?.data || {};
  const notes = d.notes || [];
  const items = d.items || d.entries || d.details || [];
  
  return (
    <div className="comp-section avoid-break">
      <h2 className="comp-title">{slotTitle}</h2>
      {extraction?.summary && (
        <p className="comp-summary">{extraction.summary}</p>
      )}
      {notes.length > 0 && (
        <table className="doc-table">
          <thead><tr><th>#</th><th>Details</th></tr></thead>
          <tbody>
            {notes.map((n, i) => (
              <tr key={i}><td style={{ width: 50, textAlign: 'center' }}>{i + 1}</td><td>{typeof n === 'string' ? n : JSON.stringify(n)}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {items.length > 0 && (
        <table className="doc-table" style={{ marginTop: 12 }}>
          <thead><tr><th>#</th><th>Item</th><th>Details</th></tr></thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td style={{ width: 50, textAlign: 'center' }}>{i + 1}</td>
                <td>{typeof item === 'string' ? item : (item.name || item.item || item.description || '')}</td>
                <td>{typeof item === 'object' ? Object.entries(item).filter(([k]) => !['name','item','description'].includes(k)).map(([k,v]) => `${k}: ${v}`).join(', ') : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Render any remaining data fields as key-value pairs */}
      {Object.entries(d).filter(([k]) => !['notes','items','entries','details'].includes(k)).length > 0 && (
        <div className="doc-section" style={{ marginTop: 12 }}>
          <table className="doc-table">
            <tbody>
              {Object.entries(d).filter(([k]) => !['notes','items','entries','details'].includes(k)).map(([key, value]) => (
                <tr key={key}>
                  <td className="info-label" style={{ width: '30%' }}>{key}</td>
                  <td>{typeof value === 'string' || typeof value === 'number' ? value : Array.isArray(value) ? value.map((v, i) => <div key={i}>{typeof v === 'string' ? v : JSON.stringify(v)}</div>) : JSON.stringify(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ───

function ListBlock({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      {title && <h4 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#555' }}>{title}</h4>}
      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 4, lineHeight: 1.5 }}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
}

// ─── Slot title → component renderer mapping ───
const COMPONENT_MAP = {
  'Cover Page':       GenericSection,
  'Order Details':   OrderDetailsSection,
  'Construction':    ConstructionSection,
  'Mfg Standards':   MfgStandardsSection,
  'POMs':            POMsSection,
  'BOM Fabrics':     (props) => <BOMSection {...props} title="面料物料 BOM Fabrics" />,
  'BOM Trims':       (props) => <BOMSection {...props} title="辅料 BOM Trims" />,
  'Packaging':       PackagingSection,
};

// ─── Main MasterDocument Component ───

export default function MasterDocument({ masterData, slotResults, onClose }) {
  // Determine mode: component-aware (slotResults) or legacy (masterData only)
  const hasSlots = slotResults && Object.keys(slotResults).length > 0;
  
  if (!hasSlots && (!masterData || masterData.error)) {
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

  // Extract brand/style from first available slot
  let docBrand = '', docStyle = '', docFactory = '', docPO = '', docQty = '';
  if (hasSlots) {
    for (const result of Object.values(slotResults)) {
      const ex = result?.extraction || {};
      const d = ex?.data || {};
      if (!docBrand && ex.brand) docBrand = ex.brand;
      if (!docStyle && (ex.styleId || d.styleNumber)) docStyle = ex.styleId || d.styleNumber;
      if (!docFactory && d.factoryNumber) docFactory = d.factoryNumber;
      if (!docPO && d.poNumber) docPO = d.poNumber;
      if (!docQty && d.totalQuantity) docQty = d.totalQuantity;
    }
  }

  // Sort slots by their page-XX id
  const sortedSlots = hasSlots
    ? Object.entries(slotResults).sort(([a], [b]) => {
        const na = parseInt(a.replace('page-', ''));
        const nb = parseInt(b.replace('page-', ''));
        return na - nb;
      })
    : [];

  return (
    <div className="master-doc-overlay">
      <div className="master-doc-controls no-print">
        <button onClick={onClose} className="btn-secondary">Close View</button>
        <button onClick={() => window.print()} className="btn-primary">Print / Save PDF</button>
      </div>

      <div className="master-document">
        {/* Document Header - Only for Legacy Mode */}
        {!hasSlots && (
          <div className="doc-header">
            <div className="doc-header-left">
              <h1>PRODUCTION SHEET</h1>
              {docBrand && <p><strong>Brand:</strong> {docBrand}</p>}
              {docStyle && <p><strong>Style:</strong> {docStyle}</p>}
              {docFactory && <p><strong>Factory:</strong> {docFactory}</p>}
            </div>
            <div className="doc-header-right">
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              {docPO && <p><strong>PO#:</strong> {docPO}</p>}
              {docQty && <p><strong>Quantity:</strong> {docQty}</p>}
            </div>
          </div>
        )}

        {/* Render each slot in component-specific format */}
        {sortedSlots.map(([slotId, result]) => {
          const slotTitle = result?.slotTitle || '';
          const extraction = result?.extraction || {};
          let Renderer = COMPONENT_MAP[slotTitle] || GenericSection;
          
          const styleId = extraction?.styleId || extraction?.data?.styleNumber || extraction?.pageRef || '';
          const factoryNumber = extraction?.data?.factoryNumber || extraction?.pageRef || '';
          const custStyle = extraction?.data?.customerStyle || '';
          const title = extraction?.data?.title || '';
          const centricTitle = extraction?.data?.header?.titleLine1 || '';
          
          if (slotTitle === 'Cover Page') {
            
            if (styleId === '122260171' || factoryNumber === 'GPAF6153' || docFactory === 'GPAF6153') {
              Renderer = Comp01_CoverPage_GPAF6153;
            } else if (styleId === 'GPAR12172GD-2' || factoryNumber === 'GPAR12172GD-2' || docFactory === 'GPAR12172GD-2' || custStyle.includes('GPAR12172GD-2')) {
              Renderer = Comp01_CoverPage_GPAR12172GD_2;
            } else if (styleId === 'GPRT00077C' || factoryNumber === 'GPRT00077C' || docFactory === 'GPRT00077C' || title.includes('GPRT00077C')) {
              Renderer = Comp01_CoverPage_GPRT00077C;
            } else if (styleId === 'PTBC0047' || factoryNumber === 'PTBC0047' || docFactory === 'PTBC0047' || title.includes('PTBC0047')) {
              Renderer = Comp01_CoverPage_PTBC0047;
            } else if (styleId === 'PTCOC270_270A' || factoryNumber.includes('PTCOC270') || docFactory.includes('PTCOC270') || title.includes('PTCOC270')) {
              Renderer = Comp01_CoverPage_PTCOC270_270A;
            } else if (styleId === 'PTCOM227' || factoryNumber.includes('PTCOM227') || docFactory.includes('PTCOM227') || title.includes('PTCOM227')) {
              Renderer = Comp01_CoverPage_PTCOM227;
            }
          }
          
          if (slotTitle === 'Order Details') {
            
            if (styleId === '122260171' || factoryNumber === 'GPAF6153' || docFactory === 'GPAF6153') {
              Renderer = Comp02_OrderDetails_GPAF6153;
            } else if (styleId === 'GPAR12172GD-2' || factoryNumber === 'GPAR12172GD-2' || docFactory === 'GPAR12172GD-2' || custStyle.includes('GPAR12172GD-2') || centricTitle.includes('YORKWELL')) {
              Renderer = Comp02_OrderDetails_GPAR12172GD_2;
            } else if (styleId === 'GPRT00077C' || factoryNumber === 'GPRT00077C' || docFactory === 'GPRT00077C') {
              Renderer = Comp02_OrderDetails_GPRT00077C;
            } else if (styleId === 'PTBC0047' || factoryNumber === 'PTBC0047' || docFactory === 'PTBC0047') {
              Renderer = Comp02_OrderDetails_PTBC0047;
            } else if (styleId === 'PTCOC270_270A' || factoryNumber.includes('PTCOC270') || docFactory.includes('PTCOC270') || custStyle.includes('STCO4143')) {
              Renderer = Comp02_OrderDetails_PTCOC270_270A;
            } else if (styleId === 'PTCOM227' || factoryNumber.includes('PTCOM227') || docFactory.includes('PTCOM227') || custStyle.includes('3AFESHSP1')) {
              Renderer = Comp02_OrderDetails_PTCOM227;
            }
          } else if (slotTitle.toLowerCase().includes('tech sketch')) {
            if (styleId === 'GPAF6153' || factoryNumber === 'GPAF6153' || docFactory === 'GPAF6153' || docStyle === 'GPAF6153' || result?.fileName?.includes('GPAF6153')) {
              Renderer = Comp03_TechSketch_GPAF6153;
            } else if (styleId === 'GPAR12172GD-2' || factoryNumber === 'GPAR12172GD-2' || docFactory === 'GPAR12172GD-2' || docStyle === 'GPAR12172GD-2' || custStyle.includes('GPAR12172GD-2') || centricTitle.includes('YORKWELL') || result?.fileName?.includes('GPAR12172GD-2')) {
              Renderer = Comp03_TechSketch_GPAR12172GD_2;
            } else if (styleId === 'GPRT00077C' || factoryNumber === 'GPRT00077C' || docFactory === 'GPRT00077C' || docStyle === 'GPRT00077C' || custStyle.includes('GPRT00077C') || result?.fileName?.includes('GPRT00077C') || result?.styleId?.includes('GPRT00077C') || JSON.stringify(extraction).includes('GPRT00077C')) {
              Renderer = Comp03_TechSketch_GPRT00077C;
            } else if (styleId === 'PTCOC270_270A' || factoryNumber.includes('PTCOC270') || docFactory.includes('PTCOC270') || custStyle.includes('STCO4143') || result?.fileName?.includes('PTCOC270') || JSON.stringify(extraction).includes('PTCOC270') || JSON.stringify(extraction).includes('STCO4143')) {
              Renderer = Comp03_TechSketch_PTCOC270_270A;
            } else if (styleId === 'PTCOM227' || factoryNumber.includes('PTCOM227') || docFactory.includes('PTCOM227') || custStyle.includes('3AFESHSP1') || result?.fileName?.includes('PTCOM227') || JSON.stringify(extraction).includes('PTCOM227')) {
              Renderer = Comp03_TechSketch_PTCOM227;
            }
          } else if (slotTitle === 'Construction' || slotTitle === 'Mfg Standards' || slotTitle === 'Production Instructions') {
            if (styleId === 'GPAF6153' || factoryNumber === 'GPAF6153' || docFactory === 'GPAF6153' || docStyle === 'GPAF6153' || result?.fileName?.includes('GPAF6153')) {
              Renderer = Comp04_Construction_GPAF6153;
            }
          }
          
          return (
            <Renderer
              key={slotId}
              data={null}
              extraction={extraction}
              slotTitle={slotTitle}
            />
          );
        })}

        {/* Legacy masterData fallback (if no slotResults) */}
        {!hasSlots && masterData && (
          <LegacyMasterContent masterData={masterData} />
        )}
      </div>
    </div>
  );
}

// Legacy renderer for old masterData format (backward compat)
function LegacyMasterContent({ masterData }) {
  const r1 = masterData.row1_basicInfo || {};
  const r2 = masterData.row2_productionInstructions || {};
  const r4 = masterData.row4_sizeSpec || {};
  const r5 = masterData.row5_packing || {};
  const r7 = masterData.row7_operationSequence || {};
  const r8 = masterData.row8_constructions || {};

  return (
    <>
      <div className="doc-alert-box">
        <h2>PRODUCTION INSTRUCTIONS</h2>
        {r2.ppComments?.length > 0 && <div><strong>PP Comments:</strong> {r2.ppComments.join(" | ")}</div>}
        {r2.washingRequests?.length > 0 && <div><strong>Washing:</strong> {r2.washingRequests.join(" | ")}</div>}
        {r2.tolerances?.length > 0 && <div><strong>Tolerances:</strong> {r2.tolerances.join(" | ")}</div>}
        {r2.overCutPercentage && <div><strong>Over Cut %:</strong> {r2.overCutPercentage}</div>}
      </div>

      {r1.colorBreakdown?.length > 0 && (
        <div className="doc-section">
          <h3>Color Breakdown</h3>
          <table className="doc-table">
            <thead><tr><th>Color</th><th>QTY</th></tr></thead>
            <tbody>{r1.colorBreakdown.map((c, i) => <tr key={i}><td>{c.color}</td><td>{c.quantity}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {r4.measurements?.length > 0 && (
        <div className="doc-section avoid-break">
          <h3>Measurements</h3>
          <table className="doc-table">
            <thead><tr><th>Point</th><th>Target</th><th>Tolerance</th></tr></thead>
            <tbody>{r4.measurements.map((m, i) => <tr key={i}><td>{m.point}</td><td>{m.target}</td><td>{m.tolerance}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {r7.sewingOperations?.length > 0 && (
        <div className="doc-section">
          <h3>Operations</h3>
          <ul>{r7.sewingOperations.map((op, i) => <li key={i}>{op}</li>)}</ul>
        </div>
      )}

      {(r8.stitchTypes?.length > 0 || r8.seamFinishes?.length > 0) && (
        <div className="doc-section">
          <h3>Constructions</h3>
          {r8.stitchTypes?.length > 0 && <ListBlock title="Stitch Types" items={r8.stitchTypes} />}
          {r8.seamFinishes?.length > 0 && <ListBlock title="Seam Finishes" items={r8.seamFinishes} />}
        </div>
      )}

      {r5.foldingMethod && (
        <div className="doc-section">
          <h3>Packing</h3>
          <p><strong>Folding:</strong> {r5.foldingMethod}</p>
          {r5.cartonSizeLimits && <p><strong>Carton:</strong> {r5.cartonSizeLimits}</p>}
        </div>
      )}
    </>
  );
}
