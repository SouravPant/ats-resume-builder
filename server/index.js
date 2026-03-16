const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");
const multer = require("multer");
const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---------- Multer setup (memory storage) ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

// ---------- Groq setup ----------
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

async function chatCompletion(prompt) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });
  return response.choices[0].message.content;
}

// ---------- POST /api/analyze ----------
app.post("/api/analyze", async (req, res) => {
  try {
    const { jobDescription, resumeText } = req.body;

    if (!jobDescription || !resumeText) {
      return res.status(400).json({ error: "Both jobDescription and resumeText are required." });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer.

Analyze the following resume against the given job description. Return a JSON object with exactly this structure:

{
  "score": <number 0-100>,
  "scoreBreakdown": {
    "keywordMatch": <number 0-100>,
    "skillsRelevance": <number 0-100>,
    "experienceAlignment": <number 0-100>,
    "educationMatch": <number 0-100>,
    "formattingAndReadability": <number 0-100>
  },
  "seniorityGap": {
    "jobLevel": "<inferred from JD, e.g., Junior, Mid, Senior, Lead>",
    "resumeLevel": "<inferred from resume>",
    "match": <boolean true/false>,
    "analysis": "<1-2 sentence explanation of the gap or alignment>"
  },
  "missingKeywords": ["keyword1", "keyword2"],
  "presentKeywords": ["keyword1", "keyword2"],
  "topSuggestions": [
    "<suggestion 1>",
    "<suggestion 2>",
    "<suggestion 3>",
    "<suggestion 4>",
    "<suggestion 5>"
  ],
  "summary": "<2-3 sentence overall assessment>",
  "sectionFeedback": {
    "summary": "<feedback on professional summary>",
    "skills": "<feedback on skills section>",
    "experience": "<feedback on experience section>",
    "education": "<feedback on education section>"
  }
}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}`;

    const text = await chatCompletion(prompt);
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err) {
    console.error("Analyze error:", err.message || err);
    return res.status(500).json({ error: "Failed to analyze resume. " + (err.message || err) });
  }
});

// ---------- POST /api/rewrite ----------
app.post("/api/rewrite", async (req, res) => {
  try {
    const { jobDescription, resumeText, section } = req.body;

    if (!jobDescription || !resumeText || !section) {
      return res.status(400).json({ error: "jobDescription, resumeText, and section are required." });
    }

    const prompt = `You are an expert resume writer specializing in ATS optimization.

Rewrite the "${section}" section of the following resume to better match the job description. 
Make it ATS-friendly: use relevant keywords naturally, quantify achievements where possible, and use strong action verbs.

Return a JSON object with this structure:

{
  "original": "<the original section text you identified>",
  "rewritten": "<your improved version>",
  "changes": ["<change 1 explanation>", "<change 2 explanation>"],
  "keywordsAdded": ["keyword1", "keyword2"]
}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

SECTION TO REWRITE: ${section}`;

    const text = await chatCompletion(prompt);
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err) {
    console.error("Rewrite error:", err.message || err);
    return res.status(500).json({ error: "Failed to rewrite section. " + (err.message || err) });
  }
});

// ---------- POST /api/parse-pdf ----------
app.post("/api/parse-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded." });
    }
    const data = await pdfParse(req.file.buffer);
    return res.json({ text: data.text, pages: data.numpages });
  } catch (err) {
    console.error("PDF parse error:", err.message || err);
    return res.status(500).json({ error: "Failed to parse PDF. " + (err.message || err) });
  }
});

// ---------- Health check ----------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", hasApiKey: !!process.env.GROQ_API_KEY, model: MODEL });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ ATS Resume Builder API running on http://localhost:${PORT}`);
    console.log(`   Model: ${MODEL} via Groq`);
  });
}

module.exports = app;
