import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle2, ImageIcon, X, Loader2, ExternalLink, FolderOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const BATCH_SIZE = 10;

interface UploadState {
  projectId: string | null;
  projectViewUrl: string | null;
  totalFiles: number;
  uploadedFiles: number;
  currentBatch: number;
  totalBatches: number;
  batchProgress: number;
  errors: string[];
  phase: "idle" | "creating" | "uploading" | "done" | "error";
}

export default function UploadTestPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    projectId: null,
    projectViewUrl: null,
    totalFiles: 0,
    uploadedFiles: 0,
    currentBatch: 0,
    totalBatches: 0,
    batchProgress: 0,
    errors: [],
    phase: "idle",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  const addFiles = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length !== newFiles.length) {
      toast({
        title: "Arquivos ignorados",
        description: `Apenas imagens são aceitas. ${newFiles.length - imageFiles.length} arquivo(s) ignorado(s).`,
        variant: "destructive",
      });
    }
    setFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      const unique = imageFiles.filter(f => !existingNames.has(f.name));
      return [...prev, ...unique];
    });
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  }, [addFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const uploadBatch = useCallback(async (
    projectId: string,
    batch: File[],
    onProgress: (pct: number) => void
  ): Promise<number> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      batch.forEach(file => formData.append("photos", file));

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/projects/${projectId}/photos/upload`);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data.totalUploaded || batch.length);
          } catch {
            resolve(batch.length);
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.message || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Erro de rede"));
      xhr.send(formData);
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (!title.trim()) {
      toast({ title: "Nome do projeto é obrigatório", variant: "destructive" });
      return;
    }
    if (files.length === 0) {
      toast({ title: "Selecione pelo menos uma foto", variant: "destructive" });
      return;
    }

    setUploadState(s => ({ ...s, phase: "creating", errors: [] }));

    let projectId: string;
    try {
      const res = await fetch("/api/v2/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Erro ao criar projeto");
      }
      const proj = await res.json();
      projectId = proj.id;
    } catch (err: any) {
      setUploadState(s => ({
        ...s,
        phase: "error",
        errors: [err.message || "Erro ao criar projeto"],
      }));
      return;
    }

    const batches: File[][] = [];
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      batches.push(files.slice(i, i + BATCH_SIZE));
    }

    setUploadState(s => ({
      ...s,
      phase: "uploading",
      projectId,
      totalFiles: files.length,
      uploadedFiles: 0,
      currentBatch: 0,
      totalBatches: batches.length,
      batchProgress: 0,
    }));

    let totalUploaded = 0;
    const errors: string[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      setUploadState(s => ({ ...s, currentBatch: i + 1, batchProgress: 0 }));

      try {
        const count = await uploadBatch(projectId, batch, (pct) => {
          setUploadState(s => ({ ...s, batchProgress: pct }));
        });
        totalUploaded += count;
        setUploadState(s => ({ ...s, uploadedFiles: totalUploaded }));
      } catch (err: any) {
        errors.push(`Lote ${i + 1}: ${err.message}`);
      }
    }

    const viewUrl = `/project-view/${projectId}`;
    setUploadState(s => ({
      ...s,
      phase: "done",
      projectViewUrl: viewUrl,
      uploadedFiles: totalUploaded,
      errors,
    }));

    if (errors.length === 0) {
      toast({ title: `${totalUploaded} foto(s) enviada(s) com sucesso!` });
    }
  }, [title, description, files, uploadBatch, toast]);

  const overallProgress = uploadState.totalFiles > 0
    ? Math.round((uploadState.uploadedFiles / uploadState.totalFiles) * 100)
    : 0;

  const isUploading = uploadState.phase === "creating" || uploadState.phase === "uploading";
  const isDone = uploadState.phase === "done";

  if (isDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-0">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">Upload concluído!</h2>
              <p className="text-slate-500 mt-2">
                {uploadState.uploadedFiles} foto{uploadState.uploadedFiles !== 1 ? "s" : ""} enviada{uploadState.uploadedFiles !== 1 ? "s" : ""}.
                Os thumbnails serão gerados em breve.
              </p>
              {uploadState.errors.length > 0 && (
                <div className="mt-3 text-sm text-red-500">
                  {uploadState.errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white"
                onClick={() => setLocation(uploadState.projectViewUrl!)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver projeto
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setFiles([]);
                  setTitle("");
                  setDescription("");
                  setUploadState({
                    projectId: null, projectViewUrl: null,
                    totalFiles: 0, uploadedFiles: 0, currentBatch: 0, totalBatches: 0,
                    batchProgress: 0, errors: [], phase: "idle",
                  });
                }}
              >
                Novo upload
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Upload V2</h1>
            <p className="text-slate-500 text-sm">Sem compressão — original direto para o servidor</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Dados do projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Nome do projeto *</Label>
              <Input
                id="title"
                placeholder="Ex: Casamento João e Maria"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isUploading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Nome do cliente (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Nome do cliente ou observações"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                disabled={isUploading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Fotos</CardTitle>
            <CardDescription>
              Formatos aceitos: JPEG, PNG, WebP. Sem limite de tamanho por arquivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-purple-400 bg-purple-50"
                  : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
              }`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${
                  isDragging ? "bg-purple-100" : "bg-slate-100"
                }`}>
                  <FolderOpen className={`h-7 w-7 ${isDragging ? "text-purple-500" : "text-slate-400"}`} />
                </div>
                <div>
                  <p className="font-medium text-slate-700">
                    {isDragging ? "Solte aqui" : "Arraste ou clique para selecionar"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {files.length > 0 ? `${files.length} foto(s) selecionada(s)` : "Qualquer quantidade"}
                  </p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm">
                    <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="flex-1 truncate text-slate-700">{file.name}</span>
                    <span className="text-slate-400 shrink-0">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                    {!isUploading && (
                      <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isUploading && (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-purple-500 animate-spin shrink-0" />
                <div className="flex-1">
                  {uploadState.phase === "creating" ? (
                    <p className="text-sm font-medium text-slate-700">Criando projeto...</p>
                  ) : (
                    <p className="text-sm font-medium text-slate-700">
                      Enviando lote {uploadState.currentBatch} de {uploadState.totalBatches}...
                    </p>
                  )}
                </div>
                <span className="text-sm text-slate-500">
                  {uploadState.uploadedFiles}/{uploadState.totalFiles}
                </span>
              </div>
              <div className="space-y-2">
                <Progress value={overallProgress} className="h-2" />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total: {overallProgress}%</span>
                  <span>Lote atual: {uploadState.batchProgress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0 || !title.trim()}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold text-base rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Enviar {files.length > 0 ? `${files.length} foto${files.length !== 1 ? "s" : ""}` : "fotos"}
            </>
          )}
        </Button>

        <p className="text-center text-xs text-slate-400">
          As fotos são enviadas sem compressão. Thumbnails são gerados automaticamente no servidor.
        </p>
      </div>
    </div>
  );
}
