import { useEffect, useState, useCallback, useRef, useMemo, Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getPhotoUrl, getImageUrl } from "@/lib/imageUtils";
import { CanvasPhoto } from "@/components/CanvasPhoto";
import { VirtualizedPhotoGrid } from "@/components/VirtualizedPhotoGrid";
import { useDeviceCapabilities } from "@/hooks/useVirtualization";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { PhotoComment, InsertPhotoComment } from "@shared/schema";
import { 
  Check, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  ArrowLeftCircle,
  ShieldAlert,
  FileText,
  List,
  X,
  Maximize,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Plus,
  Filter,
  FilterX,
  ArrowUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ErrorBoundary local para isolar crashes de subcomponentes sem derrubar a página
class LocalErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onReset?: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ProjectView] Erro isolado:", error.message, info.componentStack?.slice(0, 300));
  }
  reset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };
  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }
    return this.props.children;
  }
}

// Interface para fotos
interface Photo {
  id: string;
  url: string;
  filename: string;
  originalName?: string; // Nome original do arquivo
  selected: boolean;
  thumbnailUrl?: string | null;
  processingStatus?: string | null;
}

// Interface para o projeto
interface Project {
  id: number;
  nome: string;
  cliente: string;
  emailCliente: string;
  data: string;
  status: string;
  fotos: number;
  selecionadas: number;
  fotografoId: number;
  photos: Photo[];
  finalizado?: boolean;
  showWatermark?: boolean;
  includedPhotos?: number;
  additionalPhotoPrice?: number;
  eventDate?: string | null;      // Data do evento (YYYY-MM-DD), apenas V2
  contractedPhotos?: number;      // Fotos contratadas pelo cliente, apenas V2
}

export default function ProjectView({ params }: { params?: { id: string } }) {
  const urlParams = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  // Use os parâmetros passados ou os da URL
  const projectId = params?.id || urlParams.id;
  const { toast } = useToast();
  const { user } = useAuth();
  const deviceCapabilities = useDeviceCapabilities();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [finalizationSuccess, setFinalizationSuccess] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showSelectedFilenamesDialog, setShowSelectedFilenamesDialog] = useState(false);
  
  // Estados para o modal de visualização de imagem
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  
  // Estados para comentários
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [photoComments, setPhotoComments] = useState<Record<string, any[]>>({});
  const [expandedCommentPhoto, setExpandedCommentPhoto] = useState<string | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Estados para pagamento Pix via Mercado Pago
  const [pixData, setPixData] = useState<{ qrCode: string; copiaECola: string } | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixInternalId, setPixInternalId] = useState<string | null>(null);
  const [pixStatus, setPixStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [showPixDialog, setShowPixDialog] = useState(false);
  // Estado para pagamento com cartão
  const [cardLoading, setCardLoading] = useState(false);
  // Retorno do MP após checkout com cartão: "success" | "failure" | "pending" | null
  const [cardPaymentReturn, setCardPaymentReturn] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  // Referência para o timer de debounce do auto-save (declarada aqui para uso no cleanup abaixo)
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Evita auto-save disparando no mount (antes do usuário fazer qualquer seleção)
  const isFirstRender = useRef(true);
  // Só permite auto-save depois que loadProject() terminou e setSelectedPhotos foi chamado
  // Isso evita que race conditions de inicialização apaguem seleções existentes no banco
  const isProjectLoaded = useRef(false);
  
  // Otimização: Memoizar mapa de índices para evitar findIndex repetitivo
  const photoIndexMap = useMemo(() => {
    if (!project?.photos) return new Map();
    const map = new Map<string, number>();
    project.photos.forEach((photo, index) => {
      map.set(photo.id, index);
    });
    return map;
  }, [project?.photos]);

  // Query: verifica se o fotógrafo deste projeto aceita pagamento via MP
  const { data: mpStatus } = useQuery<{ acceptsPayment: boolean }>({
    queryKey: [`/api/mp/photographer-status/${projectId}`],
    enabled: !!projectId,
  });

  // Query: busca o último pagamento registrado do projeto no banco
  // Permite restaurar QR code Pix pendente e mostrar botões de pagamento mesmo após refresh
  const { data: projectPaymentData } = useQuery<{
    payment: {
      id: string;
      status: string;
      amount: number;
      pixCopiaECola: string | null;
      qrCodeBase64: string | null;
    } | null;
  }>({
    queryKey: [`/api/mp/project-payment/${projectId}`],
    enabled: !!projectId && isFinalized,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const projectPayment = projectPaymentData?.payment ?? null;

  // Inicia cobrança Pix para fotos extras
  const handlePixPayment = async () => {
    if (!project) return;
    const limit = Number(project.includedPhotos || 0);
    const price = Number(project.additionalPhotoPrice || 0);
    const extraCount = Math.max(0, selectedPhotos.size - limit);
    const totalCents = extraCount * price;
    if (totalCents <= 0) return;
    setPixLoading(true);
    try {
      const res = await fetch("/api/mp/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          amount: totalCents / 100,
          description: `${extraCount} foto(s) extra(s) — ${project.nome || project.cliente || "Projeto"}`,
          payerEmail: project.emailCliente || undefined,
        }),
      });
      const data = await res.json();
      if (data.pixCopiaECola || data.qrCodeBase64) {
        setPixData({ qrCode: data.qrCodeBase64 || "", copiaECola: data.pixCopiaECola || "" });
        setPixInternalId(data.internalId || null);
        setPixStatus("pending");
        setShowPixDialog(true);
      } else {
        toast({ title: "Erro ao gerar Pix", description: data.error || "Tente novamente.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro de conexão", description: "Não foi possível criar o pagamento.", variant: "destructive" });
    } finally {
      setPixLoading(false);
    }
  };

  // Inicia pagamento com cartão via MP Checkout Pro
  const handleCardPayment = async () => {
    if (!project) return;
    const limit = Number(project.includedPhotos || 0);
    const price = Number(project.additionalPhotoPrice || 0);
    const extraCount = Math.max(0, selectedPhotos.size - limit);
    const totalCents = extraCount * price;
    if (totalCents <= 0) return;
    setCardLoading(true);
    try {
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          amount: totalCents / 100,
          description: `${extraCount} foto(s) extra(s) — ${project.nome || project.cliente || "Projeto"}`,
        }),
      });
      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        toast({ title: "Erro ao iniciar pagamento", description: data.error || "Tente novamente.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro de conexão", description: "Não foi possível criar o pagamento.", variant: "destructive" });
    } finally {
      setCardLoading(false);
    }
  };

  // Detecta retorno do MP Checkout Pro via query params (?payment=success|failure|pending)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get("payment");
    if (paymentResult) {
      setCardPaymentReturn(paymentResult);
      // Limpa o param da URL sem recarregar a página
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, []);

  // Polling de status do pagamento Pix (a cada 5 segundos até aprovar/rejeitar)
  useEffect(() => {
    if (!pixInternalId || pixStatus !== "pending") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mp/payment-status/${pixInternalId}`);
        const data = await res.json();
        if (data.status === "approved") {
          setPixStatus("approved");
          setShowPixDialog(false);
          toast({ title: "Pagamento confirmado!", description: "Seu pagamento via Pix foi recebido com sucesso." });
          clearInterval(interval);
        } else if (data.status === "rejected" || data.status === "cancelled") {
          setPixStatus("rejected");
          clearInterval(interval);
        }
      } catch { /* ignora erros de rede no polling */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [pixInternalId, pixStatus]);

  // Carrega comentários apenas quando necessário (não todos de uma vez)
  // useEffect removido para melhor performance - comentários são carregados sob demanda

  // Função para alternar visualização dos comentários
  const toggleCommentSection = useCallback((photoId: string) => {
    if (expandedCommentPhoto === photoId) {
      setExpandedCommentPhoto(null);
    } else {
      setExpandedCommentPhoto(photoId);
      // Carrega comentários quando expande a seção (lazy loading)
      loadPhotoComments(photoId);
    }
  }, [expandedCommentPhoto]);

  // Mutation para criar comentário
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: InsertPhotoComment & { photoIdForClear: string }) => {
      const { photoIdForClear, ...actualCommentData } = commentData;
      const response = await apiRequest("POST", "/api/photo-comments", actualCommentData);
      return { result: await response.json(), photoIdForClear, photoId: actualCommentData.photoId };
    },
    onSuccess: (data) => {
      toast({
        title: "Comentário enviado!",
        description: "Seu comentário foi enviado com sucesso para o fotógrafo.",
      });
      // Limpar o campo de comentário da foto específica
      setCommentTexts(prev => ({ ...prev, [data.photoIdForClear]: "" }));
      // Forçar recarregamento dos comentários da foto para mostrar o novo comentário
      reloadPhotoComments(data.photoId);
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar comentário",
        description: "Não foi possível enviar seu comentário. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao enviar comentário:", error);
    },
  });

  // Função para carregar comentários de uma foto específica com timeout
  const loadPhotoComments = useCallback(async (photoId: string) => {
    try {
      // Verificar se já foi carregado para evitar requests duplicados
      if (photoComments[photoId]) {
        return;
      }
      
      // AbortController para timeout de comentarios
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`/api/photos/${photoId}/comments`, {
        signal: controller.signal,
        credentials: 'include',
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const comments = await response.json();
        setPhotoComments(prev => ({
          ...prev,
          [photoId]: comments
        }));
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Erro ao carregar comentários da foto:", error);
      }
    }
  }, [photoComments]);

  // Função para forçar recarregamento dos comentários (usado após criar novo comentário)
  const reloadPhotoComments = useCallback(async (photoId: string) => {
    try {
      // AbortController para timeout de comentarios
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`/api/photos/${photoId}/comments`, {
        signal: controller.signal,
        credentials: 'include',
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const comments = await response.json();
        setPhotoComments(prev => ({
          ...prev,
          [photoId]: comments
        }));
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Erro ao recarregar comentários da foto:", error);
      }
    }
  }, []);

  
  // Função para adaptar o formato do projeto (servidor ou localStorage)
  const adaptProject = (project: any): Project => {
    // Helpers para garantir URLs corretas
    const ensureValidImageUrl = (url: string): string => {
      if (!url) return '/placeholder.jpg';
      if (url.startsWith('http')) return url;
      if (url.includes('.r2.cloudflarestorage.com')) return `https://${url}`;
      const accountId = import.meta.env.VITE_R2_ACCOUNT_ID;
      const bucketName = import.meta.env.VITE_R2_BUCKET_NAME;
      if (accountId && bucketName) {
        return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${url}`;
      }
      return url;
    };
    
    // Mapeie o formato do servidor (name, clientName) para o formato do frontend (nome, cliente)
    const result = {
      id: project.id,
      nome: project.name || project.nome,
      cliente: project.clientName || project.cliente,
      emailCliente: project.clientEmail || project.emailCliente,
      data: project.createdAt || project.data,
      status: project.status,
      fotos: project.photos ? project.photos.length : project.fotos,
      selecionadas: project.selectedPhotos ? project.selectedPhotos.length : project.selecionadas,
      fotografoId: project.photographerId || project.fotografoId,
      photos: project.photos ? project.photos.map((p: any) => ({
        id: p.id,
        url: ensureValidImageUrl(p.url),
        filename: p.filename || 'photo.jpg',
        originalName: p.originalName || p.filename || 'photo.jpg',
        selected: p.selected !== undefined ? p.selected : (project.selectedPhotos ? project.selectedPhotos.includes(p.id) : false),
        thumbnailUrl: p.thumbnailUrl || null,
        processingStatus: p.processingStatus || null,
      })) : [],
      finalizado: project.status === "Completed" || project.status === "finalizado" || project.finalizado,
      showWatermark: project.showWatermark,
      // V1 usa includedPhotos/additionalPhotoPrice; V2 usa contractedPhotos/additionalPhotoPrice
      includedPhotos: project.includedPhotos || project.contractedPhotos || 0,
      additionalPhotoPrice: project.additionalPhotoPrice || 0,
      eventDate: project.eventDate || null,
      contractedPhotos: project.contractedPhotos || project.includedPhotos || 0,
    };
    
    return result;
  };

  // Função para carregar dados do projeto - Definida fora do useEffect para poder ser reutilizada
  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      // Reseta flag de dados carregados — bloqueia auto-save até que os dados estejam prontos
      isProjectLoaded.current = false;
      
      // Verificar se o ID é válido
      if (!projectId) {
        console.error('ID do projeto não fornecido');
        throw new Error('ID do projeto não fornecido');
      }
      
      console.log('Buscando projeto com ID:', projectId);
      
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Criar novo AbortController para timeout e cancelamento
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 30000); // 30 segundos de timeout
      
      try {
        // Fazer fetch diretamente da API com cache busting e timeout
        const response = await fetch(`/api/projects/${projectId}`, {
          credentials: 'include', // envia cookies para autenticação
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        clearTimeout(timeoutId);
      
      console.log('Status da resposta API:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar projeto: ${response.status} ${response.statusText}`);
      }
      
      const projectData = await response.json();
      
      // Adapter para manter compatibilidade com o resto do código
      const adaptedProject = adaptProject(projectData);
      
      // Atualizar state com dados do projeto
      setProject(adaptedProject);
      
      // Inicializar seleções de forma síncrona — iteração simples é <1ms mesmo com 1000 fotos
      // (setTimeout/batch assíncrono criava callbacks órfãos que corrompiam o estado)
      const preSelectedPhotos = new Set<string>();
      if (adaptedProject.photos) {
        for (const photo of adaptedProject.photos) {
          if (photo.selected) preSelectedPhotos.add(photo.id);
        }
      }
      setSelectedPhotos(preSelectedPhotos);
      isProjectLoaded.current = true;
      
      setIsFinalized(!!adaptedProject.finalizado);
      
        // Remover este projeto do localStorage para evitar usar dados desatualizados
        try {
          const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
          const filteredProjects = storedProjects.filter((p: any) => p.id.toString() !== projectId.toString());
          localStorage.setItem('projects', JSON.stringify(filteredProjects));
        } catch (storageError) {
          console.error('Erro ao limpar localStorage:', storageError);
        }
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      
      // Error handling melhorado
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Requisição cancelada ou timeout');
          toast({
            title: "Tempo limite excedido",
            description: "A conexão está lenta. Tente novamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao carregar projeto",
            description: "Não foi possível encontrar o projeto solicitado. Verifique se o link está correto.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erro ao carregar projeto",
          description: "Não foi possível encontrar o projeto solicitado. Verifique se o link está correto.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);
  
  // Carregar dados do projeto ao montar o componente
  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // Polling cirúrgico: atualiza apenas os cards cujo thumbnail mudou, sem recarregar o projeto todo
  useEffect(() => {
    if (!project) return;
    const hasPending = project.photos.some(
      p => p.processingStatus === 'pending' || p.processingStatus === 'processing'
    );
    if (!hasPending) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/photos/status`, {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) return;

        const statuses: Array<{ id: string; thumbnailUrl: string | null; processingStatus: string | null }> = await res.json();
        const statusMap = new Map(statuses.map(s => [s.id, s]));

        setProject(prev => {
          if (!prev) return prev;
          let changed = false;
          const updatedPhotos = prev.photos.map(photo => {
            const upd = statusMap.get(photo.id);
            if (!upd) return photo;
            if (
              upd.thumbnailUrl === photo.thumbnailUrl &&
              upd.processingStatus === photo.processingStatus
            ) return photo;
            changed = true;
            return { ...photo, thumbnailUrl: upd.thumbnailUrl, processingStatus: upd.processingStatus };
          });
          if (!changed) return prev;
          return { ...prev, photos: updatedPhotos };
        });
      } catch {
        // silencioso — não interrompe a experiência do usuário
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [project, projectId]);
  
  // Cleanup completo: cancelar requisições e limpar memória apenas no unmount
  // IMPORTANTE: deps = [] para não cancelar auto-save a cada troca de foto no modal
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);
  
  // Função para salvar automaticamente as seleções com debounce
  const autoSaveSelections = useCallback(async (newSelectedPhotos: Set<string>) => {
    if (!project) return;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    try {
      const selectedIds = Array.from(newSelectedPhotos);
      
      const response = await fetch(`/api/v2/photos/select`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, photoIds: selectedIds }),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      if (!response.ok) {
        console.error('Erro ao auto-salvar seleção:', response.status);
      }
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Auto-save timeout — será tentado novamente na próxima alteração');
      } else {
        console.error('Erro ao auto-salvar seleções:', error);
      }
      // Nunca propagar: erros de auto-save são silenciosos para não derrubar a página
    }
  }, [project, projectId]);

  // Alternar seleção de foto (state updater puro, sem side effects)
  const togglePhotoSelection = useCallback((photoId: string) => {
    // Verificação dupla para garantir que projetos finalizados não possam ser editados
    const isProjectFinalized = isFinalized || 
                              project?.status === "finalizado" || 
                              project?.status === "Completed" || 
                              project?.finalizado === true;
    
    if (isProjectFinalized) {
      return; // Impedir seleção se o projeto estiver finalizado
    }
    
    // State updater puro: sem side effects (setTimeout/clearTimeout) dentro
    setSelectedPhotos(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(photoId)) {
        newSelected.delete(photoId);
      } else {
        newSelected.add(photoId);
      }
      return newSelected;
    });
  }, [isFinalized, project?.status, project?.finalizado]);

  // Auto-save debounced: reage à mudança de selectedPhotos sem side effects no state updater
  // Só dispara depois que loadProject() concluiu e isProjectLoaded.current = true.
  // Isso garante que alterações de estado durante a inicialização nunca apaguem seleções do banco.
  useEffect(() => {
    // Marca a primeira execução do efeito, mas não dispara auto-save — dados ainda não carregaram
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Bloqueia auto-save até que os dados do projeto estejam completamente carregados
    if (!isProjectLoaded.current) return;
    if (!project || isFinalized) return;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveSelections(selectedPhotos);
    }, 1000);
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPhotos]);
  
  // Abrir modal com a imagem em tamanho completo (com otimização de memória)
  const openImageModal = useCallback((url: string, photoIndex: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Impedir que o clique propague para o Card (que faria a seleção da foto)
    
    // Get the photo from the current project
    const photo = project?.photos[photoIndex];
    if (photo) {
      // Use the photo's url directly
      setCurrentImageUrl(photo.url);
    } else {
      // Fallback if photo is not found
      setCurrentImageUrl(url);
    }
    
    setCurrentPhotoIndex(photoIndex);
    setImageModalOpen(true);
  }, [project?.photos]);
  
  // Otimização: Handlers memoizados para o VirtualizedPhotoGrid
  const handleCommentTextChange = useCallback((photoId: string, text: string) => {
    setCommentTexts(prev => ({ ...prev, [photoId]: text }));
  }, []);
  
  const handleSubmitComment = useCallback((photoId: string) => {
    const commentText = commentTexts[photoId];
    if (!commentText?.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, digite seu comentário.",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate({
      photoId,
      clientName: "Cliente",
      comment: commentText.trim(),
      photoIdForClear: photoId,
    });
  }, [commentTexts, toast, createCommentMutation]);
  
  // Navegar para a próxima foto no modal com cleanup de memória
  const goToNextPhoto = useCallback(() => {
    if (!project || project.photos.length === 0) return;
    
    // Limpar URL anterior se for blob
    if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentImageUrl);
    }
    
    const nextIndex = (currentPhotoIndex + 1) % project.photos.length;
    const nextPhoto = project.photos[nextIndex];
    
    // Just store the URL directly - getPhotoUrl will be applied when rendered
    setCurrentImageUrl(nextPhoto.url);
    setCurrentPhotoIndex(nextIndex);
  }, [project, currentPhotoIndex, currentImageUrl]);
  
  // Navegar para a foto anterior no modal com cleanup de memória
  const goToPrevPhoto = useCallback(() => {
    if (!project || project.photos.length === 0) return;
    
    // Limpar URL anterior se for blob
    if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentImageUrl);
    }
    
    const prevIndex = (currentPhotoIndex - 1 + project.photos.length) % project.photos.length;
    const prevPhoto = project.photos[prevIndex];
    
    // Just store the URL directly - getPhotoUrl will be applied when rendered
    setCurrentImageUrl(prevPhoto.url);
    setCurrentPhotoIndex(prevIndex);
  }, [project, currentPhotoIndex, currentImageUrl]);
  
  // Salvar seleções atuais sem finalizar
  const saveSelections = async () => {
    if (!project) return;
    
    try {
      // Array para guardar IDs das fotos selecionadas
      const selectedIds = Array.from(selectedPhotos);
      
      const response = await fetch(`/api/v2/photos/select`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectId: project.id,
          photoIds: selectedIds 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Erro na resposta da API:', response.status, errorData);
        throw new Error(`Erro ao salvar seleção: ${response.status} ${response.statusText}`);
      }
      
      toast({
        title: "Seleção salva",
        description: `${selectedPhotos.size} fotos selecionadas. Você ainda pode modificar sua seleção.`,
      });
      
      // Recarregar dados confirmados do servidor (save já foi aguardado acima)
      loadProject();
      
    } catch (error) {
      console.error('Erro ao salvar seleções:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um problema ao salvar suas seleções.",
        variant: "destructive",
      });
    }
  };
  
  // Finalizar seleção
  const finalizeSelection = async () => {
    if (!project) return;
    
    try {
      setIsSubmitting(true);
      
      // Cancela qualquer auto-save pendente para evitar race condition com o finalize
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      
      // Array para guardar IDs das fotos selecionadas
      const selectedIds = Array.from(selectedPhotos);
      
      // Tenta finalizar via API primeiro
      try {
        const response = await fetch(`/api/projects/${projectId}/finalize`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ selectedPhotos: selectedIds }),
        });
        
        if (response.ok) {
          setIsFinalized(true);
          setFinalizationSuccess(true);
          return;
        } else {
          const errorData = await response.json().catch(() => null);
          console.error('Erro ao finalizar via API:', errorData);
          // Continuar para tentar usar localStorage como fallback
        }
      } catch (apiError) {
        console.error('Erro ao finalizar via API:', apiError);
        // Continuar para tentar usar localStorage como fallback
      }
      
      // Fallback para localStorage
      
      // Obter projetos existentes
      const storedProjects = localStorage.getItem('projects');
      if (!storedProjects) {
        throw new Error('Erro ao finalizar: projetos não encontrados');
      }
      
      const projects: Project[] = JSON.parse(storedProjects);
      
      // Tentar encontrar o projeto de várias formas
      let projectIndex = projects.findIndex(p => p.id === project.id);
      
      // Se não encontrar pelo id como número, tentar como string
      if (projectIndex === -1) {
        projectIndex = projects.findIndex(p => p.id.toString() === project.id.toString());
      }
      
      // Se ainda não encontrou, verificar com o ID da URL
      if (projectIndex === -1 && projectId) {
        projectIndex = projects.findIndex(p => p.id.toString() === projectId);
      }
      
      if (projectIndex === -1) {
        throw new Error('Erro ao finalizar: projeto não encontrado');
      }
      
      // Atualizar o projeto com as seleções finais
      const updatedProject = { ...projects[projectIndex] };
      updatedProject.photos = updatedProject.photos.map(photo => ({
        ...photo,
        selected: selectedPhotos.has(photo.id)
      }));
      updatedProject.selecionadas = selectedPhotos.size;
      updatedProject.status = "finalizado";
      updatedProject.finalizado = true;
      
      // Salvar de volta no array de projetos
      projects[projectIndex] = updatedProject;
      localStorage.setItem('projects', JSON.stringify(projects));
      
      // Atualizar o projeto local
      setProject(updatedProject);
      setIsFinalized(true);
      setFinalizationSuccess(true);
      
    } catch (error) {
      console.error('Erro ao finalizar seleção:', error);
      toast({
        title: "Erro ao finalizar",
        description: "Ocorreu um problema ao finalizar sua seleção.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  // Função para fazer scroll suave para o topo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Controlar visibilidade do botão de scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navegação por teclado no modal (Esc fecha, setas navegam)
  useEffect(() => {
    if (!imageModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      try {
        if (e.key === 'Escape') setImageModalOpen(false);
        else if (e.key === 'ArrowRight') goToNextPhoto();
        else if (e.key === 'ArrowLeft') goToPrevPhoto();
      } catch {
        // silently ignore keyboard errors
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [imageModalOpen, goToNextPhoto, goToPrevPhoto]);
  
  const isSelectionLimitReached = useMemo(() => {
    const limit = Number(project?.includedPhotos);
    if (!limit || limit === 0) return false;
    return selectedPhotos.size >= limit;
  }, [project?.includedPhotos, selectedPhotos.size]);

  const additionalPhotosCount = useMemo(() => {
    const limit = Number(project?.includedPhotos);
    if (!limit || limit === 0) return 0;
    return Math.max(0, selectedPhotos.size - limit);
  }, [project?.includedPhotos, selectedPhotos.size]);

  const additionalPriceTotal = useMemo(() => {
    const price = Number(project?.additionalPhotoPrice);
    if (!price) return 0;
    return additionalPhotosCount * price;
  }, [additionalPhotosCount, project?.additionalPhotoPrice]);

  // Quando finaliza sem extras (ou fotógrafo não aceita MP), fecha o dialog de confirmação
  // IMPORTANTE: deve ficar APÓS os useMemo de additionalPhotosCount e additionalPriceTotal
  useEffect(() => {
    if (finalizationSuccess && (additionalPhotosCount === 0 || !mpStatus?.acceptsPayment)) {
      setShowConfirmDialog(false);
    }
  }, [finalizationSuccess, additionalPhotosCount, mpStatus?.acceptsPayment]);

  // Restaura estado do pagamento após refresh de página
  // Se havia um Pix pendente no banco → recarga QR code e retoma polling
  // Se já estava aprovado → marca como confirmado sem precisar de nova consulta
  useEffect(() => {
    if (!projectPayment || pixStatus !== null) return;
    if (projectPayment.status === "approved") {
      setPixStatus("approved");
    } else if (projectPayment.status === "pending" && projectPayment.pixCopiaECola) {
      setPixInternalId(projectPayment.id);
      setPixData({
        qrCode: projectPayment.qrCodeBase64 || "",
        copiaECola: projectPayment.pixCopiaECola,
      });
      setPixStatus("pending");
    }
  }, [projectPayment, pixStatus]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  const safeFormatDate = (dateValue: any, options?: Intl.DateTimeFormatOptions): string => {
    try {
      if (!dateValue) return '';
      let d: Date;
      // YYYY-MM-DD puro → interpreta como data local (evita shift de UTC para o dia anterior)
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [y, m, day] = dateValue.split('-').map(Number);
        d = new Date(y, m - 1, day);
      } else {
        d = new Date(dateValue);
      }
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('pt-BR', options);
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-600">Carregando galeria...</p>
      </div>
    );
  }
  
  if (accessDenied) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white shadow-lg rounded-lg">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para visualizar este projeto, pois ele pertence a outro fotógrafo.
          </p>
          <Button onClick={() => setLocation("/dashboard")}>
            Voltar para o Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold mb-2">Projeto não encontrado</h1>
          <p className="text-gray-600 mb-6">
            O projeto que você está tentando acessar não existe ou foi removido.
          </p>
          <Button onClick={() => setLocation("/dashboard")}>
            Voltar para o Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  // Pegar a primeira foto para usar como capa
  const coverPhoto = project.photos && project.photos.length > 0 ? project.photos[0] : null;
  const coverPhotoUrl = coverPhoto 
    ? (coverPhoto.url && !coverPhoto.url.includes('project-photos') 
        ? coverPhoto.url 
        : `https://cdn.fottufy.com/${coverPhoto.filename}`)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Floating Counter - Youze Style */}
      {!isFinalized && !finalizationSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${isSelectionLimitReached ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seleção</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedPhotos.size} <span className="text-slate-400 text-sm font-bold">/ {project?.includedPhotos || '∞'}</span>
                </p>
              </div>
            </div>
            
            {additionalPhotosCount > 0 && (
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Adicionais (+{additionalPhotosCount})</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(additionalPriceTotal)}</p>
              </div>
            )}

            <Button 
              onClick={() => setShowConfirmDialog(true)}
              disabled={selectedPhotos.size === 0 || isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest px-6 h-12 rounded-2xl shadow-md transition-colors"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finalizar"}
            </Button>
          </div>
        </div>
      )}
      {/* Hero Section Premium - Experiência Imersiva */}
      {coverPhotoUrl && (
        <div className="relative h-[100svh] md:h-[95vh] overflow-hidden">
          {/* Background principal com efeito Ken Burns suave */}
          <div 
            className="absolute inset-0 bg-cover bg-center animate-[kenburns_20s_ease-in-out_infinite_alternate]"
            style={{
              backgroundImage: `url(${coverPhotoUrl})`,
            }}
          />
          
          {/* Camada de blur sutil */}
          <div className="absolute inset-0 backdrop-blur-[1px]" />
          
          {/* Gradiente cinematográfico multicamada */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
          
          {/* Efeito vinheta nas bordas */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.5)]" />
          
          {/* Partículas decorativas (bokeh effect) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}} />
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-300/10 rounded-full blur-2xl animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}} />
            <div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-fuchsia-300/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}} />
          </div>
          
          {/* Conteúdo principal centralizado */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
            {/* Badge decorativo animado */}
            <div className="mb-6 animate-[fadeInDown_1s_ease-out]">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/90 text-xs sm:text-sm font-medium tracking-wide uppercase">
                  Galeria Exclusiva
                </span>
              </div>
            </div>
            
            {/* Título principal com animação */}
            <h1 className="font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight uppercase drop-shadow-2xl animate-[fadeInUp_1s_ease-out_0.3s_both] leading-[0.9]">
              {project.nome}
            </h1>
            
            {/* Linha decorativa animada */}
            <div className="mt-6 mb-4 animate-[scaleX_1s_ease-out_0.6s_both]">
              <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full" />
            </div>
            
            {/* Nome do cliente */}
            <p className="text-white/80 text-lg sm:text-xl md:text-2xl font-light tracking-wide animate-[fadeInUp_1s_ease-out_0.5s_both]">
              {project.cliente}
            </p>
            
            {/* Badges de informação */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-[fadeInUp_1s_ease-out_0.7s_both]">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white text-sm font-medium">
                  {project.eventDate
                    ? safeFormatDate(project.eventDate, { day: 'numeric', month: 'long', year: 'numeric' })
                    : safeFormatDate(project.data, { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white text-sm font-medium">{project.fotos} fotos</span>
              </div>
              {project.contractedPhotos > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white text-sm font-medium">{project.contractedPhotos} contratadas</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Indicador de scroll animado - apenas mobile */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-[fadeIn_1s_ease-out_1.5s_both] md:bottom-10">
            <div className="flex flex-col items-center gap-2">
              <span className="text-white/60 text-xs uppercase tracking-widest font-medium">Ver fotos</span>
              <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1 flex justify-center">
                <div className="w-1.5 h-3 bg-white/70 rounded-full animate-[scrollDown_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
          
          {/* Overlay de proteção inferior para transição suave */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
        </div>
      )}
      
      {/* Header com Ações - Youze Style */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="w-full">
            
            {/* Seção de ações - responsiva com wrap */}
            <div className="w-full flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3">
              {isFinalized ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex items-center rounded-full font-bold shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Seleção finalizada
                  </Badge>
                  
                  {selectedPhotos.size > 0 && (
                    <Dialog open={showSelectedFilenamesDialog} onOpenChange={setShowSelectedFilenamesDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center flex-shrink-0 rounded-xl border-slate-200 hover:bg-slate-50 font-semibold text-xs sm:text-sm"
                        >
                          <FileText className="w-4 h-4 mr-1.5" />
                          Ver Fotos Selecionadas
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="font-black text-xl">Resumo da Seleção</DialogTitle>
                          <DialogDescription asChild>
                            <div>
                              <span>Você selecionou {selectedPhotos.size} fotos.</span>
                              {project.includedPhotos && project.includedPhotos > 0 && (
                                <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <p className="text-sm font-bold text-slate-700">Fotos Incluídas: {project.includedPhotos}</p>
                                  {selectedPhotos.size > project.includedPhotos ? (
                                    <p className="text-sm font-bold text-amber-600">
                                      Fotos Adicionais: {selectedPhotos.size - project.includedPhotos} ({formatCurrency((selectedPhotos.size - project.includedPhotos) * (Number(project.additionalPhotoPrice) || 0))})
                                    </p>
                                  ) : (
                                    <p className="text-sm font-bold text-green-600">Nenhuma foto adicional</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[55vh] overflow-y-auto mt-2 pr-1">
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {project.photos
                              .filter(photo => selectedPhotos.has(photo.id))
                              .map(photo => {
                                const thumb = photo.thumbnailUrl || `https://cdn.fottufy.com/${photo.filename}`;
                                const name = (photo.originalName || photo.filename || '').replace(/\.[^.]+$/, '');
                                return (
                                  <div key={photo.id} className="group flex flex-col gap-1">
                                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                                      <img
                                        src={thumb}
                                        alt={name}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                      />
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate text-center leading-tight px-0.5">{name}</p>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={() => setShowSelectedFilenamesDialog(false)}
                            className="rounded-xl bg-slate-900 hover:bg-slate-800"
                          >
                            Fechar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              ) : (
                <div className="w-full flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex items-center rounded-full font-bold shadow-lg shadow-purple-500/20 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                    <span className="whitespace-nowrap">{selectedPhotos.size} de {project.photos?.length || 0}</span>
                  </Badge>
                  
                  {/* Badge de fotos incluídas/adicionais */}
                  {(project.includedPhotos !== undefined && project.includedPhotos !== null && project.includedPhotos > 0) && (
                    <Badge className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex items-center rounded-full font-bold flex-shrink-0 ${
                      selectedPhotos.size > project.includedPhotos
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                        : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/20'
                    }`}>
                      {selectedPhotos.size <= project.includedPhotos ? (
                        <span className="whitespace-nowrap">✓ {selectedPhotos.size}/{project.includedPhotos} incluídas</span>
                      ) : (
                        <span className="whitespace-nowrap">
                          +{selectedPhotos.size - project.includedPhotos} extra
                          {project.additionalPhotoPrice && project.additionalPhotoPrice > 0 && (
                            <span className="ml-1 hidden sm:inline text-amber-600 font-bold">
                              (R$ {((selectedPhotos.size - project.includedPhotos) * project.additionalPhotoPrice / 100).toFixed(2)})
                            </span>
                          )}
                        </span>
                      )}
                    </Badge>
                  )}
                  
                  {/* Botão de filtro - Youze Style */}
                  {selectedPhotos.size > 0 && (
                    <Button
                      variant={showOnlySelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowOnlySelected(!showOnlySelected)}
                      className={`flex items-center flex-shrink-0 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                        showOnlySelected 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {showOnlySelected ? (
                        <>
                          <FilterX className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Mostrar Todas</span>
                          <span className="sm:hidden">Todas</span>
                        </>
                      ) : (
                        <>
                          <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Apenas Selecionadas</span>
                          <span className="sm:hidden">Selecionadas</span>
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Botões principais - Youze Style */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button 
                      size="sm"
                      onClick={() => setShowConfirmDialog(true)}
                      className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white font-bold text-xs sm:text-sm border-none shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all rounded-xl px-4 sm:px-5 py-2.5 flex-shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                      <span className="hidden sm:inline">Finalizar Seleção</span>
                      <span className="sm:hidden">Finalizar</span>
                    </Button>
                    
                    {selectedPhotos.size > 0 && (
                      <Dialog open={showSelectedFilenamesDialog} onOpenChange={setShowSelectedFilenamesDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center flex-shrink-0 rounded-xl border-slate-200 hover:bg-slate-50 font-semibold text-xs sm:text-sm"
                          >
                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">Ver Selecionadas</span>
                            <span className="sm:hidden">Ver</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="font-black text-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                              Fotos Selecionadas
                            </DialogTitle>
                            <DialogDescription>
                              Lista de arquivos selecionados neste projeto.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="max-h-[60vh] overflow-y-auto">
                            <div className="space-y-2">
                              {project.photos
                                .filter(photo => selectedPhotos.has(photo.id))
                                .map(photo => (
                                  <div key={photo.id} className="p-3 bg-slate-50 rounded-xl flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-purple-500" />
                                    <span className="text-sm font-medium text-slate-700">{photo.originalName || photo.filename}</span>
                                  </div>
                              ))}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={() => setShowSelectedFilenamesDialog(false)}
                              className="rounded-xl bg-slate-900 hover:bg-slate-800"
                            >
                              Fechar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Main content - Youze Style */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Retorno do pagamento com cartão MP */}
        {cardPaymentReturn && (
          <div className={`rounded-2xl p-4 mb-6 text-center border ${
            cardPaymentReturn === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : cardPaymentReturn === "pending"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {cardPaymentReturn === "success" && <p className="font-bold">✅ Pagamento com cartão aprovado! Obrigado.</p>}
            {cardPaymentReturn === "pending" && <p className="font-bold">⏳ Pagamento em análise. Você receberá uma confirmação em breve.</p>}
            {cardPaymentReturn === "failure" && <p className="font-bold">❌ Pagamento não aprovado. Tente novamente abaixo.</p>}
          </div>
        )}

        {isFinalized && (finalizationSuccess || (additionalPhotosCount > 0 && mpStatus?.acceptsPayment)) ? (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-lg shadow-green-500/10">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-800 mb-2">Seleção finalizada!</h2>
              <p className="text-emerald-700 font-medium">
                Suas {selectedPhotos.size} fotos foram salvas. O fotógrafo receberá uma notificação.
              </p>
            </div>

            {/* Opções de pagamento para extras — visíveis mesmo após fechar o dialog */}
            {additionalPhotosCount > 0 && mpStatus?.acceptsPayment && (
              <div className="mt-4 space-y-3">
                <div className="bg-white border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Fotos extras a pagar</p>
                  <p className="text-2xl font-black text-amber-600">{formatCurrency(additionalPriceTotal)}</p>
                  <p className="text-xs text-amber-600">
                    {additionalPhotosCount} foto(s) × {formatCurrency(Number(project.additionalPhotoPrice))}
                  </p>
                </div>

                {pixStatus === "approved" || cardPaymentReturn === "success" || projectPayment?.status === "approved" ? (
                  <div className="flex items-center justify-center gap-2 py-3 text-emerald-700 font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                    Pagamento confirmado!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Pix */}
                    <Button
                      onClick={pixData && pixStatus === "pending" ? () => setShowPixDialog(true) : handlePixPayment}
                      disabled={pixLoading}
                      className="h-16 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex flex-col items-center justify-center gap-1"
                    >
                      {pixLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>
                          <span className="text-xl">🔑</span>
                          <span>{pixData && pixStatus === "pending" ? "Ver Pix" : "Pagar com Pix"}</span>
                        </>
                      )}
                    </Button>
                    {/* Cartão */}
                    <Button
                      onClick={handleCardPayment}
                      disabled={cardLoading}
                      className="h-16 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex flex-col items-center justify-center gap-1"
                    >
                      {cardLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>
                          <span className="text-xl">💳</span>
                          <span>Pagar com Cartão</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                className="rounded-xl font-bold border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                onClick={() => setLocation("/dashboard")}
              >
                Voltar para o Dashboard
              </Button>
            </div>
          </div>
        ) : null}
        
        {/* Grid otimizado com virtualização — isolado por ErrorBoundary */}
        <LocalErrorBoundary
          fallback={
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2 py-4">
              {(project.photos || []).map((photo) => (
                <div
                  key={photo.id}
                  className={`rounded-2xl overflow-hidden shadow-md border-2 transition-all ${
                    selectedPhotos.has(photo.id) ? 'border-purple-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={photo.url && !photo.url.includes('project-photos') ? photo.url : `https://cdn.fottufy.com/${photo.filename}`}
                    alt={photo.originalName || photo.filename}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                  />
                  <div className="p-2 bg-white text-center">
                    <button
                      className={`w-full text-xs font-bold py-1.5 rounded-xl ${selectedPhotos.has(photo.id) ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                      onClick={(e) => { e.stopPropagation(); if (!isFinalized) togglePhotoSelection(photo.id); }}
                      disabled={isFinalized}
                    >
                      {selectedPhotos.has(photo.id) ? '✓ Selecionado' : 'Selecionar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <VirtualizedPhotoGrid
            photos={project.photos}
            selectedPhotos={selectedPhotos}
            isFinalized={isFinalized}
            showWatermark={project.showWatermark === true}
            showOnlySelected={showOnlySelected}
            commentTexts={commentTexts}
            photoComments={photoComments}
            expandedCommentPhoto={expandedCommentPhoto}
            isCommentMutationPending={createCommentMutation.isPending}
            onToggleSelection={togglePhotoSelection}
            onOpenModal={openImageModal}
            onToggleCommentSection={toggleCommentSection}
            onCommentTextChange={handleCommentTextChange}
            onSubmitComment={handleSubmitComment}
            photoIndexMap={photoIndexMap}
          />
        </LocalErrorBoundary>
      </main>
      {/* Dialog do QR Code Pix */}
      <Dialog open={showPixDialog} onOpenChange={setShowPixDialog}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-black text-xl text-center">Pagamento via Pix</DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              Escaneie o QR Code ou copie o código abaixo para pagar
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            {project && additionalPhotosCount > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Total a pagar</p>
                <p className="text-2xl font-black text-emerald-600">{formatCurrency(additionalPriceTotal)}</p>
                <p className="text-xs text-emerald-600">{additionalPhotosCount} foto(s) extra(s) × {formatCurrency(Number(project.additionalPhotoPrice))}</p>
              </div>
            )}
            {pixData?.qrCode && (
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${pixData.qrCode}`}
                  alt="QR Code Pix"
                  className="w-48 h-48 rounded-xl border border-slate-200"
                />
              </div>
            )}
            {pixData?.copiaECola && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Pix Copia e Cola</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={pixData.copiaECola}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono truncate"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl px-3 border-slate-200 shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.copiaECola);
                      toast({ title: "Copiado!", description: "Código Pix copiado para a área de transferência." });
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            )}
            {pixStatus === "pending" && (
              <div className="flex items-center justify-center gap-2 text-amber-600 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                Aguardando confirmação do pagamento...
              </div>
            )}
            {pixStatus === "rejected" && (
              <div className="text-center text-red-500 text-sm font-bold">
                Pagamento não aprovado. Tente novamente.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl w-full" onClick={() => setShowPixDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog — muda para opções de pagamento após finalizar */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {!finalizationSuccess ? (
            /* ── Passo 1: confirmação ── */
            <>
              <DialogHeader>
                <DialogTitle className="font-black text-2xl">Finalizar Seleção</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Tem certeza que deseja finalizar sua seleção de fotos?
                  Após finalizar, você não poderá mais alterar as fotos selecionadas.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-purple-600">{selectedPhotos.size}</p>
                  <p className="text-sm text-purple-500 font-medium">de {project.photos.length} fotos selecionadas</p>
                </div>
                {project.includedPhotos && project.includedPhotos > 0 && (
                  <div className={`rounded-xl p-4 text-center ${
                    selectedPhotos.size > project.includedPhotos
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    {selectedPhotos.size <= project.includedPhotos ? (
                      <p className="text-sm text-green-700 font-medium">
                        ✓ {selectedPhotos.size} de {project.includedPhotos} fotos incluídas no pacote
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-amber-700 font-medium">
                          📸 {project.includedPhotos} incluídas + {selectedPhotos.size - project.includedPhotos} adicionais
                        </p>
                        {project.additionalPhotoPrice && project.additionalPhotoPrice > 0 && (
                          <p className="text-lg font-bold text-amber-800 mt-1">
                            Valor adicional: R$ {((selectedPhotos.size - project.includedPhotos) * project.additionalPhotoPrice / 100).toFixed(2)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={finalizeSelection}
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 font-bold shadow-lg shadow-purple-500/30"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Finalizando...</>
                  ) : (
                    <><Check className="mr-2 h-4 w-4" />Sim, finalizar</>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            /* ── Passo 2: opções de pagamento (extras pendentes) ── */
            <>
              <DialogHeader>
                <div className="flex flex-col items-center gap-2 pb-2">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <DialogTitle className="font-black text-xl text-center">Seleção finalizada!</DialogTitle>
                  <DialogDescription className="text-center text-slate-500">
                    Você tem {additionalPhotosCount} foto(s) extra(s).
                    Escolha como pagar {formatCurrency(additionalPriceTotal)}.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="py-2 space-y-3">
                {/* Resumo do valor */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Total a pagar</p>
                  <p className="text-2xl font-black text-amber-600">{formatCurrency(additionalPriceTotal)}</p>
                  <p className="text-xs text-amber-600">
                    {additionalPhotosCount} foto(s) × {formatCurrency(Number(project.additionalPhotoPrice))}
                  </p>
                </div>
                {/* Opção Pix */}
                <Button
                  onClick={() => { setShowConfirmDialog(false); handlePixPayment(); }}
                  disabled={pixLoading || pixStatus === "approved"}
                  className="w-full h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-3"
                >
                  {pixLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      <span className="text-xl">🔑</span>
                      <div className="text-left">
                        <p className="font-black">Pagar com Pix</p>
                        <p className="text-xs font-normal opacity-80">QR Code — aprovação imediata</p>
                      </div>
                    </>
                  )}
                </Button>
                {/* Opção Cartão */}
                <Button
                  onClick={() => { setShowConfirmDialog(false); handleCardPayment(); }}
                  disabled={cardLoading}
                  className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-3"
                >
                  {cardLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      <span className="text-xl">💳</span>
                      <div className="text-left">
                        <p className="font-black">Pagar com Cartão</p>
                        <p className="text-xs font-normal opacity-80">Crédito ou débito — checkout seguro</p>
                      </div>
                    </>
                  )}
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  className="w-full rounded-xl text-slate-500 text-xs"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Pagar depois
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Lightbox Modal - Estilo personalizado igual ao portfolio público */}
      {imageModalOpen && project.photos[currentPhotoIndex] && (
        <LocalErrorBoundary
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setImageModalOpen(false)}>
              <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
                <p className="text-slate-700 font-bold mb-4">Não foi possível exibir esta foto</p>
                <button onClick={() => setImageModalOpen(false)} className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold">Fechar</button>
              </div>
            </div>
          }
          onReset={() => setImageModalOpen(false)}
        >
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            {/* Imagem com canvas — protege contra salvamento no mobile */}
            {(() => {
              const photo = project.photos[currentPhotoIndex];
              const primarySrc = photo.url && !photo.url.includes('project-photos')
                ? photo.url
                : `https://cdn.fottufy.com/${photo.filename}`;
              const fallbacks = [
                primarySrc.includes('cdn.fottufy.com')
                  ? primarySrc.replace('cdn.fottufy.com', 'cdn2.fottufy.com')
                  : `https://cdn2.fottufy.com/${photo.filename}`,
                '/placeholder.jpg',
              ];
              return (
                <CanvasPhoto
                  key={photo.id ?? currentPhotoIndex}
                  src={primarySrc}
                  fallbackSrcs={fallbacks}
                  watermark={project.showWatermark === true}
                  fit="contain"
                  className="rounded-xl"
                />
              );
            })()}
            
            {/* Botão X - Youze Style */}
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Navegação - Youze Style */}
            {project.photos.length > 1 && (
              <>
                <button
                  onClick={goToPrevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                
                <button
                  onClick={goToNextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            
            {/* Botão de seleção - Youze Style */}
            {!isFinalized && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePhotoSelection(project.photos[currentPhotoIndex].id);
                }}
                className={`absolute bottom-4 right-4 px-4 py-2.5 rounded-xl flex items-center gap-2 text-white font-bold text-sm transition-colors duration-200 ${
                  selectedPhotos.has(project.photos[currentPhotoIndex].id)
                    ? 'bg-emerald-500'
                    : 'bg-purple-600'
                }`}
              >
                {selectedPhotos.has(project.photos[currentPhotoIndex].id) ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Selecionado</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Selecionar</span>
                  </>
                )}
              </button>
            )}
            
            {/* Contador de fotos - Youze Style */}
            {project.photos.length > 1 && (
              <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/50 rounded-xl text-white text-sm font-bold">
                {currentPhotoIndex + 1} / {project.photos.length}
              </div>
            )}
          </div>
        </div>
        </LocalErrorBoundary>
      )}

      {/* Botão scroll to top - Youze Style */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 md:hidden w-12 h-12 bg-gradient-to-br from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-500/30 transition-all duration-200"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}