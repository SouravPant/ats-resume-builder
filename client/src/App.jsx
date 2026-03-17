import { useState } from "react";
import axios from "axios";
import InputPanel from "./components/InputPanel";
import ResultsPanel from "./components/ResultsPanel";
import ResumeManager from "./components/ResumeManager";
import ErrorBoundary from "./components/ErrorBoundary";
import { demoJobDescription, demoResumeText } from "./utils/demoData";
import { exportResumePDF } from "./utils/pdfExport";

// For production (e.g. Vercel), default to relative paths so it correctly calls under the same domain
// This prevents accidental Mixed Content errors if VITE_API_URL is set incorrectly in Vercel.
const API = import.meta.env.MODE === "production" ? "" : (import.meta.env.VITE_API_URL || "http://localhost:3001");

export default function App() {
  const [jobDescription, setJobDescription] = useState(demoJobDescription);
  const [resumeText, setResumeText] = useState(demoResumeText);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      // Clear previous results to trigger loading state visually
      setResults(null);
      const res = await axios.post(`${API}/api/analyze`, {
        jobDescription,
        resumeText,
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRewrite = (rewrittenText) => {
    setResumeText((prev) => {
      // Append the rewrite at the end with a separator if the user can later curate
      return prev + "\n\n--- AI REWRITTEN SECTION ---\n" + rewrittenText;
    });
  };

  const handleLoadResume = (jd, rt) => {
    setJobDescription(jd);
    setResumeText(rt);
    setResults(null);
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      setError(null);
      await exportResumePDF("ATS_Resume");
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ===== Header ===== */}
      <header
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "white",
              boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
            }}
          >
            A
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.2,
              }}
            >
              ATS Resume Builder
            </h1>
            <p
              style={{
                fontSize: "0.65rem",
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
              }}
            >
              AI-Powered Resume Optimization
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            className="btn-secondary"
            onClick={handleExportPDF}
            disabled={exporting}
            style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            {exporting ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Exporting...
              </>
            ) : (
              <>📄 Export PDF</>
            )}
          </button>
        </div>
      </header>

      {/* ===== Error Banner ===== */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "var(--score-red)",
            padding: "10px 24px",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⚠️</span>
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: "none",
              color: "var(--score-red)",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ===== Resume Manager Bar ===== */}
      <div style={{ padding: "16px 24px 0" }}>
        <ResumeManager
          jobDescription={jobDescription}
          resumeText={resumeText}
          onLoad={handleLoadResume}
        />
      </div>

      {/* ===== Main Split Panel ===== */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          padding: "20px 24px 40px",
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Left — Inputs */}
        <div>
          <InputPanel
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            resumeText={resumeText}
            setResumeText={setResumeText}
            onAnalyze={handleAnalyze}
            loading={loading}
            onError={setError}
          />
        </div>

        {/* Right — Results */}
        <div>
          <ErrorBoundary>
            {loading && !results ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "400px", color: "var(--text-muted)", gap: "16px" }}>
                <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderTopColor: "var(--accent-blue)" }}></span>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Analyzing Resume...
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  This format usually takes 5-10 seconds.
                </p>
              </div>
            ) : (
              <ResultsPanel
                results={results}
                jobDescription={jobDescription}
                resumeText={resumeText}
                onApplyRewrite={handleApplyRewrite}
                onReanalyze={handleAnalyze}
              />
            )}
          </ErrorBoundary>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer
        style={{
          textAlign: "center",
          padding: "16px",
          borderTop: "1px solid var(--border-color)",
          fontSize: "0.72rem",
          color: "var(--text-muted)",
        }}
      >
        Built with React, Tailwind CSS & Google Gemini AI · ATS Resume Builder
      </footer>
    </div>
  );
}
