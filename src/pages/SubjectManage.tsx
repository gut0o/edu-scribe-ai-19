import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Upload, ArrowLeft, FileText } from "lucide-react";
import { listFiles, uploadFiles, deleteFile, type FileItem } from "../services/filesService";
import { mockSubjects } from "@/lib/mock-data";

export default function SubjectManage() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const subject = mockSubjects.find((s) => s.id === id);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      setFiles(await listFiles(id));
    } catch {
      // ignore
    }
  }
  useEffect(() => {
    void refresh();
  }, [id]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setBusy(true);
    try {
      await uploadFiles(id, Array.from(e.target.files));
      await refresh();
      e.target.value = "";
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: FileItem) {
    setBusy(true);
    try {
      await deleteFile(id, item.storedName);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">
          Gerenciar matéria {subject ? `— ${subject.name}` : `#${id}`}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arquivos da matéria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Input type="file" multiple onChange={handleUpload} disabled={busy} />
            <Button variant="secondary" disabled>
              <Upload className="h-4 w-4 mr-2" /> Enviar
            </Button>
            <span className="text-sm text-muted-foreground">
              PDF, PPTX, imagens… (até 10 por vez)
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]" />
                <TableHead>Arquivo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Enviado em</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum arquivo ainda.
                  </TableCell>
                </TableRow>
              ) : (
                files.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <FileText className="h-4 w-4" />
                    </TableCell>
                    <TableCell>
                      <a href={f.url} target="_blank" rel="noreferrer" className="underline">
                        {f.filename}
                      </a>
                    </TableCell>
                    <TableCell>{(f.size / 1024).toFixed(1)} KB</TableCell>
                    <TableCell>{new Date(f.uploadedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(f)} disabled={busy}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
