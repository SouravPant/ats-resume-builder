import { useState, useEffect } from "react";

const STORAGE_KEY = "ats_saved_resumes";

function loadResumes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveResumes(resumes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
}

export default function ResumeManager({
  jobDescription,
  resumeText,
  onLoad,
}) {
  const [resumes, setResumes] = useState(loadResumes);
  const [saveName, setSaveName] = useState("");
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    setResumes(loadResumes());
  }, []);

  const handleSave = () => {
    const name = saveName.trim();
    if (!name) return;

    const entry = {
      id: Date.now().toString(),
      name,
      jobDescription,
      resumeText,
      savedAt: new Date().toISOString(),
    };

    const updated = [...resumes.filter((r) => r.name !== name), entry];
    saveResumes(updated);
    setResumes(updated);
    setSaveName("");
    setShowSave(false);
  };

  const handleDelete = (id) => {
    const updated = resumes.filter((r) => r.id !== id);
    saveResumes(updated);
    setResumes(updated);
  };

  const handleLoad = (resume) => {
    onLoad(resume.jobDescription, resume.resumeText);
  };

  return (
    <div className="card" style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: resumes.length > 0 || showSave ? "12px" : "0",
        }}
      >
        <h2
          style={{
            fontSize: "0.9rem",
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
              width: "26px",
              height: "26px",
              borderRadius: "7px",
              background: "rgba(6,182,212,0.15)",
              color: "var(--accent-cyan)",
              fontSize: "0.8rem",
            }}
          >
            💾
          </span>
          Saved Resumes
          {resumes.length > 0 && (
            <span
              style={{
                fontSize: "0.65rem",
                background: "var(--bg-input)",
                padding: "2px 7px",
                borderRadius: "5px",
                color: "var(--text-muted)",
              }}
            >
              {resumes.length}
            </span>
          )}
        </h2>
        <button
          className="btn-secondary"
          onClick={() => setShowSave(!showSave)}
          style={{ fontSize: "0.75rem", padding: "5px 12px" }}
        >
          {showSave ? "Cancel" : "＋ Save Current"}
        </button>
      </div>

      {/* Save form */}
      {showSave && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Resume name..."
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!saveName.trim()}
            style={{ fontSize: "0.8rem", padding: "6px 16px" }}
          >
            Save
          </button>
        </div>
      )}

      {/* Saved list */}
      {resumes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {resumes.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg-input)",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-card-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--bg-input)")
              }
              onClick={() => handleLoad(r)}
            >
              <span style={{ fontSize: "0.85rem", fontWeight: 500, flex: 1 }}>
                {r.name}
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                }}
              >
                {new Date(r.savedAt).toLocaleDateString()}
              </span>
              <button
                className="btn-icon"
                style={{ width: "28px", height: "28px", fontSize: "0.7rem" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(r.id);
                }}
                title="Delete"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
