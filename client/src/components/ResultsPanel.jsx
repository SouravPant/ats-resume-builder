import { useState } from "react";
import ScoreGauge from "./ScoreGauge";
import axios from "axios";

// For production (e.g. Vercel), default to relative paths so it correctly calls under the same domain
const API = import.meta.env.VITE_API_URL || (import.meta.env.MODE === "development" ? "http://localhost:3001" : "");

export default function ResultsPanel({
  results,
  jobDescription,
  resumeText,
  onApplyRewrite,
  onReanalyze,
}) {
  const [rewriting, setRewriting] = useState(null);
  const [rewriteResult, setRewriteResult] = useState(null);

  if (!results) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: "400px",
          color: "var(--text-muted)",
          textAlign: "center",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "3rem", opacity: 0.3 }}>📊</div>
        <div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            No analysis yet
          </p>
          <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
            Paste a job description & resume, then click <strong>Analyze</strong>
          </p>
        </div>
      </div>
    );
  }

  const handleRewrite = async (section) => {
    try {
      setRewriting(section);
      setRewriteResult(null);
      const res = await axios.post(`${API}/api/rewrite`, {
        jobDescription,
        resumeText,
        section,
      });
      setRewriteResult({ section, ...res.data });
    } catch (err) {
      alert("Rewrite failed: " + (err.response?.data?.error || err.message));
    } finally {
      setRewriting(null);
    }
  };

  const sections = ["summary", "skills", "experience", "education"];

  return (
    <div id="results-panel-export" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "10px" }}>
      {/* Re-analyze Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "-10px" }} data-html2canvas-ignore="true">
        <button
          className="btn-primary"
          onClick={onReanalyze} 
          style={{ padding: "8px 16px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
        >
          🔄 Re-Analyze Resume
        </button>
      </div>

      {/* Score */}
      <div className="card animate-in" style={{ textAlign: "center" }}>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
              background: "rgba(6,182,212,0.15)",
              color: "var(--accent-cyan)",
              fontSize: "0.85rem",
            }}
          >
            🎯
          </span>
          ATS Compatibility Score
        </h2>
        <ScoreGauge score={results.score} />
        <p
          style={{
            marginTop: "14px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}
        >
          {results.summary}
        </p>

        {/* Score Breakdown */}
        {results.scoreBreakdown && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginTop: "16px",
            }}
          >
            {Object.entries(results.scoreBreakdown).map(([key, val]) => (
              <div
                key={key}
                style={{
                  background: "var(--bg-input)",
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    color:
                      val <= 40
                        ? "var(--score-red)"
                        : val <= 70
                          ? "var(--score-yellow)"
                          : "var(--score-green)",
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    textTransform: "capitalize",
                    marginTop: "2px",
                  }}
                >
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    {/* Seniority Gap */}
      {results.seniorityGap && (
        <div className="card animate-in" style={{ animationDelay: "0.05s" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "12px",
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
                background: results.seniorityGap.match ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                color: results.seniorityGap.match ? "var(--score-green)" : "var(--score-red)",
                fontSize: "0.85rem",
              }}
            >
              💼
            </span>
            Seniority Alignment
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Job Level: <strong style={{ color: "var(--text-primary)" }}>{results.seniorityGap.jobLevel}</strong>
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>|</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Resume Level: <strong style={{ color: "var(--text-primary)" }}>{results.seniorityGap.resumeLevel}</strong>
            </div>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {results.seniorityGap.analysis}
          </p>
        </div>
      )}

      {/* Missing Keywords */}
      {results.missingKeywords?.length > 0 && (
        <div className="card animate-in" style={{ animationDelay: "0.1s" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "12px",
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
                background: "rgba(239,68,68,0.15)",
                color: "var(--score-red)",
                fontSize: "0.85rem",
              }}
            >
              ⚠️
            </span>
            Missing Keywords
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.7rem",
                background: "rgba(239,68,68,0.15)",
                color: "var(--score-red)",
                padding: "3px 8px",
                borderRadius: "6px",
                fontWeight: 600,
              }}
            >
              {results.missingKeywords.length} missing
            </span>
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {results.missingKeywords.map((kw, i) => (
              <span key={i} className="badge-missing">
                ✕ {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Present Keywords */}
      {results.presentKeywords?.length > 0 && (
        <div className="card animate-in" style={{ animationDelay: "0.15s" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "12px",
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
                background: "rgba(34,197,94,0.15)",
                color: "var(--score-green)",
                fontSize: "0.85rem",
              }}
            >
              ✓
            </span>
            Matched Keywords
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {results.presentKeywords.map((kw, i) => (
              <span key={i} className="badge-present">
                ✓ {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top 5 Suggestions */}
      {results.topSuggestions?.length > 0 && (
        <div className="card animate-in" style={{ animationDelay: "0.18s", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
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
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "var(--score-yellow)",
                  fontSize: "0.85rem",
                }}
              >
                💡
              </span>
              Top 5 Actionable Suggestions
            </h2>
            <button
              className="btn-secondary"
              style={{ fontSize: "0.75rem", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={() => {
                const text = "Top 5 Suggestions to Improve Your Resume:\n\n" + results.topSuggestions.map((s, i) => `${i + 1}. ${s}`).join("\n");
                navigator.clipboard.writeText(text);
              }}
            >
              📋 Copy
            </button>
          </div>
          <ul style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {results.topSuggestions.map((suggestion, i) => (
              <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section Feedback + Rewrite Buttons */}
      {results.sectionFeedback && (
        <div className="card animate-in" style={{ animationDelay: "0.2s" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "16px",
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
              ✨
            </span>
            Section Feedback & AI Rewrite
          </h2>
          {sections.map((sec) => (
            <div
              key={sec}
              style={{
                background: "var(--bg-input)",
                borderRadius: "10px",
                padding: "14px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textTransform: "capitalize",
                  }}
                >
                  {sec}
                </span>
                <button
                  className="btn-secondary"
                  onClick={() => handleRewrite(sec)}
                  disabled={rewriting === sec}
                  style={{
                    fontSize: "0.75rem",
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {rewriting === sec ? (
                    <>
                      <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      Rewriting…
                    </>
                  ) : (
                    <>✨ Rewrite</>
                  )}
                </button>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {results.sectionFeedback[sec] || "No specific feedback."}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Rewrite Result */}
      {rewriteResult && (
        <div
          className="card animate-in"
          style={{
            border: "1px solid rgba(139,92,246,0.4)",
            background: "rgba(139,92,246,0.05)",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "12px",
              textTransform: "capitalize",
            }}
          >
            ✨ Rewritten: {rewriteResult.section}
          </h2>
          <div
            style={{
              background: "var(--bg-input)",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "12px",
              whiteSpace: "pre-wrap",
              fontSize: "0.85rem",
              lineHeight: 1.7,
              color: "var(--text-primary)",
            }}
          >
            {rewriteResult.rewritten}
          </div>

          {rewriteResult.keywordsAdded?.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <span
                style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}
              >
                Keywords added:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                {rewriteResult.keywordsAdded.map((kw, i) => (
                  <span key={i} className="badge-present" style={{ fontSize: "0.72rem" }}>
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {rewriteResult.changes?.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <span
                style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}
              >
                Changes made:
              </span>
              <ul
                style={{
                  marginTop: "6px",
                  paddingLeft: "18px",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                {rewriteResult.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-primary"
              style={{ fontSize: "0.82rem", padding: "8px 18px" }}
              onClick={() => {
                if (onApplyRewrite) onApplyRewrite(rewriteResult.rewritten);
              }}
            >
              ✅ Apply to Resume
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                navigator.clipboard.writeText(rewriteResult.rewritten);
              }}
            >
              📋 Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
