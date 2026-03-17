import { useRef, useState } from "react";
import axios from "axios";

// For production (e.g. Vercel), default to relative paths so it correctly calls under the same domain
const API = import.meta.env.VITE_API_URL || (import.meta.env.MODE === "development" ? "http://localhost:3001" : "");

export default function InputPanel({
  jobDescription,
  setJobDescription,
  resumeText,
  setResumeText,
  onAnalyze,
  loading,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("pdf", file);

      const res = await axios.post(`${API}/api/parse-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResumeText(res.data.text);
      setUploadedFile({ name: file.name, pages: res.data.pages });
    } catch (err) {
      alert("Failed to parse PDF: " + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      // Reset input so same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Job Description */}
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(59,130,246,0.15)",
                color: "var(--accent-blue)",
                fontSize: "0.85rem",
              }}
            >
              📋
            </span>
            Job Description
          </h2>
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              background: "var(--bg-input)",
              padding: "3px 8px",
              borderRadius: "6px",
            }}
          >
            {jobDescription.length} chars
          </span>
        </div>
        <textarea
          rows={10}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
        />
      </div>

      {/* Resume */}
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(139,92,246,0.15)",
                color: "var(--accent-purple)",
                fontSize: "0.85rem",
              }}
            >
              📄
            </span>
            Your Resume
          </h2>
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              background: "var(--bg-input)",
              padding: "3px 8px",
              borderRadius: "6px",
            }}
          >
            {resumeText.length} chars
          </span>
        </div>

        {/* PDF Upload Area */}
        <div
          style={{
            border: "2px dashed var(--border-color)",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "12px",
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.2s, background 0.2s",
            background: uploadedFile ? "rgba(34,197,94,0.05)" : "transparent",
            borderColor: uploadedFile ? "rgba(34,197,94,0.3)" : "var(--border-color)",
          }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "var(--accent-blue)";
            e.currentTarget.style.background = "rgba(59,130,246,0.05)";
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.borderColor = uploadedFile ? "rgba(34,197,94,0.3)" : "var(--border-color)";
            e.currentTarget.style.background = uploadedFile ? "rgba(34,197,94,0.05)" : "transparent";
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "var(--border-color)";
            e.currentTarget.style.background = "transparent";
            const file = e.dataTransfer.files?.[0];
            if (file && file.type === "application/pdf") {
              // Trigger upload manually
              const dt = new DataTransfer();
              dt.items.add(file);
              fileInputRef.current.files = dt.files;
              handlePdfUpload({ target: { files: [file] } });
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            style={{ display: "none" }}
          />
          {uploading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span className="spinner" style={{ borderTopColor: "var(--accent-blue)" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Extracting text from PDF...</span>
            </div>
          ) : uploadedFile ? (
            <div>
              <div style={{ fontSize: "0.85rem", color: "var(--score-green)", fontWeight: 600, marginBottom: "4px" }}>
                ✓ {uploadedFile.name} ({uploadedFile.pages} page{uploadedFile.pages !== 1 ? "s" : ""})
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Click or drag to upload a different PDF
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "1.3rem", marginBottom: "6px", opacity: 0.4 }}>📎</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                Upload Resume PDF
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Click to browse or drag & drop a PDF file
              </div>
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <div
            style={{
              textAlign: "center",
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            — or paste text below —
          </div>
          <textarea
            rows={14}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
          />
        </div>
      </div>

      {/* Analyze Button */}
      <button
        className="btn-primary"
        onClick={onAnalyze}
        disabled={loading || !jobDescription.trim() || !resumeText.trim()}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
      >
        {loading ? (
          <>
            <span className="spinner" /> Analyzing...
          </>
        ) : (
          <>🚀 Analyze Resume</>
        )}
      </button>
    </div>
  );
}
