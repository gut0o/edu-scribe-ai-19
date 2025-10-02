// src/services/filesService.ts
const API_URL = import.meta.env.VITE_API_URL as string;
const BASE = (API_URL || "").replace(/\/$/, ""); // remove barra final

export type FileItem = {
  id: string;
  subjectId: string;
  filename: string;
  storedName: string;
  url: string;        // virá do backend como /uploads/...
  size: number;
  mime: string;
  uploadedAt: string;
};

function absolutize(items: FileItem[]): FileItem[] {
  return items.map((i) => {
    const rel = i.url.startsWith("/") ? i.url : `/${i.url}`;
    return { ...i, url: `${BASE}${rel}` };
  });
}

export async function listFiles(subjectId: string): Promise<FileItem[]> {
  const res = await fetch(`${BASE}/subjects/${subjectId}/files`);
  if (!res.ok) throw new Error("Falha ao listar arquivos");
  const data: FileItem[] = await res.json();
  return absolutize(data);
}

export async function uploadFiles(subjectId: string, files: File[]): Promise<FileItem[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  const res = await fetch(`${BASE}/subjects/${subjectId}/files`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Falha ao enviar arquivos");
  const data: FileItem[] = await res.json();
  return absolutize(data);
}

export async function deleteFile(subjectId: string, storedName: string): Promise<void> {
  const res = await fetch(`${BASE}/subjects/${subjectId}/files/${encodeURIComponent(storedName)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Falha ao excluir arquivo");
}
