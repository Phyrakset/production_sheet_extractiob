import { useEffect, useRef, useState } from "react";

const acceptedTypes = ".pdf,.png,.jpg,.jpeg,.webp";
const documentSlots = [
  // Phase A - Order & Identity
  { id: "page-01", title: "Cover Page", accent: "indigo", phase: "A" },
  { id: "page-02", title: "Key Notes", accent: "crimson", phase: "A" },
  { id: "page-03", title: "Order Details", accent: "orange", phase: "A" },
  
  // Phase B - Design & Construction
  { id: "page-04", title: "Sketch", accent: "teal", phase: "B" },
  { id: "page-05", title: "Construction", accent: "slate", phase: "B" },
  { id: "page-06", title: "Mfg Standards", accent: "steel", phase: "B" },
  { id: "page-07", title: "Colorways", accent: "amber", phase: "B" },
  
  // Phase C - Materials & BOM
  { id: "page-08", title: "Materials", accent: "blue", phase: "C" },
  { id: "page-09", title: "Trims", accent: "emerald", phase: "C" },
  { id: "page-10", title: "Labels", accent: "violet", phase: "C" },
  { id: "page-11", title: "Artwork", accent: "gold", phase: "C" },
  
  // Phase D - Measurement & Fit
  { id: "page-12", title: "Measure", accent: "cyan", phase: "D" },
  { id: "page-13", title: "Grading", accent: "sky", phase: "D" },
  { id: "page-14", title: "Measure QA", accent: "mint", phase: "D" },
  { id: "page-15", title: "HTM Guide", accent: "lime", phase: "D" },
  
  // Phase E - Quality & Shipping
  { id: "page-16", title: "QA Standards", accent: "red", phase: "E" },
  { id: "page-17", title: "Sample Comments", accent: "coral", phase: "E" },
  { id: "page-18", title: "Fit Photos", accent: "magenta", phase: "E" },
  { id: "page-19", title: "Packaging", accent: "rose", phase: "E" },
];

export default function App() {
  const [slotFiles, setSlotFiles] = useState({});
  const [slotResults, setSlotResults] = useState({});
  const [activeSlotId, setActiveSlotId] = useState(documentSlots[0].id);
  const [draggingSlotId, setDraggingSlotId] = useState("");
  const [loadingSlotId, setLoadingSlotId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(null);

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

  const activeResult = slotResults[activeSlotId] || null;
  const displayJson = activeResult ? buildDisplayJson(activeResult) : null;

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="hero">
        <div>
          <p className="eyebrow">Production Sheet Intelligence</p>
          <h1>Factory Tech Pack Extraction</h1>
          <h2 className="hero-subtitle">19-Slot Phase Analysis</h2>
        </div>

        <div className="status-card">
          <span>Status</span>
          <strong>{health?.hasGeminiKey ? "Ready" : "Setup Needed"}</strong>
          <p>PDF, PNG, JPG, WEBP</p>
        </div>
      </header>

      <main className="workspace">
        <section className="panel uploader-panel">
          <div className="panel-heading">
            <div>
              <h2>Pages</h2>
            </div>
            <span>{isLoading ? "extracting" : `${Object.keys(slotFiles).length}/19`}</span>
          </div>

          <div className="slot-list">
            {["A", "B", "C", "D", "E"].map((phase) => (
              <div key={`phase-${phase}`} className="phase-group">
                <div className="phase-header">
                  Phase {phase}
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
            <strong>{isLoading ? "Extracting..." : documentSlots.find((slot) => slot.id === activeSlotId)?.title || "Page"}</strong>
          </div>

          {error ? <div className="error-box">{error}</div> : null}
        </section>

        <section className="panel result-panel">
          <div className="panel-heading">
            <div>
              <h2>Extracts</h2>
            </div>
            <span>{activeResult?.slotTitle || "waiting"}</span>
          </div>

          {activeResult ? (
            <>
              <div className="section-header">
                <h3>JSON</h3>
              </div>
              <div className="json-block">
                <pre>{JSON.stringify(displayJson, null, 2)}</pre>
              </div>
            </>
          ) : (
            <div className={`result-placeholder ${isLoading ? "loading" : ""}`}>
              {isLoading ? (
                <>
                  <span className="loader" />
                  <strong>Extracting...</strong>
                </>
              ) : (
                <strong>No result for {documentSlots.find((slot) => slot.id === activeSlotId)?.title || "page"}</strong>
              )}
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
          <div className="doc-slot-content loading-state">
            <span className="loader" />
            <strong>Extracting</strong>
            <span>{file?.name || "Uploading file"}</span>
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
