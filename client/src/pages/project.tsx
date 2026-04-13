import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import PhotoCard from "@/components/photo-card";
import { Project } from "@shared/schema";
import { Check, Edit, ArrowLeftCircle, MessageCircle, Eye, Loader2, ArrowUp, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CopyNamesButton } from "@/components/copy-names-button";
import { SiMercadopago } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSelectedFilenamesDialog, setShowSelectedFilenamesDialog] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; copiaECola: string } | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixInternalId, setPixInternalId] = useState<string | null>(null);
  const [pixStatus, setPixStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  
  // ============================================
  // CONTROLE DE SELEÇÃO DE FOTOS
  // Para reativar a seleção, mude para: true
  // ============================================
  const PERMITIR_SELECAO_FOTOS = false;
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
  });

  // Comments query and mutations
  const { data: commentsData = [], isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/projects/${id}/comments`],
    enabled: showCommentsModal && !!id,
  });

  // Verifica se o fotógrafo aceitará pagamento via MP
  const { data: mpStatus } = useQuery<{ acceptsPayment: boolean }>({
    queryKey: [`/api/mp/photographer-status/${id}`],
    enabled: !!id,
  });

  const handlePixPayment = async () => {
    if (!project) return;
    const extraPhotos = Math.max(0, selectedPhotos.length - (project.includedPhotos || 0));
    const pricePerPhoto = Number(project.additionalPhotoPrice || 0) / 100;
    const total = extraPhotos * pricePerPhoto;
    if (total <= 0) return;
    setPixLoading(true);
    try {
      const res = await apiRequest("POST", "/api/mp/create-payment", {
        projectId: id,
        amount: total,
        description: `${extraPhotos} foto(s) extra(s) — ${project.name || project.clientName || "Projeto"}`,
        payerEmail: project.clientEmail || undefined,
      });
      const data = await res.json();
      if (data.pixCopiaECola || data.qrCodeBase64) {
        setPixData({ qrCode: data.qrCodeBase64 || "", copiaECola: data.pixCopiaECola || "" });
        setPixInternalId(data.internalId || null);
        setPixStatus("pending");
      } else {
        toast({ title: "Erro ao gerar Pix", description: data.error || "Tente novamente.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao gerar Pix", variant: "destructive" });
    } finally {
      setPixLoading(false);
    }
  };

  // Polling de status do pagamento Pix — verifica a cada 5s até aprovar ou cancelar
  useEffect(() => {
    if (!pixInternalId || pixStatus === "approved" || pixStatus === "rejected") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mp/payment-status/${pixInternalId}`);
        const data = await res.json();
        if (data.status === "approved") {
          setPixStatus("approved");
          toast({ title: "Pagamento confirmado!", description: "Seu pagamento via Pix foi recebido." });
          clearInterval(interval);
        } else if (data.status === "rejected" || data.status === "cancelled") {
          setPixStatus("rejected");
          clearInterval(interval);
        }
      } catch { /* ignora erros de rede no polling */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [pixInternalId, pixStatus]);

  const markCommentsAsViewedMutation = useMutation({
    mutationFn: async (commentIds: string[]) => {
      const response = await apiRequest("POST", "/api/comments/mark-viewed", { commentIds });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/comments`] });
      toast({
        title: "Comentários marcados como visualizados",
        description: "Os comentários foram atualizados com sucesso.",
      });
    },
  });

  // Initialize selected photos from project data if available
  useEffect(() => {
    if (!project) return;
    if (project.selectedPhotos && project.selectedPhotos.length > 0) {
      setSelectedPhotos(project.selectedPhotos);
    }
    // Determine finalization status regardless of selected photos count
    const finalized = project.status === 'Completed' || project.status === 'finalizado' || (project as any).finalizado === true;
    setIsFinalized(finalized);
  }, [project]);

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
      // Mostrar o botão quando o usuário rolar mais de 300px para baixo
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const togglePhotoSelection = (photoId: string) => {
    // Bloqueia seleção se não permitido ou se já finalizado
    if (!PERMITIR_SELECAO_FOTOS || isFinalized) return;

    if (selectedPhotos.includes(photoId)) {
      setSelectedPhotos(prev => prev.filter(id => id !== photoId));
    } else {
      setSelectedPhotos(prev => [...prev, photoId]);
    }
  };

  const handleFinalizeSelection = async () => {
    try {
      setIsSubmitting(true);
      await apiRequest("PATCH", `/api/projects/${id}/finalize`, {
        selectedPhotos
      });

      setIsFinalized(true);
      setFinalizeDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to finalize your selection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 animate-pulse"></div>
          <p className="text-lg text-gray-600 font-medium">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="text-center bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 shadow-xl">
          <h1 className="text-3xl font-black text-gray-900">Projeto Não Encontrado</h1>
          <p className="mt-3 text-lg text-gray-600">
            O projeto que você procura não existe ou foi removido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation bar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 w-fit text-gray-700 hover:text-gray-900 hover:bg-white/60 rounded-2xl transition-all duration-300"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeftCircle className="h-5 w-5" />
            <span className="hidden sm:inline font-semibold">Voltar para Dashboard</span>
            <span className="sm:hidden font-semibold">Voltar</span>
          </Button>
          
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-700 hover:from-purple-200 hover:to-pink-200 rounded-2xl font-bold flex-shrink-0 transition-all duration-300"
              onClick={() => setShowCommentsModal(true)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              <span>Comentários</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 flex-shrink-0 bg-white/80 backdrop-blur-xl border border-gray-200 text-gray-700 hover:bg-white rounded-2xl font-semibold transition-all duration-300"
              onClick={() => setLocation(`/project/${id}/edit`)}
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Editar Galeria</span>
              <span className="sm:hidden">Editar</span>
            </Button>
          </div>
        </div>
        
        {/* Hero header with gradient */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
              Galeria de Fotos
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent leading-tight">
            {project.name}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-gray-600 sm:mt-5 px-4">
            {isFinalized
              ? "Obrigado por fazer sua seleção."
              : "Selecione as fotos que você gostaria de manter clicando nelas."}
          </p>
          
          {/* Stats bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <div className="inline-flex items-center px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg text-gray-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">{selectedPhotos.length}</span>
              </div>
              <span className="font-black text-xl text-gray-900">{selectedPhotos.length}</span>
              <span className="mx-2 text-gray-500">de</span>
              <span className="font-black text-xl text-gray-900">{project.photos?.length || 0}</span>
              <span className="ml-2 text-gray-600 hidden sm:inline">selecionadas</span>
            </div>
            
            {selectedPhotos.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center flex-shrink-0 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 text-blue-700 hover:from-blue-200 hover:to-cyan-200 rounded-2xl font-semibold transition-all duration-300"
                onClick={() => setShowSelectedFilenamesDialog(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ver fotos selecionadas</span>
                <span className="sm:hidden">Ver selecionadas</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Gallery grid with modern spacing */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {project.photos && project.photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              id={photo.id}
              url={photo.url}
              filename={photo.filename}
              originalName={photo.originalName}
              isSelected={selectedPhotos.includes(photo.id)}
              onToggleSelect={togglePhotoSelection}
              disabled={isFinalized}
            />
          ))}
        </div>
        

        {/* Scroll to top button */}
        {showScrollToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 sm:bottom-32 sm:right-8 z-30 md:hidden w-12 h-12 bg-white/80 hover:bg-white backdrop-blur-xl border border-gray-200 rounded-2xl flex items-center justify-center text-gray-700 shadow-lg transition-all duration-300"
            aria-label="Voltar ao topo"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Finalized message modal */}
      <Dialog open={finalizeDialogOpen} onOpenChange={(open) => { if (!open) { setPixData(null); setPixInternalId(null); setPixStatus(null); } setFinalizeDialogOpen(open); }}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl">
          <DialogHeader>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
              <Check className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black text-gray-900 text-center">Seleção Finalizada!</DialogTitle>
            <DialogDescription className="text-gray-600 text-center">
              Obrigado por fazer sua seleção. Seu fotógrafo foi notificado e processará as fotos selecionadas. Você selecionou {selectedPhotos.length} de {project.photos?.length || 0} fotos.
            </DialogDescription>
          </DialogHeader>

          {/* Bloco de pagamento Pix — aparece apenas se fotógrafo tem MP e há fotos extras */}
          {mpStatus?.acceptsPayment &&
            project.includedPhotos && project.includedPhotos > 0 &&
            selectedPhotos.length > project.includedPhotos &&
            project.additionalPhotoPrice && project.additionalPhotoPrice > 0 && (
            <div className="mt-2 rounded-2xl border border-[#009EE3]/30 bg-[#009EE3]/5 p-4">
              {pixStatus === "approved" ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-emerald-700 text-center">Pagamento confirmado!</p>
                  <p className="text-xs text-slate-500 text-center">Seu Pix foi recebido. O fotógrafo já foi notificado.</p>
                </div>
              ) : pixStatus === "rejected" ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <p className="text-sm font-bold text-red-500 text-center">Pagamento não aprovado</p>
                  <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => { setPixData(null); setPixInternalId(null); setPixStatus(null); }}>
                    Tentar novamente
                  </Button>
                </div>
              ) : !pixData ? (
                <>
                  <p className="text-sm font-bold text-slate-800 text-center mb-1">
                    Pagar fotos extras via Pix
                  </p>
                  <p className="text-xs text-slate-500 text-center mb-3">
                    {selectedPhotos.length - project.includedPhotos} foto(s) extra(s) ×{" "}
                    R$ {(project.additionalPhotoPrice / 100).toFixed(2).replace(".", ",")} ={" "}
                    <strong className="text-slate-700">
                      R$ {((selectedPhotos.length - project.includedPhotos) * project.additionalPhotoPrice / 100).toFixed(2).replace(".", ",")}
                    </strong>
                  </p>
                  <Button
                    onClick={handlePixPayment}
                    disabled={pixLoading}
                    className="w-full rounded-xl bg-[#009EE3] hover:bg-[#0082c1] text-white font-bold text-sm"
                  >
                    {pixLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Gerando Pix...</>
                    ) : (
                      <><SiMercadopago className="h-4 w-4 mr-2" /> Pagar agora via Pix</>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-700 text-center mb-2">Escaneie o QR code ou copie o código Pix</p>
                  {pixData.qrCode && (
                    <div className="flex justify-center mb-3">
                      <img src={`data:image/png;base64,${pixData.qrCode}`} alt="QR Code Pix" className="w-40 h-40 rounded-xl border border-slate-200" />
                    </div>
                  )}
                  {pixData.copiaECola && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(pixData.copiaECola); toast({ title: "Código Pix copiado!" }); }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5 flex-shrink-0 text-[#009EE3]" />
                      <span className="truncate font-mono">{pixData.copiaECola}</span>
                    </button>
                  )}
                  <p className="text-xs text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Aguardando confirmação do pagamento...
                  </p>
                </>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button 
              onClick={() => { setPixData(null); setFinalizeDialogOpen(false); }}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white font-bold rounded-2xl hover:opacity-90 transition-all duration-300"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Selected Photos Filenames Dialog */}
      <Dialog open={showSelectedFilenamesDialog} onOpenChange={setShowSelectedFilenamesDialog}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto p-4 sm:p-6 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-2xl">
          <DialogHeader className="pb-2">
            <div className="inline-block mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
                {selectedPhotos.length} selecionadas
              </span>
            </div>
            <DialogTitle className="text-lg sm:text-2xl font-black text-gray-900">Fotos Selecionadas</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Miniaturas das fotos selecionadas.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto my-2 sm:my-4 pr-1">
            {(Array.isArray(project.photos) && project.photos.length > 0) ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {project.photos
                  .filter(photo => selectedPhotos.includes(photo.id))
                  .map(photo => {
                    const name = (photo.originalName || photo.filename || '').replace(/\.[^.]+$/, '');
                    return (
                      <div key={photo.id} className="group flex flex-col gap-1">
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                          <img
                            src={photo.url}
                            alt={name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 truncate text-center leading-tight px-0.5">{name}</p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="p-3 text-center text-gray-500 text-sm">
                Nenhuma foto selecionada.
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            {selectedPhotos.length > 0 && (
              <CopyNamesButton
                selectedPhotos={project.photos.filter(photo => selectedPhotos.includes(photo.id))}
                size="default"
                variant="outline"
                className="w-full sm:w-auto rounded-lg sm:rounded-xl text-sm"
              />
            )}
            <Button 
              onClick={() => setShowSelectedFilenamesDialog(false)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white font-bold rounded-lg sm:rounded-xl hover:opacity-90 transition-all duration-300 text-sm"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Comments Modal with Photo Thumbnails */}
      <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[900px] mx-auto max-h-[85vh] overflow-y-auto bg-white border border-gray-200 rounded-3xl shadow-2xl">
          <DialogHeader>
            <div className="inline-block mb-2 w-fit">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
                Comentários
              </span>
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              {project?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm mt-1">
              Comentários dos clientes organizados por foto com miniaturas para referência visual.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto my-4">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2 text-purple-500" />
                <span className="text-gray-600">Carregando comentários...</span>
              </div>
            ) : commentsData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-bold text-gray-700 mb-2">Nenhum comentário ainda</p>
                <p className="text-gray-500">Os comentários dos clientes aparecerão aqui quando forem enviados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(
                  commentsData.reduce((acc: Record<string, any[]>, comment: any) => {
                    if (!acc[comment.photoId]) {
                      acc[comment.photoId] = [];
                    }
                    acc[comment.photoId].push(comment);
                    return acc;
                  }, {})
                ).map(([photoId, photoComments]: [string, any[]]) => (
                  <div key={photoId} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 hover:bg-gray-100 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      {photoComments[0]?.photoUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={photoComments[0].photoUrl}
                            alt={photoComments[0].photoOriginalName || photoComments[0].photoFilename || 'Foto'}
                            className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-base text-gray-900 mb-1">
                          {photoComments[0]?.photoOriginalName || photoComments[0]?.photoFilename || 'Foto sem nome'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {photoComments.length} comentário{photoComments.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {photoComments.map((comment: any) => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-xl border ${
                            !comment.isViewed 
                              ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-gray-900">
                                {comment.clientName || "Cliente"}
                              </span>
                              {!comment.isViewed && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                                  Novo
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {comment.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              onClick={() => setShowCommentsModal(false)} 
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
