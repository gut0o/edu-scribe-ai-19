import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors()); // em prod: app.use(cors({ origin: ["http://seu-front"] }))
app.use(express.json({ limit: "10mb" }));

/* ========== OpenAI / Chat ========== */
const port = Number(process.env.PORT ?? 5174);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function systemPrompt(subjectId?: string) {
  return [
    "Você é um tutor educacional paciente e objetivo.",
    "Responda em português do Brasil.",
    "Explique passo a passo quando fizer sentido e sugira exercícios curtos.",
    subjectId ? `Contexto da matéria/assunto atual: #${subjectId}.` : "",
    "Se não tiver certeza, diga o que precisa para responder melhor."
  ].filter(Boolean).join(" ");
}

app.post("/chat", async (req, res) => {
  try {
    const subjectId = String(req.query.subjectId || "");
    const { messages = [], options } = req.body ?? {};

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: options?.temperature ?? 0.2,
      messages: [{ role: "system", content: systemPrompt(subjectId) }, ...messages],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    res.json({ messageId: completion.id, content, citations: [], usage: completion.usage });
  } catch (err: any) {
    const detail = err?.response?.data || err?.message || String(err);
    console.error("[/chat]", detail);
    res.status(500).json({ message: "Falha ao consultar o modelo.", detail });
  }
});

app.post("/chat/stream", async (req, res) => {
  try {
    const subjectId = String(req.query.subjectId || "");
    const { messages = [], options } = req.body ?? {};

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const send = (obj: any) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

    const stream = await openai.chat.completions.create({
      model: MODEL, temperature: options?.temperature ?? 0.2, stream: true,
      messages: [{ role: "system", content: systemPrompt(subjectId) }, ...messages],
    });

    let finalId: string | undefined;
    for await (const part of stream) {
      finalId = part.id ?? finalId;
      const delta = part.choices?.[0]?.delta?.content ?? "";
      if (delta) send({ type: "token", delta });
    }
    send({ type: "done", messageId: finalId ?? "msg_stream" });
    res.end();
  } catch (err: any) {
    const detail = err?.response?.data || err?.message || String(err);
    console.error("[/chat/stream]", detail);
    res.write(`data: ${JSON.stringify({ type: "error", message: "Falha no streaming", detail })}\n\n`);
    res.end();
  }
});

/* ========== Uploads por matéria ========== */

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// servir arquivos estáticos para download/preview
app.use("/uploads", express.static(UPLOAD_DIR));

// storage em disco: server/uploads/<subjectId>/
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const subjectId = String((req.params as any).id || "general");
    const dest = path.join(UPLOAD_DIR, subjectId);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    // preserva o nome, evita colisão adicionando timestamp
    const time = Date.now();
    const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
    cb(null, `${time}__${safe}`);
  }
});
const upload = multer({ storage });

type FileItem = {
  id: string; // igual ao nome salvo
  subjectId: string;
  filename: string; // original
  storedName: string; // nome salvo no disco
  url: string;
  size: number;
  mime: string;
  uploadedAt: string;
};

// Lista arquivos da matéria
app.get("/subjects/:id/files", (req, res) => {
  const subjectId = String(req.params.id);
  const dir = path.join(UPLOAD_DIR, subjectId);
  if (!fs.existsSync(dir)) return res.json([]);
  const items: FileItem[] = fs.readdirSync(dir).map((storedName) => {
    const full = path.join(dir, storedName);
    const stat = fs.statSync(full);
    const [ts, ...rest] = storedName.split("__");
    const filename = rest.join("__") || storedName;
    return {
      id: storedName,
      subjectId,
      filename,
      storedName,
      url: `/uploads/${subjectId}/${storedName}`,
      size: stat.size,
      mime: "application/octet-stream",
      uploadedAt: new Date(Number(ts) || stat.birthtimeMs).toISOString()
    };
  }).sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  res.json(items);
});

// Upload (multi) — form-data: files
app.post("/subjects/:id/files", upload.array("files", 10), (req, res) => {
  const subjectId = String(req.params.id);
  const files = (req.files as Express.Multer.File[]) || [];
  const items: FileItem[] = files.map((f) => ({
    id: f.filename,
    subjectId,
    filename: f.originalname,
    storedName: f.filename,
    url: `/uploads/${subjectId}/${f.filename}`,
    size: f.size,
    mime: f.mimetype,
    uploadedAt: new Date().toISOString(),
  }));
  res.status(201).json(items);
});

// Delete
app.delete("/subjects/:id/files/:storedName", (req, res) => {
  const { id: subjectId, storedName } = req.params as { id: string; storedName: string };
  const file = path.join(UPLOAD_DIR, subjectId, storedName);
  if (!fs.existsSync(file)) return res.status(404).json({ message: "Arquivo não encontrado" });
  fs.unlinkSync(file);
  res.json({ ok: true });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`API em http://localhost:${port}`);
});
