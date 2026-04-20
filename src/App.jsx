import { useEffect, useRef, useState } from "react";
import MasterDocument from "./MasterDocument";

const acceptedTypes = ".pdf,.png,.jpg,.jpeg,.webp";
const documentSlots = [
  // Phase A - Order & Specs
  { id: "page-01", title: "DT Order Sheet", accent: "indigo", phase: "A" },
  { id: "page-02", title: "Production Notes", accent: "crimson", phase: "A" },
  { id: "page-03", title: "DT Size Spec", accent: "orange", phase: "A" },
  
  // Phase B - Visuals & Graphics
  { id: "page-04", title: "Technical Sketch", accent: "teal", phase: "B" },
  { id: "page-05", title: "Graphic Placement", accent: "slate", phase: "B" },
  { id: "page-06", title: "Artwork Prints", accent: "steel", phase: "B" },
  { id: "page-07", title: "Color & Pantone", accent: "amber", phase: "B" },
  
  // Phase C - Bill of Materials
  { id: "page-08", title: "Fabric & Materials", accent: "blue", phase: "C" },
  { id: "page-09", title: "Trims & Hardware", accent: "emerald", phase: "C" },
  { id: "page-10", title: "Labels & Tags", accent: "violet", phase: "C" },
  { id: "page-11", title: "Thread Consumption", accent: "gold", phase: "C" },
  
  // Phase D - Technical Assembly
  { id: "page-12", title: "Operation Sequence", accent: "cyan", phase: "D" },
  { id: "page-13", title: "Construction Rules", accent: "sky", phase: "D" },
  { id: "page-14", title: "Grading Rules", accent: "mint", phase: "D" },
  { id: "page-15", title: "Measurements Guide", accent: "lime", phase: "D" },
  
  // Phase E - Compliance & QC
  { id: "page-16", title: "Packing Rules", accent: "red", phase: "E" },
  { id: "page-17", title: "Carton Specs", accent: "coral", phase: "E" },
  { id: "page-18", title: "QA Standards", accent: "magenta", phase: "E" },
  { id: "page-19", title: "Fit Photos", accent: "rose", phase: "E" },
];

const phaseTitles = {
  "A": "Order & Specifications",
  "B": "Visuals & Graphics",
  "C": "Bill of Materials",
  "D": "Technical Assembly",
  "E": "Compliance & QC"
};

export default function App() {
  const [slotFiles, setSlotFiles] = useState({});
  const [slotResults, setSlotResults] = useState({});
  const [activeSlotId, setActiveSlotId] = useState(documentSlots[0].id);
  const [draggingSlotId, setDraggingSlotId] = useState("");
  const [loadingSlotId, setLoadingSlotId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(null);
  const [showMasterDoc, setShowMasterDoc] = useState(false);
  const [masterData, setMasterData] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((data) => setHealth(data))
      .catch(() => {
        setHealth(null);
      });
  }, []);

  const handleSelect = async (incomingFiles, slotId) => {
    const nextFile = Array.from(incomingFiles || []).find((file) =>
      /\.(pdf|png|jpg|jpeg|webp)$/i.test(file.name)
    );
    if (!nextFile) {
      return;
    }

    const nextSlotFiles = {
      ...slotFiles,
      [slotId]: nextFile,
    };

    setSlotFiles(nextSlotFiles);
    setActiveSlotId(slotId);
    setLoadingSlotId(slotId);
    setError("");

    await runExtraction(slotId, nextFile);
  };

  const handleDrop = async (event, slotId) => {
    event.preventDefault();
    setDraggingSlotId("");
    await handleSelect(event.dataTransfer.files, slotId);
  };

  const clearSlot = async (slotId) => {
    const nextSlotFiles = { ...slotFiles };
    const nextSlotResults = { ...slotResults };
    delete nextSlotFiles[slotId];
    delete nextSlotResults[slotId];

    setSlotFiles(nextSlotFiles);
    setSlotResults(nextSlotResults);
    setActiveSlotId(slotId);
    setError("");
    setLoadingSlotId("");
  };

  const runExtraction = async (slotId, file) => {
    const slot = documentSlots.find((item) => item.id === slotId);
    if (!slot || !file) return;

    setIsLoading(true);
    setLoadingSlotId(slotId);
    setError("");

    try {
      const formData = new FormData();
      formData.append("files", file, file.name);
      formData.append("slotIds", slot.id);
      formData.append("slotTitles", slot.title);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      const pageResult = data.pages?.[0] || null;
      if (pageResult) {
        setSlotResults((current) => ({
          ...current,
          [slotId]: pageResult,
        }));
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
      setLoadingSlotId("");
    }
  };

  const compileMasterTemplate = async () => {
    setIsCompiling(true);
    setError("");
    try {
      const response = await fetch("http://localhost:3001/api/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotResults })
      });
      
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Merge API failed");
      }
      
      if (data.error) throw new Error(data.error);
      
      setMasterData(data);
      setShowMasterDoc(true);
    } catch (err) {
      setError("Failed to compile final sheet: " + err.message);
    } finally {
      setIsCompiling(false);
    }
  };



  const activeResult = slotResults[activeSlotId] || null;
  const displayJson = activeResult ? buildDisplayJson(activeResult) : null;

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="hero">
        <div className="hero-content">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
              <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" />
            </svg>
          </div>
          <div className="hero-text">
            <h1>Production Extractor</h1>
            <span className="badge">19-Slot Analysis</span>
          </div>
        </div>
      </header>

      <main className="workspace">
        <section className="panel uploader-panel">
          <div className="panel-heading">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--gold)'}}>
                <path d="M20.38 3.46L16 2a8.5 8.5 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
              </svg>
              <h2>Garment Production Assets</h2>
            </div>
            <span>{isLoading ? "extracting" : `${Object.keys(slotFiles).length}/19`}</span>
          </div>

          <div className="slot-list">
            {["A", "B", "C", "D", "E"].map((phase) => (
              <div key={`phase-${phase}`} className="phase-group">
                <div className="phase-header" style={{ color: 'var(--gold)' }}>
                  PHASE {phase} - {phaseTitles[phase]}
                </div>
                {documentSlots
                  .filter((slot) => slot.phase === phase)
                  .map((slot, index) => (
                    <DocumentSlotCard
                      key={slot.id}
                      slot={slot}
                      index={index}
                      file={slotFiles[slot.id]}
                      isActive={slot.id === activeSlotId}
                      isDragging={slot.id === draggingSlotId}
                      isLoading={isLoading && loadingSlotId === slot.id}
                      isLocked={isLoading || isCompiling}
                      onChoose={(event) => handleSelect(event.target.files, slot.id)}
                      onActivate={() => setActiveSlotId(slot.id)}
                      onDrop={(event) => handleDrop(event, slot.id)}
                      onDragEnter={(event) => {
                        event.preventDefault();
                        setDraggingSlotId(slot.id);
                      }}
                      onDragLeave={(event) => {
                        event.preventDefault();
                        if (draggingSlotId === slot.id) {
                          setDraggingSlotId("");
                        }
                      }}
                      onClear={() => clearSlot(slot.id)}
                    />
                  ))}
              </div>
            ))}
          </div>

          <div className="empty-state compact">
            {isLoading ? (
               <div className="inline-loader">
                  <span className="spinner-small" />
                  <strong>Extracting AI Data...</strong>
               </div>
            ) : (
               <strong>{documentSlots.find((slot) => slot.id === activeSlotId)?.title || "Page"}</strong>
            )}
          </div>

          {error ? <div className="error-box">{error}</div> : null}
        </section>

        <section className="panel result-panel">
          <div className="panel-heading">
            <div>
              <h2>Extracts</h2>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span>{activeResult?.slotTitle || "waiting"}</span>
              {Object.keys(slotResults).length > 0 && (
                <>
                  <button className="export-btn" onClick={compileMasterTemplate} disabled={isCompiling || isLoading} style={{ opacity: (isCompiling || isLoading) ? 0.5 : 1, cursor: (isCompiling || isLoading) ? 'not-allowed' : 'pointer' }}>
                    {isCompiling ? "Merging..." : "Compile Final Sheet"}
                  </button>
                  {masterData && <button className="export-btn print-btn" onClick={() => setShowMasterDoc(true)} disabled={isCompiling || isLoading} style={{ opacity: (isCompiling || isLoading) ? 0.5 : 1, cursor: (isCompiling || isLoading) ? 'not-allowed' : 'pointer' }}>View Generated PDF</button>}
                </>
              )}
            </div>
          </div>

          {showMasterDoc && masterData ? (
            <div className="in-panel-master">
              <MasterDocument masterData={masterData} slotResults={slotResults} onClose={() => setShowMasterDoc(false)} />
            </div>
          ) : isCompiling ? (
            <div className="result-placeholder loading-placeholder" style={{ backgroundColor: '#1e1e24' }}>
              <div className="compiler-modal" style={{boxShadow: 'none', background: 'transparent', border: 'none'}}>
                <div className="spinner-large"></div>
                <h2>AI Orchestration in Progress</h2>
                <p>Synthesizing production fragments into final Master Template...</p>
              </div>
            </div>
          ) : activeResult ? (
            <div className="result-content">
              <div className="section-header">
                <h3>JSON</h3>
              </div>
              <div className="json-block">
                <pre>{JSON.stringify(displayJson, null, 2)}</pre>
              </div>
            </div>
          ) : isLoading ? (
            <div className="result-placeholder loading-placeholder">
              <ExtractingScanner 
                filename={slotFiles[activeSlotId]?.name || "Document"} 
              />
            </div>
          ) : (
            <div className="result-placeholder">
              <strong>No result for {documentSlots.find((slot) => slot.id === activeSlotId)?.title || "page"}</strong>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function DocumentSlotCard({
  slot,
  index,
  file,
  isActive,
  isDragging,
  isLoading,
  onChoose,
  onActivate,
  onDrop,
  onDragEnter,
  onDragLeave,
  onClear,
}) {
  const inputRef = useRef(null);

  return (
    <div className={`doc-slot accent-${slot.accent} ${isActive ? "active" : ""}`}>
      <div className="doc-slot-header">
        <div>
          <span className="doc-slot-index">{index + 1}. {slot.title}</span>
        </div>
        {file ? (
          <button type="button" className="slot-clear" onClick={onClear}>
            x
          </button>
        ) : null}
      </div>

      <div
        className={`doc-slot-drop ${isDragging ? "dragging" : ""} ${isLoading ? "loading" : ""}`}
        onClick={onActivate}
        onDoubleClick={() => inputRef.current?.click()}
        onDragEnter={onDragEnter}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input ref={inputRef} type="file" accept={acceptedTypes} onChange={onChoose} />
        {isLoading ? (
          <div className="doc-slot-content loading-state" style={{ color: 'var(--gold)' }}>
            <span className="spinner-small" />
            <strong>Scanning...</strong>
            <span style={{color: 'var(--gold)', opacity: 0.8, fontSize: '11px'}}>{file?.name || "Processing"}</span>
          </div>
        ) : file ? (
          <div className="doc-slot-content filled">
            <strong>{file.name}</strong>
            <span>{formatSize(file.size)}</span>
            <small>{file.type || "file"}</small>
          </div>
        ) : (
          <div className="doc-slot-content">
            <strong>Drop File</strong>
            <span>Double click to upload</span>
          </div>
        )}
      </div>
    </div>
  );
}

function buildDisplayJson(pageResult) {
  return {
    slotTitle: pageResult.slotTitle,
    fileName: pageResult.fileName,
    pageType: pageResult.extraction?.pageType ?? null,
    brand: pageResult.extraction?.brand ?? null,
    pageRef: pageResult.extraction?.pageRef ?? null,
    styleId: pageResult.extraction?.styleId ?? null,
    summary: pageResult.extraction?.summary ?? null,
    data: pageResult.extraction?.data ?? {},
    warnings: pageResult.extraction?.warnings ?? [],
  };
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function ExtractingScanner({ filename }) {
  return (
    <div className="extracting-scanner">
      <div className="scanner-line"></div>
      <div className="scanner-content">
        <div className="spinner-large"></div>
        <h2>Analyzing Document</h2>
        <p>Extracting JSON data points from: <strong style={{color:"white"}}>{filename}</strong></p>
        <p className="scanner-subtext">AI Vision model is scanning coordinates and compiling output...</p>
      </div>
    </div>
  );
}
