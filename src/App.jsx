import { useEffect, useState } from "react";

const acceptedTypes = ".pdf,.png,.jpg,.jpeg,.webp";

export default function App() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [sampleData, setSampleData] = useState(null);

  useEffect(() => {
    fetch("/api/samples")
      .then((response) => response.json())
      .then((data) => setSampleData(data))
      .catch(() => {
        setSampleData(null);
      });
  }, []);

  const handleSelect = (incomingFiles) => {
    const nextFiles = Array.from(incomingFiles || []).filter((file) =>
      /\.(pdf|png|jpg|jpeg|webp)$/i.test(file.name)
    );
    setFiles(nextFiles);
    setError("");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleSelect(event.dataTransfer.files);
  };

  const runExtraction = async () => {
    if (!files.length) {
      setError("Choose at least one PDF or image file.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      setResult(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="hero">
        <div>
          <p className="eyebrow">Production Sheet Intelligence</p>
          <h1>Production Document Extraction</h1>
          <h2 className="hero-subtitle">
            Convert PDF files and page images into standardized JSON for garment specs.
          </h2>
          <p className="hero-copy">
            Built for technical packs, artwork sheets, construction notes, and
            multi-page production documents. The extractor keeps normalized
            master fields and page-level source values together.
          </p>
        </div>

        <div className="status-card">
          <span>Sample Test Directory</span>
          <strong>{sampleData?.sampleDir || "D:\\TexLink\\Production_sheet\\test_data"}</strong>
          <p>Use one PDF for full-document extraction or upload the six PNG pages as separate image inputs.</p>
        </div>
      </header>

      <main className="workspace">
        <section className="panel uploader-panel">
          <div className="panel-heading">
            <div>
              <h2>Input Documents</h2>
              <p className="panel-subtitle">
                Upload production sheets in either PDF format or image format.
              </p>
            </div>
            <span>{files.length} selected</span>
          </div>

          <label
            className={`dropzone ${isDragging ? "dragging" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept={acceptedTypes}
              multiple
              onChange={(event) => handleSelect(event.target.files)}
            />
            <div className="dropzone-content">
              <span className="drop-badge">Supported Formats: PDF, PNG, JPG, WEBP</span>
              <h3>Drag and Drop Documents</h3>
              <p>Select one PDF file or multiple image files for extraction</p>
            </div>
          </label>

          <div className="file-list">
            {sampleData?.files?.length ? (
              <div className="sample-stack">
                <FormatGroup
                  title="Sample PDF Files"
                  subtitle="Recommended for combined document extraction"
                  items={filterByFormat(sampleData.files, "pdf")}
                  emptyMessage="No sample PDF files found."
                  itemKey="path"
                  valueGetter={(file) => file.name}
                />
                <FormatGroup
                  title="Sample Image Files"
                  subtitle="Useful for page-by-page extraction testing"
                  items={filterByFormat(sampleData.files, "image")}
                  emptyMessage="No sample image files found."
                  itemKey="path"
                  valueGetter={(file) => file.name}
                />
              </div>
            ) : null}

            {files.length ? (
              <div className="sample-stack">
                <FormatGroup
                  title="Selected PDF Files"
                  subtitle="Files ready for upload"
                  items={filterByFormat(files, "pdf")}
                  emptyMessage="No PDF files selected."
                  itemKey="name"
                  valueGetter={(file) => file.name}
                  metaGetter={(file) => formatSize(file.size)}
                />
                <FormatGroup
                  title="Selected Image Files"
                  subtitle="Files ready for upload"
                  items={filterByFormat(files, "image")}
                  emptyMessage="No image files selected."
                  itemKey="name"
                  valueGetter={(file) => file.name}
                  metaGetter={(file) => formatSize(file.size)}
                />
              </div>
            ) : (
              <div className="empty-state">
                <strong>No input files selected</strong>
                <p>Add a PDF or one or more images to begin extraction.</p>
              </div>
            )}
          </div>

          <button className="primary-button" onClick={runExtraction} disabled={isLoading}>
            {isLoading ? "Extracting..." : "Extract JSON"}
          </button>

          {error ? <div className="error-box">{error}</div> : null}
        </section>

        <section className="panel result-panel">
          <div className="panel-heading">
            <div>
              <h2>Extraction Results</h2>
              <p className="panel-subtitle">
                Review the merged profile summary and the standardized JSON response.
              </p>
            </div>
            <span>{result ? `${result.totalFiles} files processed` : "waiting"}</span>
          </div>

          {result ? (
            <>
              <div className="section-header">
                <h3>Master Profile Summary</h3>
                <p>Normalized values merged from the uploaded document set.</p>
              </div>
              <div className="summary-grid">
                {Object.entries(result.unifiedProfile.masterFields).map(([key, value]) => (
                  <div className="summary-item" key={key}>
                    <span>{toLabel(key)}</span>
                    <strong>{renderValue(value)}</strong>
                  </div>
                ))}
              </div>

              <div className="section-header">
                <h3>Standard JSON Output</h3>
                <p>Full extraction payload including page-level fields and unified output.</p>
              </div>
              <div className="json-block">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </>
          ) : (
            <div className="result-placeholder">
              <strong>Results will appear here</strong>
              <p>
                The extractor will show a master profile summary first, followed by the full
                standardized JSON output.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function FormatGroup({
  title,
  subtitle,
  items,
  emptyMessage,
  itemKey,
  valueGetter,
  metaGetter,
}) {
  return (
    <div className="sample-box">
      <div className="group-heading">
        <strong>{title}</strong>
        <p>{subtitle}</p>
      </div>
      {items.length ? (
        <div className="sample-list">
          {items.map((item) => (
            <div className="file-row" key={item[itemKey]}>
              <div>
                <strong>{valueGetter(item)}</strong>
                {metaGetter ? <span>{metaGetter(item)}</span> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="group-empty">{emptyMessage}</div>
      )}
    </div>
  );
}

function filterByFormat(items, format) {
  return (items || []).filter((item) => {
    const name = item.name || "";
    const isPdf = /\.pdf$/i.test(name);
    return format === "pdf" ? isPdf : !isPdf;
  });
}

function renderValue(value) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "[]";
  }
  return value || "null";
}

function toLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase())
    .trim();
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
