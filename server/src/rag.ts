// server/src/rag.ts
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import OpenAI from "openai";

export type LocalCitation = {
  type: "local";
  file: string;
  page: number;
  snippet: string;
};

export type WebCitation = {
  type: "web";
  url: string;
  title?: string;
  snippet?: string;
};

export type Citation = LocalCitation | WebCitation;

type Chunk = {
  id: string;
  subjectId: string;
  file: string;        // nome original
  storedName: string;  // nome salvo em /uploads
  page: number;
  text: string;
  embedding: number[];
};

const DATA_DIR = path.resolve(process.cwd(), "vectorstore");
fs.mkdirSync(DATA_DIR, { recursive: true });

function storePath(subjectId: string) {
  return path.join(DATA_DIR, `${subjectId}.json`);
}

function loadStore(subjectId: string): Chunk[] {
  const p = storePath(subjectId);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function saveStore(subjectId: string, chunks: Chunk[]) {
  fs.writeFileSync(storePath(subjectId), JSON.stringify(chunks, null, 2), "utf-8");
}

function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function splitIntoChunks(text: string, maxLen = 900): string[] {
  const parts = text
    .replace(/\r/g, "")
    .split(/\n{2,}/g)
    .map(t => t.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buf = "";
  for (const p of parts) {
    if ((buf + "\n\n" + p).length > maxLen) {
      if (buf) chunks.push(buf);
      if (p.length > maxLen) {
        for (let i = 0; i < p.length; i += maxLen) chunks.push(p.slice(i, i + maxLen));
        buf = "";
      } else {
        buf = p;
      }
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

export async function ingestPdfForSubject(params: {
  subjectId: string;
  fullPath: string;
  storedName: string;
  originalName: string;
}) {
  const { subjectId, fullPath, storedName, originalName } = params;

  const buffer = fs.readFileSync(fullPath);
  const parsed = await pdfParse(buffer);
  const textByPage = parsed.text.split("\f");

  const existing = loadStore(subjectId);
  const toAdd: Chunk[] = [];

  for (let pageIndex = 0; pageIndex < textByPage.length; pageIndex++) {
    const pageText = textByPage[pageIndex].trim();
    if (!pageText) continue;
    const chunks = splitIntoChunks(pageText);

    for (const c of chunks) {
      const emb = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: c,
      });
      toAdd.push({
        id: `${storedName}#p${pageIndex + 1}#${Math.random().toString(36).slice(2)}`,
        subjectId,
        file: originalName,
        storedName,
        page: pageIndex + 1,
        text: c,
        embedding: emb.data[0].embedding as number[],
      });
    }
  }

  const merged = [...existing, ...toAdd];
  saveStore(subjectId, merged);
  return toAdd.length;
}

export async function retrieveContext(params: { subjectId: string; query: string; topK?: number; }) {
  const { subjectId, query, topK = 6 } = params;
  const store = loadStore(subjectId);
  if (store.length === 0) return { context: "", citations: [] as LocalCitation[] };

  const qEmb = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: query });
  const q = qEmb.data[0].embedding as number[];

  const scored = store
    .map(ch => ({ ch, score: cosine(q, ch.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const citations: LocalCitation[] = scored.map(({ ch }) => ({
    type: "local",
    file: ch.file,
    page: ch.page,
    snippet: ch.text.slice(0, 400),
  }));

  const context = scored
    .map(({ ch }) => `Arquivo: ${ch.file} (p.${ch.page})\n${ch.text}`)
    .join("\n\n----\n\n");

  return { context, citations };
}

export async function webSearch(query: string) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return { snippets: "", citations: [] as WebCitation[] };

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: key, query, max_results: 5 }),
  });
  if (!res.ok) return { snippets: "", citations: [] as WebCitation[] };

  const json: any = await res.json();
  const results: any[] = json.results || [];
  const citations: WebCitation[] = results.map((r) => ({
    type: "web",
    url: r.url,
    title: r.title,
    snippet: r.content?.slice(0, 300),
  }));

  const snippets = results
    .map(r => `• ${r.title ?? r.url}\n${r.content?.slice(0, 500) ?? ""}\nFonte: ${r.url}`)
    .join("\n\n");

  return { snippets, citations };
}
