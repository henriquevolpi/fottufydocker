import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftCircle, Loader2, Save, Upload, X, ImagePlus, MessageSquare, Eye, EyeOff } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { Project, PhotoComment } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDropzone } from "react-dropzone";
import { nanoid } from "nanoid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { compressMultipleImages } from "@/lib/imageCompression";

// Esquema para validação do formulário
const projectEditSchema = z.object({
  name: z.string().min(3, { message: "O nome do projeto deve ter pelo menos 3 caracteres" }),
  clientName: z.string().min(3, { message: "O nome do cliente deve ter pelo menos 3 caracteres" }),
  clientEmail: z.string().optional(),
  status: z.string(),
  reopenSelection: z.boolean().optional()
});

type ProjectEditFormValues = z.infer<typeof projectEditSchema>;

export default function ProjectEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusMsg, setUploadStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const isV2Project = (pid: any) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(pid));

  // Query to fetch project comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery<PhotoComment[]>({
    queryKey: [`/api/projects/${id}/comments`],
    enabled: !!project && activeTab === "comments"
  });

  // Mutation to mark comments as viewed
  const markCommentsAsViewedMutation = useMutation({
    mutationFn: async (commentIds: string[]) => {
      return await apiRequest("POST", "/api/comments/mark-viewed", { commentIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/comments`] });
    }
  });
  
  // Função para lidar com os arquivos selecionados via drag-n-drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filtrar apenas imagens
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length === 0) {
      toast({
        title: "Arquivos inválidos",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }
    
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    
    // Verificar arquivos acima de 2MB
    const oversizedFiles = imageFiles.filter(file => file.size > MAX_FILE_SIZE);
    const validFiles = imageFiles.filter(file => file.size <= MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      toast({
        title: "Arquivos muito grandes",
        description: `Envie apenas fotos abaixo de 2MB. Arquivos rejeitados: ${fileNames}`,
        variant: "destructive",
      });
      
      if (validFiles.length === 0) {
        return;
      }
    }
    
    setNewPhotos(prev => [...prev, ...validFiles]);
  }, [toast]);
  
  // Configurar o dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    }
  });
  
  // Remover uma foto da lista de upload
  const removePhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  // Upload em lote via streaming (V2 — sem compressão, vai direto pro R2)
  const uploadBatchV2 = (
    projectId: string,
    batch: File[],
    onProgress: (pct: number) => void
  ): Promise<any> =>
    new Promise((resolve, reject) => {
      const formData = new FormData();
      batch.forEach(f => formData.append("photos", f));
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/projects/${projectId}/photos/upload`);
      xhr.withCredentials = true;
      xhr.timeout = 300_000;
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) onProgress(Math.round((ev.loaded / ev.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({}); }
        } else {
          try { reject(new Error(JSON.parse(xhr.responseText).message || `HTTP ${xhr.status}`)); }
          catch { reject(new Error(`HTTP ${xhr.status}`)); }
        }
      };
      xhr.onerror = () => reject(new Error("Erro de rede"));
      xhr.ontimeout = () => reject(new Error("Tempo esgotado"));
      xhr.send(formData);
    });

  // Função para fazer upload das novas fotos para o projeto
  const uploadPhotos = async () => {
    if (!project || newPhotos.length === 0) return;
    
    const projectId = String(project.id);
    const v2 = isV2Project(projectId);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // ── V2: streaming em lotes direto pro R2, sem compressão no front ──
      if (v2) {
        const BATCH_SIZE = 10;
        const batches: File[][] = [];
        for (let i = 0; i < newPhotos.length; i += BATCH_SIZE)
          batches.push(newPhotos.slice(i, i + BATCH_SIZE));
        const totalBatches = batches.length;

        for (let b = 0; b < totalBatches; b++) {
          setUploadStatusMsg(`Enviando lote ${b + 1} de ${totalBatches}...`);
          const batchBase = Math.round((b / totalBatches) * 95);
          const batchEnd  = Math.round(((b + 1) / totalBatches) * 95);

          await uploadBatchV2(projectId, batches[b], (pct) => {
            setUploadProgress(batchBase + Math.round((pct / 100) * (batchEnd - batchBase)));
          });
        }

        setUploadProgress(100);
        setUploadStatusMsg("Concluído!");
        clearPhotos();
        toast({
          title: "Fotos adicionadas com sucesso",
          description: `${newPhotos.length} foto(s) adicionada(s) ao projeto.`,
        });
        setTimeout(() => setLocation(`/project/${projectId}`), 1000);
        return;
      }

      // ── V1: compressão no front + upload único ──
      setUploadStatusMsg("Comprimindo imagens...");
      setUploadProgress(5);

      const compressedFiles = await compressMultipleImages(
        newPhotos,
        { maxWidthOrHeight: 970, quality: 0.9, useWebWorker: true },
        (processed, total) => {
          setUploadProgress(Math.round(5 + (processed / total) * 20));
        }
      );

      setUploadProgress(25);
      setUploadStatusMsg("Enviando fotos...");

      try {
        const formData = new FormData();
        compressedFiles.forEach(file => formData.append('photos', file));
        
        const response = await new Promise<Response>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setUploadProgress(Math.min(Math.round(25 + (event.loaded / event.total) * 70), 95));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(new Response(xhr.responseText, { status: xhr.status }));
            } else {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.open('POST', `/api/projects/${projectId}/photos`);
          xhr.setRequestHeader('credentials', 'include');
          xhr.send(formData);
        });
        
        if (response.ok) {
          setUploadProgress(100);
          clearPhotos();
          toast({
            title: "Fotos adicionadas com sucesso",
            description: `${compressedFiles.length} nova(s) foto(s) adicionada(s) ao projeto.`,
          });
          setTimeout(() => setLocation(`/project/${projectId}`), 1000);
          
          return;
        } else {
          const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
          console.error("Erro ao adicionar fotos:", errorData);
          
          // Mostrar erro específico baseado na resposta do servidor
          let errorMessage = "Erro durante o upload";
          let errorDetails = "";
          
          if (errorData.message) {
            errorMessage = errorData.message;
            errorDetails = errorData.details || "";
          } else if (response.status === 413) {
            errorMessage = "Arquivos muito grandes";
            errorDetails = "Reduza o tamanho das imagens ou envie menos fotos por vez";
          } else if (response.status === 401) {
            errorMessage = "Sessão expirada";
            errorDetails = "Faça login novamente para continuar";
          } else if (response.status === 403) {
            errorMessage = "Limite de uploads atingido";
            errorDetails = "Você atingiu o limite do seu plano atual";
          } else if (response.status >= 500) {
            errorMessage = "Problema no servidor";
            errorDetails = "Tente novamente em alguns minutos";
          }
          
          toast({
            title: errorMessage,
            description: errorDetails || errorData.suggestion || "Tente recarregar a página ou limpar o cache do navegador",
            variant: "destructive",
          });
          return;
        }
      } catch (apiError: any) {
        console.error("Erro na API ao adicionar fotos:", apiError);
        
        // Analisar tipo de erro de rede
        let errorMessage = "Problema de conexão";
        let errorDetails = "";
        
        if (apiError.name === "TypeError" && apiError.message.includes("fetch")) {
          errorMessage = "Sem conexão com o servidor";
          errorDetails = "Verifique sua conexão com a internet";
        } else if (apiError.name === "AbortError") {
          errorMessage = "Upload cancelado";
          errorDetails = "O upload foi interrompido";
        } else if (apiError.message.includes("timeout")) {
          errorMessage = "Tempo limite excedido";
          errorDetails = "Conexão muito lenta. Tente com menos fotos";
        } else {
          errorDetails = "Erro interno do sistema";
        }
        
        toast({
          title: errorMessage,
          description: errorDetails,
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('Erro ao adicionar fotos:', error);
      
      // Analisar o tipo de erro para dar mensagem mais específica
      let errorMessage = "Erro ao adicionar fotos";
      let errorDetails = "";
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes("projeto não encontrado") || errorMsg.includes("not found")) {
          errorMessage = "Projeto não encontrado";
          errorDetails = "O projeto pode ter sido removido ou você não tem mais acesso";
        } else if (errorMsg.includes("memória") || errorMsg.includes("memory")) {
          errorMessage = "Memória insuficiente";
          errorDetails = "Muitas fotos selecionadas. Tente com menos imagens por vez";
        } else if (errorMsg.includes("formato") || errorMsg.includes("type")) {
          errorMessage = "Formato de arquivo inválido";
          errorDetails = "Apenas imagens JPG, PNG e WEBP são permitidas";
        } else if (errorMsg.includes("tamanho") || errorMsg.includes("size")) {
          errorMessage = "Arquivo muito grande";
          errorDetails = "Reduza o tamanho das imagens antes de enviar";
        } else if (errorMsg.includes("limite") || errorMsg.includes("quota")) {
          errorMessage = "Limite de uploads atingido";
          errorDetails = "Você atingiu o limite do seu plano atual";
        } else if (errorMsg.includes("conexão") || errorMsg.includes("network")) {
          errorMessage = "Problema de conexão";
          errorDetails = "Verifique sua internet e tente novamente";
        } else if (errorMsg.includes("cache") || errorMsg.includes("localStorage")) {
          errorMessage = "Problema no cache do navegador";
          errorDetails = "Limpe o cache do navegador e tente novamente";
        } else {
          errorDetails = "Erro interno do sistema";
        }
      } else {
        errorDetails = "Erro desconhecido durante o processamento";
      }
      
      toast({
        title: errorMessage,
        description: errorDetails || "Tente recarregar a página ou entrar em contato com o suporte",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusMsg("");
    }
  };
  
  // Limpar todas as fotos da lista de upload
  const clearPhotos = () => {
    setNewPhotos([]);
  };

  // Inicializar o formulário com react-hook-form
  const form = useForm<ProjectEditFormValues>({
    resolver: zodResolver(projectEditSchema),
    defaultValues: {
      name: "",
      clientName: "",
      clientEmail: "",
      status: "pending",
      reopenSelection: false
    }
  });

  // Carregar dados do projeto para edição
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error('ID do projeto não fornecido');
        }
        
        console.log('Carregando projeto para edição, ID:', id);
        
        // Tentar carregar do backend primeiro
        try {
          const response = await fetch(`/api/projects/${id}`);
          if (response.ok) {
            const projectData = await response.json();
            setProject(projectData);
            
            // Preencher o formulário com os dados do projeto
            form.reset({
              name: projectData.name,
              clientName: projectData.clientName,
              clientEmail: projectData.clientEmail,
              status: projectData.status || "pending",
              reopenSelection: false
            });
            return;
          } else {
            throw new Error(`Erro ao carregar projeto: ${response.statusText}`);
          }
        } catch (apiError) {
          console.error('Erro ao buscar da API:', apiError);
          // Tentar carregar do localStorage como fallback
        }
        
        // Tentar carregar do localStorage como fallback
        const storedProjects = localStorage.getItem('projects');
        if (!storedProjects) {
          throw new Error('Nenhum projeto encontrado');
        }
        
        const projects = JSON.parse(storedProjects);
        const foundProject = projects.find((p: any) => String(p.id) === String(id));
        
        if (!foundProject) {
          throw new Error('Projeto não encontrado');
        }
        
        setProject(foundProject);
        
        // Preencher o formulário com os dados do projeto
        form.reset({
          name: foundProject.nome || foundProject.name,
          clientName: foundProject.cliente || foundProject.clientName,
          clientEmail: foundProject.emailCliente || foundProject.clientEmail,
          status: foundProject.status || "pending",
          reopenSelection: false
        });
        
      } catch (error) {
        console.error('Erro ao carregar projeto para edição:', error);
        toast({
          title: "Erro ao carregar projeto",
          description: "Não foi possível carregar os dados do projeto para edição.",
          variant: "destructive",
        });
        // Voltar para a página anterior após um breve delay
        setTimeout(() => {
          setLocation("/dashboard");
        }, 1500);
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [id, toast, setLocation, form]);
  
  // Salvar alterações do projeto
  const onSubmit = async (data: ProjectEditFormValues) => {
    if (!project) return;
    
    try {
      setSaving(true);
      
      // Dados para atualização
      const updateData = {
        name: data.name,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        status: data.status
      };
      
      // Tentar atualizar no backend primeiro
      try {
        const response = await fetch(`/api/projects/${project.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (response.ok) {
          // Se a opção de reabrir seleção estiver marcada, fazer uma requisição adicional
          if (data.reopenSelection) {
            const reopenResp = await fetch(`/api/projects/${project.id}/reopen`, {
              method: 'PATCH',
              credentials: 'include',
            });
            if (!reopenResp.ok) {
              const errText = await reopenResp.text().catch(() => '');
              console.error('Erro ao reabrir seleção:', reopenResp.status, errText);
              toast({
                title: "Erro ao reabrir seleção",
                description: "As alterações foram salvas, mas não foi possível reabrir a seleção. Tente novamente.",
                variant: "destructive",
              });
              setSaving(false);
              return;
            }
          }

          // Invalida o cache do projeto e da lista para forçar re-fetch atualizado
          await queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
          await queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
          
          toast({
            title: "Projeto atualizado",
            description: data.reopenSelection
              ? "Projeto reaberto com sucesso! O cliente pode selecionar fotos novamente."
              : "As alterações foram salvas com sucesso.",
          });
          
          // Voltar para a visualização do projeto
          setTimeout(() => {
            setLocation(`/project/${project.id}`);
          }, 1000);
          return;
        } else {
          console.error("Erro ao atualizar projeto:", await response.text());
          throw new Error("Não foi possível atualizar o projeto no servidor");
        }
      } catch (apiError) {
        console.error("Erro na API:", apiError);
        // Continuar com fallback para localStorage
      }
      
      // Fallback para localStorage
      const storedProjects = localStorage.getItem('projects');
      if (!storedProjects) {
        throw new Error('Erro ao atualizar: projetos não encontrados');
      }
      
      const projects = JSON.parse(storedProjects);
      const projectIndex = projects.findIndex((p: any) => p.id === project.id);
      
      if (projectIndex === -1) {
        throw new Error('Erro ao atualizar: projeto não encontrado');
      }
      
      // Atualizar o projeto com os novos dados
      const updatedProject = { ...projects[projectIndex] };
      
      // Mapear os campos do formulário para o formato do projeto
      updatedProject.nome = data.name;
      updatedProject.cliente = data.clientName;
      updatedProject.emailCliente = data.clientEmail;
      updatedProject.status = data.status;
      
      // Se a opção de reabrir seleção estiver marcada
      if (data.reopenSelection) {
        updatedProject.status = "reopened";
        updatedProject.finalizado = false;
        
        // Limpar as seleções existentes
        if (updatedProject.photos && Array.isArray(updatedProject.photos)) {
          updatedProject.photos = updatedProject.photos.map((photo: any) => ({
            ...photo,
            selected: false
          }));
        }
        updatedProject.selecionadas = 0;
      }
      
      // Salvar no localStorage
      projects[projectIndex] = updatedProject;
      localStorage.setItem('projects', JSON.stringify(projects));
      
      toast({
        title: "Projeto atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      
      // Voltar para a visualização do projeto
      setTimeout(() => {
        setLocation(`/project/${project.id}`);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um problema ao salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
          <p className="text-base font-medium text-slate-600">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center max-w-md p-8">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <X className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Projeto não encontrado</h1>
          <p className="text-sm text-slate-500 mb-6">
            O projeto que você está tentando editar não existe ou foi removido.
          </p>
          <Button onClick={() => setLocation("/dashboard")} className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-6">
            Voltar para Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80">
      {/* ── Page Header ── */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setLocation(`/project/${project.id}`)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeftCircle className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Voltar
          </button>
          <span className="text-slate-300">/</span>
          <h1 className="text-base font-semibold text-slate-800 truncate">
            Editar Projeto
            {project.name && (
              <span className="ml-2 text-violet-600 font-medium">{project.name}</span>
            )}
          </h1>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-10 items-center gap-1 rounded-xl bg-slate-200/70 p-1 text-slate-600 mb-6">
          <TabsTrigger
            value="details"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
          >
            <Eye className="h-3.5 w-3.5" />
            Detalhes
          </TabsTrigger>
          <TabsTrigger
            value="photos"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Adicionar Fotos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <Eye className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Informações do Projeto</h2>
                <p className="text-xs text-slate-500">Atualize os dados do projeto e do cliente</p>
              </div>
            </div>

            {/* Form Body */}
            <div className="px-6 py-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">Nome do Projeto</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Casamento Ana e Pedro"
                            className="h-10 rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-400 focus:ring-violet-400/20 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Nome do Cliente</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Ana Silva"
                              className="h-10 rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-400 focus:ring-violet-400/20 transition-colors"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Email do Cliente</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: cliente@email.com"
                              className="h-10 rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-400 focus:ring-violet-400/20 transition-colors"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">Status do Projeto</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-400">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="reviewed">Revisado</SelectItem>
                            <SelectItem value="archived">Arquivado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reopenSelection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5 border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                          />
                        </FormControl>
                        <div className="space-y-0.5 leading-none">
                          <FormLabel className="text-sm font-medium text-amber-800 cursor-pointer">Reabrir seleção de fotos</FormLabel>
                          <FormDescription className="text-xs text-amber-700/70">
                            Permite que o cliente faça uma nova seleção de fotos, descartando qualquer seleção anterior.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end items-center gap-3 pt-2 border-t border-slate-100 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation(`/project/${project.id}`)}
                      disabled={saving}
                      className="h-9 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 px-4 text-sm"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="h-9 rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-sm px-5 text-sm font-medium"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-3.5 w-3.5" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <ImagePlus className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Adicionar Novas Fotos</h2>
                <p className="text-xs text-slate-500">Arraste ou selecione imagens para adicionar ao projeto</p>
              </div>
            </div>
            <div className="px-6 py-6 space-y-6">
          <div
            {...getRootProps()}
            className={`relative rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragActive ? 'border-violet-400 bg-violet-50 scale-[1.01]' : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragActive ? 'bg-violet-100' : 'bg-slate-100'}`}>
                <ImagePlus className={`h-7 w-7 transition-colors ${isDragActive ? 'text-violet-500' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {isDragActive ? "Solte as imagens aqui..." : "Arraste e solte as fotos aqui"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  ou <span className="text-violet-600 font-medium underline underline-offset-2">clique para selecionar</span> — JPG, PNG, WEBP
                </p>
              </div>
            </div>
          </div>
          

          
          {newPhotos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700">
                  Arquivos selecionados
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5">
                    {newPhotos.length}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={clearPhotos}
                  className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Limpar todas
                </button>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 max-h-64 overflow-y-auto">
                {newPhotos.slice(0, 50).map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2.5 px-3 border-b border-slate-100 last:border-b-0 hover:bg-white transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <ImagePlus className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    </div>
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="ml-2 w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {newPhotos.length > 50 && (
                  <div className="py-2.5 px-3 text-xs font-medium text-slate-400 text-center border-t border-slate-100">
                    + {newPhotos.length - 50} arquivo(s) adicional(is)
                  </div>
                )}
              </div>
              
              {isUploading && (
                <div className="mt-4 p-4 bg-violet-50 rounded-xl border border-violet-200">
                  <div className="flex justify-between items-center text-xs font-medium text-violet-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>{uploadStatusMsg || `Processando ${newPhotos.length} fotos...`}</span>
                    </div>
                    <span className="tabular-nums">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-violet-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={uploadPhotos}
                  disabled={isUploading || newPhotos.length === 0}
                  className="h-9 rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-sm px-5 text-sm font-medium"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-3.5 w-3.5" />
                      Adicionar ao Projeto
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
            </div>
          </div>
        </TabsContent>


      </Tabs>

      <div className="flex justify-center pt-6 pb-2">
        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent select-none opacity-60">
          fottufy
        </span>
      </div>

      </div>
    </div>
  );
}