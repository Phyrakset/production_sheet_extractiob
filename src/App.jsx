import { useEffect, useRef, useState, useCallback } from "react";
import MasterDocument from "./MasterDocument";

const acceptedTypes = ".pdf,.png,.jpg,.jpeg,.webp";

// Inline SVG flag icons — renders identically on every browser
function FlagIcon({ code, size = 20 }) {
  const h = size * 0.7;
  const r = 2;
  const flags = {
    gb: (
      <svg width={size} height={h} viewBox="0 0 60 42" style={{ borderRadius: r, verticalAlign: "middle", display: "inline-block", flexShrink: 0 }}>
        <rect width="60" height="42" fill="#003478"/>
        <path d="M0 0L60 42M60 0L0 42" stroke="#fff" strokeWidth="7"/>
        <path d="M0 0L60 42M60 0L0 42" stroke="#CF142B" strokeWidth="4"/>
        <rect x="25" width="10" height="42" fill="#fff"/>
        <rect y="16" width="60" height="10" fill="#fff"/>
        <rect x="27" width="6" height="42" fill="#CF142B"/>
        <rect y="18" width="60" height="6" fill="#CF142B"/>
      </svg>
    ),
    cn: (
      <svg width={size} height={h} viewBox="0 0 60 42" style={{ borderRadius: r, verticalAlign: "middle", display: "inline-block", flexShrink: 0 }}>
        <rect width="60" height="42" fill="#DE2910"/>
        <g fill="#FFDE00">
          <polygon points="12,5 13.8,10.5 19.6,10.5 14.9,14 16.7,19.5 12,16 7.3,19.5 9.1,14 4.4,10.5 10.2,10.5"/>
          <polygon points="23,2 24,4.5 26.5,4.5 24.5,6 25.2,8.5 23,7 20.8,8.5 21.5,6 19.5,4.5 22,4.5"/>
          <polygon points="28,7 29,9.5 31.5,9.5 29.5,11 30.2,13.5 28,12 25.8,13.5 26.5,11 24.5,9.5 27,9.5"/>
          <polygon points="28,15 29,17.5 31.5,17.5 29.5,19 30.2,21.5 28,20 25.8,21.5 26.5,19 24.5,17.5 27,17.5"/>
          <polygon points="23,20 24,22.5 26.5,22.5 24.5,24 25.2,26.5 23,25 20.8,26.5 21.5,24 19.5,22.5 22,22.5"/>
        </g>
      </svg>
    ),
    tw: (
      <svg width={size} height={h} viewBox="0 0 60 42" style={{ borderRadius: r, verticalAlign: "middle", display: "inline-block", flexShrink: 0 }}>
        <rect width="60" height="42" fill="#FE0000"/>
        <rect width="30" height="21" fill="#000095"/>
        <g transform="translate(15,10.5)">
          <circle r="6" fill="#fff"/>
          <circle r="4" fill="#000095"/>
          <g fill="#fff">
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
              <polygon key={a} points="0,-6 1,-2 -1,-2" transform={`rotate(${a})`}/>
            ))}
          </g>
        </g>
      </svg>
    ),
    kh: (
      <svg width={size} height={h} viewBox="0 0 60 42" style={{ borderRadius: r, verticalAlign: "middle", display: "inline-block", flexShrink: 0 }}>
        <rect width="60" height="42" fill="#032EA1"/>
        <rect y="8" width="60" height="26" fill="#E00025"/>
        <g fill="#fff" transform="translate(30,21)">
          {/* Angkor Wat simplified silhouette */}
          <rect x="-10" y="-2" width="20" height="6" rx="0.5"/>
          <rect x="-7" y="-5" width="14" height="4" rx="0.5"/>
          <rect x="-2" y="-9" width="4" height="5" rx="0.5"/>
          <rect x="-6" y="-7" width="3" height="3" rx="0.5"/>
          <rect x="3" y="-7" width="3" height="3" rx="0.5"/>
        </g>
      </svg>
    ),
  };
  return flags[code] || <span style={{ fontSize: size * 0.7, lineHeight: 1 }}>🌐</span>;
}

const LANG_FLAG_CODES = {
  en: "gb",
  zh: "cn",
  "zh-hans": "cn",
  "zh-hant": "tw",
  km: "kh",
};

const LANG_LABELS = {
  en: "EN",
  zh: "ZH",
  "zh-hans": "ZH",
  "zh-hant": "ZH-TW",
  km: "KM",
};

const LANG_FULL_NAMES = {
  en: "English",
  zh: "Chinese",
  "zh-hans": "Chinese",
  "zh-hant": "Chinese (TW)",
  km: "Khmer",
};
const phaseLabels = {
  A: "A · Order & Identity",
  B: "B · Design & Construction",
  C: "C · Materials & BOM",
  D: "D · Measurement & Fit",
  E: "E · Quality & Shipping",
};

const documentSlots = [
  // Phase A — Order & Identity
  { id: "page-01", title: "Cover Page", accent: "crimson", phase: "A" },
  { id: "page-02", title: "Order Details", accent: "orange", phase: "A" },

  // Phase B — Design & Construction
  { id: "page-03", title: "Tech Sketch", accent: "teal", phase: "B" },
  { id: "page-04", title: "Construction", accent: "slate", phase: "B" },
  { id: "page-05", title: "Mfg Standards", accent: "steel", phase: "B" },
  { id: "page-06", title: "Colorways", accent: "amber", phase: "B" },

  // Phase C — Materials & BOM
  { id: "page-07", title: "BOM Fabrics", accent: "blue", phase: "C" },
  { id: "page-08", title: "BOM Trims", accent: "emerald", phase: "C" },
  { id: "page-09", title: "Labels", accent: "violet", phase: "C" },
  { id: "page-10", title: "Artwork", accent: "gold", phase: "C" },

  // Phase D — Measurement & Fit
  { id: "page-11", title: "POMs", accent: "cyan", phase: "D" },
  { id: "page-12", title: "Grading", accent: "sky", phase: "D" },
  { id: "page-13", title: "HTM Guide", accent: "lime", phase: "D" },
  { id: "page-14", title: "Measure QA", accent: "mint", phase: "D" },

  // Phase E — Quality & Shipping
  { id: "page-15", title: "PP Comments", accent: "coral", phase: "E" },
  { id: "page-16", title: "Fit Photos", accent: "magenta", phase: "E" },
  { id: "page-17", title: "QA Standards", accent: "red", phase: "E" },
  { id: "page-18", title: "Packaging", accent: "rose", phase: "E" },
  { id: "page-19", title: "Revision History", accent: "pewter", phase: "E" },
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

  // Translation state
  const [activeLang, setActiveLang] = useState(null); // null = original, "en"|"zh"|"km"
  const [translatedResults, setTranslatedResults] = useState({}); // { "page-01::en": {...}, ... }
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateStats, setTranslateStats] = useState(null);

  // Right panel tab state
  const [rightTab, setRightTab] = useState("glossary"); // "extracts" | "glossary"

  // Glossary state
  const [glossaryTerms, setGlossaryTerms] = useState([]);
  const [glossaryStats, setGlossaryStats] = useState(null);
  const [glossarySearch, setGlossarySearch] = useState("");
  const [glossaryLangPair, setGlossaryLangPair] = useState("");
  const [glossaryStatus, setGlossaryStatus] = useState("all");
  const [glossaryPage, setGlossaryPage] = useState(1);
  const [glossaryTotal, setGlossaryTotal] = useState(0);
  const [glossaryTotalPages, setGlossaryTotalPages] = useState(0);
  const [glossaryLoading, setGlossaryLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((data) => setHealth(data))
      .catch(() => {
        setHealth(null);
      });
    // Load glossary stats on mount
    fetch("/api/glossary/stats")
      .then((r) => r.json())
      .then((data) => setGlossaryStats(data))
      .catch(() => {});
  }, []);

  // Fetch glossary terms (parallel merged view)
  const fetchGlossary = useCallback(async (search, langPair, status, page) => {
    setGlossaryLoading(true);
    try {
      const params = new URLSearchParams({
        q: search,
        status,
        page: String(page),
        limit: "50",
      });
      const res = await fetch(`/api/glossary/parallel?${params}`);
      const data = await res.json();
      setGlossaryTerms(data.rows || []);
      setGlossaryTotal(data.total || 0);
      setGlossaryTotalPages(data.totalPages || 0);
    } catch {
      setGlossaryTerms([]);
    } finally {
      setGlossaryLoading(false);
    }
  }, []);

  // Load glossary when filters change
  useEffect(() => {
    fetchGlossary(glossarySearch, glossaryLangPair, glossaryStatus, glossaryPage);
  }, [glossaryLangPair, glossaryStatus, glossaryPage, fetchGlossary]);

  // Debounced search
  const handleGlossarySearch = (value) => {
    setGlossarySearch(value);
    setGlossaryPage(1);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchGlossary(value, glossaryLangPair, glossaryStatus, 1);
    }, 350);
  };

  // Clipboard paste support: Win+Shift+S screenshot → Ctrl+V into active slot
  useEffect(() => {
    const handlePaste = async (event) => {
      if (isLoading || isCompiling) return;
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          event.preventDefault();
          const blob = item.getAsFile();
          if (!blob) return;

          const ext = blob.type.split("/")[1] || "png";
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
          const fileName = `clipboard-${timestamp}.${ext}`;
          const file = new File([blob], fileName, { type: blob.type });

          await handleSelect([file], activeSlotId);
          return;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [activeSlotId, isLoading, isCompiling, slotFiles]);

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
      // Pass slotResults directly — MasterDocument renders each component in its own format
      setMasterData({ compiled: true });
      setShowMasterDoc(true);
    } catch (err) {
      setError("Failed to compile final sheet: " + err.message);
    } finally {
      setIsCompiling(false);
    }
  };

  // Translation handler
  const handleTranslate = async (lang) => {
    if (!activeResult) return;
    
    // If clicking same language, toggle off to original
    if (activeLang === lang) {
      setActiveLang(null);
      setTranslateStats(null);
      return;
    }
    
    // Check if we already have this translation cached
    const cacheKey = `${activeSlotId}::${lang}`;
    if (translatedResults[cacheKey]) {
      setActiveLang(lang);
      setTranslateStats(translatedResults[cacheKey]._stats);
      return;
    }
    
    setIsTranslating(true);
    setActiveLang(lang);
    setError("");
    setTranslateStats(null);
    
    try {
      const jsonData = buildDisplayJson(activeResult);
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonData,
          targetLang: lang,
          slotTitle: activeResult.slotTitle,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Translation failed");
      
      const stats = {
        glossaryMatches: data.glossaryMatches,
        aiTranslations: data.aiTranslations,
        totalTexts: data.totalTexts,
      };
      
      setTranslatedResults(prev => ({
        ...prev,
        [cacheKey]: { ...data.data, _stats: stats },
      }));
      setTranslateStats(stats);
    } catch (err) {
      setError("Translation failed: " + err.message);
      setActiveLang(null);
    } finally {
      setIsTranslating(false);
    }
  };

  // Compile with translated data
  const compileTranslated = async () => {
    if (!activeLang) return compileMasterTemplate();
    
    setIsCompiling(true);
    setError("");
    try {
      // For each slot that has a result, use translated version if available
      const translatedSlotResults = {};
      for (const [slotId, result] of Object.entries(slotResults)) {
        const ck = `${slotId}::${activeLang}`;
        if (translatedResults[ck]) {
          const { _stats, ...translatedData } = translatedResults[ck];
          // Rebuild extraction from the translated display JSON
          translatedSlotResults[slotId] = {
            ...result,
            slotTitle: result.slotTitle,
            extraction: {
              ...(result.extraction || {}),
              ...translatedData,
            },
          };
        } else {
          translatedSlotResults[slotId] = result;
        }
      }
      
      // Pass translated slotResults directly — MasterDocument renders each component
      setMasterData({ compiled: true, translatedSlotResults });
      setShowMasterDoc(true);
    } catch (err) {
      setError("Failed to compile translated sheet: " + err.message);
    } finally {
      setIsCompiling(false);
    }
  };

  const activeResult = slotResults[activeSlotId] || null;
  const originalJson = activeResult ? buildDisplayJson(activeResult) : null;
  
  // Use translated version if active
  const cacheKey = activeLang ? `${activeSlotId}::${activeLang}` : null;
  const translatedJson = cacheKey ? translatedResults[cacheKey] : null;
  const displayJson = translatedJson
    ? (() => { const { _stats, ...rest } = translatedJson; return rest; })()
    : originalJson;

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
                <div className="phase-header">
                  {phaseLabels[phase] || `Phase ${phase}`}
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

        {/* ── PANEL 2: EXTRACTS ── */}
        <section className="panel result-panel">
          <div className="panel-heading">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--cyan)'}}><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
              <h2>Extracts</h2>
              {/* Translation Language Buttons */}
              {activeResult && (
                <div className="lang-btns">
                  {["km", "zh", "en"].map((lang) => (
                    <button
                      key={lang}
                      className={`lang-btn ${activeLang === lang ? "active" : ""} ${isTranslating && activeLang === lang ? "loading" : ""}`}
                      onClick={() => handleTranslate(lang)}
                      disabled={isTranslating || isLoading || isCompiling}
                      title={`Translate to ${LANG_FULL_NAMES[lang]}`}
                    >
                      <FlagIcon code={LANG_FLAG_CODES[lang]} size={15} />
                      <span>{LANG_LABELS[lang]}</span>
                      {isTranslating && activeLang === lang && <span className="spinner-small" style={{ width: 10, height: 10, borderWidth: 1.5 }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span>{activeResult?.slotTitle || "waiting"}</span>
              {Object.keys(slotResults).length > 0 && (
                <>
                  <button className="export-btn" onClick={activeLang ? compileTranslated : compileMasterTemplate} disabled={isCompiling || isLoading} style={{ opacity: (isCompiling || isLoading) ? 0.5 : 1, cursor: (isCompiling || isLoading) ? 'not-allowed' : 'pointer' }}>
                    {isCompiling ? "Merging..." : activeLang ? `Compile (${LANG_LABELS[activeLang]})` : "Compile"}
                  </button>
                  {masterData && <button className="export-btn print-btn" onClick={() => setShowMasterDoc(true)} disabled={isCompiling || isLoading} style={{ opacity: (isCompiling || isLoading) ? 0.5 : 1, cursor: (isCompiling || isLoading) ? 'not-allowed' : 'pointer' }}>PDF</button>}
                </>
              )}
            </div>
          </div>
          
          {/* Translation Stats Bar */}
          {(translateStats || isTranslating) && (
            <div className="translate-stats-bar">
              {isTranslating ? (
                <>
                  <span className="spinner-small" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                  <span>Translating to {LANG_FULL_NAMES[activeLang]}... (Glossary → AI)</span>
                </>
              ) : translateStats ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Glossary: <strong>{translateStats.glossaryMatches}</strong></span>
                  <span className="stat-divider">|</span>
                  <span>AI: <strong>{translateStats.aiTranslations}</strong></span>
                  <span className="stat-divider">|</span>
                  <span>Total: <strong>{translateStats.totalTexts}</strong> texts</span>
                </>
              ) : null}
            </div>
          )}


          {showMasterDoc && masterData ? (
            <div className="in-panel-master">
              <MasterDocument
                masterData={masterData}
                slotResults={masterData.translatedSlotResults || slotResults}
                onClose={() => setShowMasterDoc(false)}
              />
            </div>
          ) : isCompiling ? (
            <div className="result-placeholder loading-placeholder" style={{ backgroundColor: '#1e1e24' }}>
              <div className="compiler-modal" style={{boxShadow: 'none', background: 'transparent', border: 'none'}}>
                <div className="spinner-large"></div>
                <h2>AI Orchestration in Progress</h2>
                <p>Synthesizing production fragments...</p>
              </div>
            </div>
          ) : activeResult ? (
            <div className="result-content">
              <div className="section-header">
                <h3>
                  {activeLang ? (
                    <><FlagIcon code={LANG_FLAG_CODES[activeLang]} size={16} /> {LANG_FULL_NAMES[activeLang]} Translation</>
                  ) : "JSON"}
                </h3>
                {activeLang && (
                  <button className="original-toggle" onClick={() => { setActiveLang(null); setTranslateStats(null); }}>
                    ← Original
                  </button>
                )}
              </div>
              <div className={`json-block ${activeLang ? "translated" : ""}`}>
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

        {/* ── PANEL 3: GLOSSARY ── */}
        <section className="panel glossary-section">
          <div className="panel-heading">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--gold)'}}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <h2>Glossary</h2>
            </div>
            <span>{glossaryTotal ? `${glossaryTotal.toLocaleString()} terms` : "loading..."}</span>
          </div>

          <div className="glossary-panel">
            {/* Search + Status */}
            <div className="glossary-controls">
              <div className="glossary-search-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input
                  type="text"
                  className="glossary-search"
                  placeholder="Search terms..."
                  value={glossarySearch}
                  onChange={(e) => handleGlossarySearch(e.target.value)}
                />
                {glossarySearch && (
                  <button className="search-clear" onClick={() => handleGlossarySearch("")}>✕</button>
                )}
              </div>
              <select
                className="glossary-filter"
                value={glossaryStatus}
                onChange={(e) => { setGlossaryStatus(e.target.value); setGlossaryPage(1); }}
              >
                <option value="all">All</option>
                <option value="verified">✓ Verified</option>
                <option value="unverified">○ Unverified</option>
              </select>
            </div>

            {/* Results count */}
            <div className="glossary-result-bar">
              <span>{glossaryTotal.toLocaleString()} terms{glossarySearch ? ` matching "${glossarySearch}"` : ""}</span>
              {glossaryLoading && <span className="spinner-small" />}
            </div>

            {/* Parallel language table */}
            <div className="glossary-list">
              {glossaryTerms.length === 0 && !glossaryLoading ? (
                <div className="glossary-empty">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.3}}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  <p>No glossary terms found</p>
                </div>
              ) : (
                <div className="parallel-table">
                  <div className="parallel-header">
                    <span className="parallel-col"><FlagIcon code="gb" size={13} /> English</span>
                    <span className="parallel-col"><FlagIcon code="cn" size={13} /> Chinese</span>
                    <span className="parallel-col"><FlagIcon code="kh" size={13} /> Khmer</span>
                  </div>
                  {glossaryTerms.map((row, i) => (
                    <div key={i} className="parallel-row">
                      <span className="parallel-col">{row.en || "—"}</span>
                      <span className="parallel-col">{row.zh || "—"}</span>
                      <span className="parallel-col">{row.km || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {glossaryTotalPages > 1 && (
              <div className="glossary-pagination">
                <button
                  className="page-btn"
                  disabled={glossaryPage <= 1}
                  onClick={() => setGlossaryPage((p) => Math.max(1, p - 1))}
                >
                  ← Prev
                </button>
                <span className="page-info">
                  {glossaryPage} / {glossaryTotalPages}
                </span>
                <button
                  className="page-btn"
                  disabled={glossaryPage >= glossaryTotalPages}
                  onClick={() => setGlossaryPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
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
            <span>Double-click or <kbd>Ctrl+V</kbd> to paste</span>
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
    otherInformation: pageResult.extraction?.otherInformation ?? [],
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
