import { useEffect, useMemo, useState } from "react";

/** Lê a URL da API do Vite com fallback local */
const API =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_URL) ||
  "http://localhost:5174";

/**
 * Botão + modal para o aluno perguntar à IA.
 * Só renderiza se `localStorage.getItem('role') === 'aluno'`.
 * Envia POST para `${API}/chat` com { message }.
 */
export default function AskAIButton({
  label = "Perguntar à IA",
  placeholder = "Digite sua pergunta…",
  contextHint,
}: {
  label?: string;
  placeholder?: string;
  /** opcional: contexto (ex.: nome da matéria) incluído antes da pergunta */
  contextHint?: string;
}) {
  // mostra apenas para aluno
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => setRole(localStorage.getItem("role")), []);
  const isAluno = useMemo(() => role === "aluno", [role]);
  if (!isAluno) return null;

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function ask() {
    setErr("");
    setAnswer("");
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    try {
      const body = {
        message: contextHint ? `Contexto: ${contextHint}\n\nPergunta: ${q}` : q,
      };
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
      setAnswer(data.answer || "Sem resposta.");
    } catch (e: any) {
      setErr(e?.message || "Falha ao consultar a IA.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setOpen(false);
    setQuestion("");
    setAnswer("");
    setErr("");
  }

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl bg-blue-600 px-4 py-2 text-white shadow hover:opacity-90"
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tire sua dúvida</h3>
              <button
                type="button"
                onClick={close}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Fechar
              </button>
            </div>

            {contextHint && (
              <div className="mb-3 rounded-lg border bg-gray-50 p-3 text-xs text-gray-700">
                <span className="font-medium">Contexto:</span> {contextHint}
              </div>
            )}

            <div className="space-y-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={ask}
                  disabled={loading}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  {loading ? "Perguntando…" : "Enviar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuestion("");
                    setAnswer("");
                    setErr("");
                  }}
                  className="rounded-lg border px-3 py-2"
                >
                  Limpar
                </button>
              </div>
            </div>

            {err && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {err}
              </div>
            )}

            {answer && (
              <div className="mt-3 max-h-80 overflow-auto rounded-lg border bg-gray-50 p-3 text-sm">
                <div className="mb-1 font-medium">Resposta da IA</div>
                <div className="whitespace-pre-wrap">{answer}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
