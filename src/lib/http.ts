const API_URL = import.meta.env.VITE_API_URL as string;

export class HttpError extends Error {
  status: number; body?: any;
  constructor(status: number, message: string, body?: any) {
    super(message); this.status = status; this.body = body;
  }
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let body: any; try { body = await res.json(); } catch {}
    throw new HttpError(res.status, body?.message || res.statusText, body);
  }
  return res.json() as Promise<T>;
}
