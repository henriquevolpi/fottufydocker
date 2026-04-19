import React, { useEffect, useState, useRef, useCallback } from "react";
import PromotionalBanner from "@/components/PromotionalBanner";
import { MpConnect } from "@/components/mp-connect";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { 
  BarChart, 
  Camera, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowUpRight,
  Loader2,
  X,
  Link as LinkIcon,
  RotateCcw,
  CreditCard,
  Settings,
  Key,
  HelpCircle,
  Shield,
  ShieldOff,
  MessageSquare,
  MessageCircle,
  Eye,
  Check,
  Image as ImageIcon,
  Moon,
  Sun,
  Send,
  Upload,
  Copy,
  Share2,
  Gift,
  Heart,
  Sparkles,
  Crown,
  ExternalLink,
  Award
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { CopyNamesButton } from "@/components/copy-names-button";
import { PhotoComment } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const fottufinhopng = "/fottufinhopng.webp";

// Dados fictícios para projetos
const PROJETOS_EXEMPLO = [
  {
    id: 1,
    nome: "Casamento Rodrigo e Ana",
    cliente: "Rodrigo Silva",
    emailCliente: "rodrigo.silva@example.com",
    data: "2023-04-15",
    status: "pendente",
    fotos: 3,
    selecionadas: 0,
    fotografoId: 1,
    photos: [
      {
        id: "photo-1",
        url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "casal-1.jpg",
        selected: false
      },
      {
        id: "photo-2",
        url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "casal-2.jpg",
        selected: false
      },
      {
        id: "photo-3",
        url: "https://images.unsplash.com/photo-1546032996-6dfacbacbf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "casal-3.jpg",
        selected: false
      }
    ]
  },
  {
    id: 2,
    nome: "Aniversário de 15 anos - Maria",
    cliente: "Família Souza",
    emailCliente: "souza.familia@example.com",
    data: "2023-03-22",
    status: "revisado",
    fotos: 3,
    selecionadas: 2,
    fotografoId: 1,
    photos: [
      {
        id: "photo-4",
        url: "https://images.unsplash.com/photo-1551972578-f3e955bf9887?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "aniversario-1.jpg",
        selected: true
      },
      {
        id: "photo-5",
        url: "https://images.unsplash.com/photo-1525373698358-041e3a460346?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "aniversario-2.jpg",
        selected: true
      },
      {
        id: "photo-6",
        url: "https://images.unsplash.com/photo-1533294452740-9da4c4f8a416?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "aniversario-3.jpg",
        selected: false
      }
    ]
  },
  {
    id: 3,
    nome: "Ensaio Corporativo - Tech Inc",
    cliente: "Tech Incorporated",
    emailCliente: "contato@techinc.example.com",
    data: "2023-02-08",
    status: "finalizado",
    fotos: 3,
    selecionadas: 2,
    fotografoId: 1,
    photos: [
      {
        id: "photo-7",
        url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "corporativo-1.jpg",
        selected: true
      },
      {
        id: "photo-8",
        url: "https://images.unsplash.com/photo-1573164574511-73c773193279?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "corporativo-2.jpg",
        selected: true
      },
      {
        id: "photo-9",
        url: "https://images.unsplash.com/photo-1551836022-aadb801c60e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "corporativo-3.jpg",
        selected: false
      }
    ],
    finalizado: true
  },
  {
    id: 4,
    nome: "Evento de Lançamento - Natura",
    cliente: "Natura Cosméticos",
    emailCliente: "eventos@natura.example.com",
    data: "2023-01-30",
    status: "arquivado",
    fotos: 3,
    selecionadas: 3,
    fotografoId: 1,
    photos: [
      {
        id: "photo-10",
        url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "evento-1.jpg",
        selected: true
      },
      {
        id: "photo-11",
        url: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "evento-2.jpg",
        selected: true
      },
      {
        id: "photo-12",
        url: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        filename: "evento-3.jpg",
        selected: true
      }
    ],
    finalizado: true
  }
];

// Component for project cards
function ProjectCard({ project, onDelete, onViewComments }: { project: any, onDelete?: (id: number) => void, onViewComments?: (id: string) => void }) {
  // Note: We're using parameter renaming (projeto: project) to transition from Portuguese to English
  // while maintaining backward compatibility
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState(project?.status || "pending");
  const [showSelectionsModal, setShowSelectionsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isTogglingWatermark, setIsTogglingWatermark] = useState(false);
  const [modalProject, setModalProject] = useState(project);
  const [showClientLinkModal, setShowClientLinkModal] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "revisado": return "bg-blue-100 text-blue-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      case "finalizado": return "bg-green-100 text-green-800";
      case "completed": return "bg-green-100 text-green-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "arquivado": return "bg-gray-100 text-gray-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "pendente": return "Pendente";
      case "pending": return "Pendente";
      case "revisado": return "Revisado";
      case "reviewed": return "Revisado";
      case "finalizado": return "Finalizado";
      case "completed": return "Finalizado";
      case "Completed": return "Finalizado";
      case "arquivado": return "Arquivado";
      case "archived": return "Arquivado";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Se for YYYY-MM-DD puro, interpreta como local (evita shift de UTC)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
    }
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };
  

  
  const handleEditGallery = () => {
    // Simulation - in a real app, would redirect to an edit page
    toast({
      title: "Edit gallery",
      description: `Opening project "${project.nome}" gallery for editing.`,
    });
    
    // Redirect to a project edit page
    setLocation(`/project/${project.id}/edit`);
  };
  
  const handleViewSelections = async () => {
    try {
      // Fetch the complete project data with photos
      const response = await fetch(`/api/projects/${project.id}`);
      if (response.ok) {
        const projectData = await response.json();
        setModalProject(projectData);
      } else {
        setModalProject(project);
      }
      setShowSelectionsModal(true);
    } catch (error) {
      console.error('Error fetching project details:', error);
      setModalProject(project);
      setShowSelectionsModal(true); // Still open modal even if fetch fails
    }
  };
  
  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      
      // Immediately call the parent component's delete handler for optimistic UI update
      if (onDelete) {
        onDelete(project.id);
      }
      
      // Close the modal immediately
      setShowDeleteConfirm(false);
      
      // Show informative message about deletion process
      const photoCount = project?.photos?.length || project?.fotos || 0;
      toast({
        title: "Projeto deletado!",
        description: `Aguarde alguns minutos enquanto removemos todos os ${photoCount} arquivos do servidor.`,
        duration: 8000, // Show for 8 seconds
      });
      
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar o projeto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleWatermark = async () => {
    try {
      setIsTogglingWatermark(true);
      
      const newWatermarkValue = !project.showWatermark;
      
      await apiRequest('PATCH', `/api/projects/${project.id}/watermark`, {
        showWatermark: newWatermarkValue
      });
      
      // Update local state
      project.showWatermark = newWatermarkValue;
      
      toast({
        title: "Marca d'água atualizada",
        description: `Marca d'água ${newWatermarkValue ? 'ativada' : 'desativada'} para este projeto.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    } catch (error) {
      console.error('Error toggling watermark:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a configuração da marca d'água.",
        variant: "destructive"
      });
    } finally {
      setIsTogglingWatermark(false);
    }
  };
  
  return (
    <div className="relative group">
      {/* Glow on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

      <Card className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 rounded-2xl">

        {/* ── Header ── */}
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight truncate">
              {project?.name || project?.nome || 'Sem título'}
            </h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
              {project?.clientName || project?.cliente || '—'}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${
            status === 'pendente' || status === 'pending'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : status === 'revisado' || status === 'reviewed'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : status === 'finalizado' || status === 'completed' || status === 'Completed'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {getStatusDisplayName(status)}
          </span>
        </div>

        {/* ── Body ── */}
        <CardContent className="px-4 pt-0 pb-4">
          {/* Date */}
          <div className="flex items-center gap-1.5 mb-3">
            <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {formatDate(project?.data || new Date().toISOString())}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-400/30">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900 dark:text-white leading-none">
                  {project?.photos?.length || project?.fotos || 0}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">fotos</div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/30">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900 dark:text-white leading-none">
                  {project?.selectedPhotos?.length || project?.selecionadas || 0}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">seleções</div>
              </div>
            </div>
          </div>

          {/* Secondary actions */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              onClick={(e) => { e.stopPropagation(); onViewComments?.(project.id); }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg transition-colors border border-purple-100 dark:border-purple-800"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Comentários
            </button>

            {(project.finalizado || project.status === 'finalizado') && (
              <button
                onClick={handleViewSelections}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg transition-colors border border-emerald-100 dark:border-emerald-800"
              >
                <FileText className="h-3.5 w-3.5" />
                Ver Seleções
              </button>
            )}

            <button
              onClick={handleToggleWatermark}
              disabled={isTogglingWatermark}
              title={`Marca d'água ${project.showWatermark !== false ? 'ativada' : 'desativada'}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors border ${
                project.showWatermark !== false
                  ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isTogglingWatermark
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : project.showWatermark !== false
                  ? <Shield className="h-3.5 w-3.5" />
                  : <ShieldOff className="h-3.5 w-3.5" />
              }
              Marca d'água
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Excluir projeto"
              className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Excluir
            </button>
          </div>

          {/* Primary CTAs */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs font-semibold text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl py-2.5 transition-all"
              onClick={() => setLocation(`/project/${project.id}`)}
            >
              <ArrowUpRight className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              Ver Detalhes
            </Button>

            <Button
              size="sm"
              className="flex-1 text-xs font-bold text-white rounded-xl py-2.5 transition-all duration-200 hover:opacity-90 shadow-sm hover:shadow-md hover:shadow-blue-400/30 bg-gradient-to-r from-sky-400 to-blue-500"
              onClick={(e) => { e.stopPropagation(); setShowClientLinkModal(true); }}
            >
              <LinkIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              Link do Cliente
            </Button>
          </div>
        </CardContent>
      
      {/* Delete confirmation modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Excluir Projeto</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Tem certeza que deseja excluir o projeto "{project?.name || project?.nome || 'Sem título'}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir Projeto"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View selections modal */}
      <Dialog open={showSelectionsModal} onOpenChange={setShowSelectionsModal}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[900px] mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
              <DialogTitle
                className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent"
              >
                Fotos Selecionadas - {modalProject?.name || modalProject?.nome || 'Sem título'}
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
              O cliente selecionou {modalProject?.selectedPhotos?.length || modalProject?.selecionadas || 0} de {modalProject?.photos?.length || modalProject?.fotos || 0} fotos.
            </DialogDescription>
          </DialogHeader>

          {/* Resumo financeiro para o fotógrafo — visível apenas quando há pacote com limite definido */}
          {(() => {
            const included = Number(modalProject?.includedPhotos || 0);
            const selected = Number(modalProject?.selectedPhotos?.length || modalProject?.selecionadas || 0);
            const pricePerExtra = Number(modalProject?.additionalPhotoPrice || 0);
            if (included <= 0) return null;
            const extras = Math.max(0, selected - included);
            const totalExtra = extras * pricePerExtra;
            return (
              <div className={`rounded-xl px-4 py-3 text-sm flex flex-wrap gap-x-6 gap-y-1 items-center border ${extras > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-green-50 border-green-200 text-green-900'}`}>
                <span>📷 <strong>{selected}</strong> de <strong>{included}</strong> fotos incluídas no pacote</span>
                {extras > 0 && (
                  <>
                    <span>➕ <strong>{extras}</strong> foto{extras !== 1 ? 's' : ''} {extras !== 1 ? 'adicionais' : 'adicional'}</span>
                    {pricePerExtra > 0 && (
                      <span className="font-bold">
                        💰 Valor adicional: R$ {(totalExtra / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </>
                )}
                {extras === 0 && <span>✅ Dentro do pacote contratado</span>}
              </div>
            );
          })()}
          
          {(() => {
              if (!modalProject?.photos || modalProject.photos.length === 0) {
                return <p className="text-gray-500 text-center my-4">Nenhuma foto encontrada</p>;
              }
              
              let selectedPhotos: any[] = [];
              selectedPhotos = modalProject.photos.filter((photo: any) => photo.selected === true);
              if (selectedPhotos.length === 0 && modalProject.selectedPhotos && modalProject.selectedPhotos.length > 0) {
                selectedPhotos = modalProject.photos.filter((photo: any) => 
                  modalProject.selectedPhotos.includes(photo.id)
                );
              }
              if (selectedPhotos.length === 0 && modalProject.status === 'completed') {
                selectedPhotos = modalProject.photos.filter((photo: any) => 
                  photo.selected === true || photo.selected === 1 || photo.selected === "1"
                );
              }
              
              if (selectedPhotos.length === 0) {
                return <p className="text-gray-500 text-center my-4">Nenhuma foto selecionada pelo cliente</p>;
              }

              const namesWithoutExt = selectedPhotos.map((photo: any) => {
                const fileName = photo.originalName || photo.filename || 'Arquivo sem nome';
                return fileName.replace(/\.(jpg|jpeg|png|webp|gif|bmp|tiff|cr2|cr3|nef|arw|dng|raf|rw2|orf|pef)$/i, '');
              });

              const lightroomText = namesWithoutExt.map(n => `,${n}.`).join(' ').replace(/^,/, '');
              const windowsText = namesWithoutExt.map(n => `"${n}"`).join(' OR ');

              const copyToClipboard = async (text: string, label: string) => {
                try {
                  if (!navigator.clipboard) {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                  } else {
                    await navigator.clipboard.writeText(text);
                  }
                  toast({ title: "Copiado!", description: `Formato ${label} copiado para a área de transferência.` });
                } catch {
                  toast({ title: "Erro ao copiar", description: "Não foi possível copiar. Selecione o texto manualmente.", variant: "destructive" });
                }
              };

              return (
                <div className="my-4 space-y-4">
                  <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-gray-900">Adobe Lightroom <span className="font-normal text-gray-500 text-xs">(Filtro de biblioteca &gt; Texto &gt; Nome do arquivo &gt; Contém)</span></p>
                      <Button size="sm" variant="outline" className="shrink-0 ml-2 text-xs" onClick={() => copyToClipboard(lightroomText, 'Lightroom')}>
                        <Copy className="h-3 w-3 mr-1" /> Copiar
                      </Button>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 sm:p-3 max-h-24 overflow-y-auto">
                      <p className="text-xs sm:text-sm font-mono text-gray-800 break-all select-all">{lightroomText}</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-gray-900">Windows Explorer <span className="font-normal text-gray-500 text-xs">(busca de arquivos)</span></p>
                      <Button size="sm" variant="outline" className="shrink-0 ml-2 text-xs" onClick={() => copyToClipboard(windowsText, 'Windows')}>
                        <Copy className="h-3 w-3 mr-1" /> Copiar
                      </Button>
                    </div>
                    <div className="bg-gray-100 border border-gray-200 rounded p-2 sm:p-3 max-h-24 overflow-y-auto">
                      <p className="text-xs sm:text-sm font-mono text-gray-800 break-all select-all">{windowsText}</p>
                    </div>
                  </div>
                </div>
              );
          })()}
          
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowSelectionsModal(false)} className="w-full sm:w-auto">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Client Link Modal */}
      <Dialog open={showClientLinkModal} onOpenChange={setShowClientLinkModal}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] bg-white rounded-2xl p-6">
          <DialogHeader>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 mb-2 w-fit">
              Compartilhar Galeria
            </span>
            <DialogTitle className="text-xl font-black text-gray-900">
              Enviar para o Cliente
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              Copie a mensagem e envie via WhatsApp ou e-mail.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                Olá! 📸<br/><br/>
                Suas fotos do projeto "<strong>{project?.name || project?.nome || 'Seu Projeto'}</strong>" estão prontas!<br/><br/>
                Acesse o link para ver e selecionar suas fotos favoritas:<br/><br/>
                <span className="text-blue-600 text-xs" style={{ wordBreak: 'break-all' }}>
                  {`${window.location.origin}/project-view/${project.id}`}
                </span><br/><br/>
                Qualquer dúvida, estou à disposição!
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-700 font-mono" style={{ wordBreak: 'break-all' }}>
                {`${window.location.origin}/project-view/${project.id}`}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-5">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl h-11"
              onClick={() => {
                const message = `Olá! 📸

Suas fotos do projeto "${project?.name || project?.nome || 'Seu Projeto'}" estão prontas!

Acesse o link para ver e selecionar suas fotos favoritas:

${window.location.origin}/project-view/${project.id}

Qualquer dúvida, estou à disposição!`;
                navigator.clipboard.writeText(message);
                toast({
                  title: "Mensagem copiada!",
                  description: "Mensagem completa copiada.",
                });
                setShowClientLinkModal(false);
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Copiar Mensagem Completa
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl font-semibold h-11"
              onClick={() => {
                const link = `${window.location.origin}/project-view/${project.id}`;
                navigator.clipboard.writeText(link);
                toast({
                  title: "Link copiado!",
                  description: "Link da galeria copiado.",
                });
              }}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Copiar Apenas o Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
        </div>
  );
}

// Componente para o modal de upload
function UploadModal({
  open,
  onClose,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (data: any) => void;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusMsg, setUploadStatusMsg] = useState("");

  const { toast } = useToast();

  // Impede o usuário de fechar a aba/navegador enquanto um upload está em andamento
  useEffect(() => {
    if (!isUploading) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUploading]);

  const uploadSchema = z.object({
    projectName: z.string().min(3, "Nome do projeto é obrigatório (mín. 3 caracteres)"),
    clientName: z.string().min(3, "Nome do cliente é obrigatório (mín. 3 caracteres)"),
    eventDate: z.string().min(1, "Data do evento é obrigatória"),
    contractedPhotos: z.number().min(0).optional(),
    additionalPhotoPrice: z.number().min(0).optional(),
  });

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      projectName: "",
      clientName: "",
      eventDate: new Date().toISOString().substring(0, 10),
      contractedPhotos: 0,
      additionalPhotoPrice: 0,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const allFiles = Array.from(event.target.files);
    const imageFiles = allFiles.filter(f => f.type.startsWith('image/'));
    const nonImages = allFiles.length - imageFiles.length;
    if (nonImages > 0) {
      toast({
        title: "Arquivos não suportados",
        description: `${nonImages} arquivo(s) ignorado(s). Apenas imagens são aceitas.`,
        variant: "destructive",
      });
    }
    if (imageFiles.length === 0) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const oversizedFiles = imageFiles.filter(f => f.size > MAX_FILE_SIZE);
    const validFiles = imageFiles.filter(f => f.size <= MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      toast({
        title: "Arquivos muito grandes",
        description: `Envie apenas fotos abaixo de 2MB. Arquivos rejeitados: ${fileNames}`,
        variant: "destructive",
      });
      if (validFiles.length === 0) return;
    }

    const existingNames = new Set(selectedFiles.map(f => f.name.toLowerCase()));
    const duplicates = validFiles.filter(f => existingNames.has(f.name.toLowerCase()));
    const newUnique = validFiles.filter(f => !existingNames.has(f.name.toLowerCase()));

    if (duplicates.length > 0) {
      toast({
        title: `${duplicates.length} foto(s) ignorada(s)`,
        description: `Já ${duplicates.length === 1 ? 'está' : 'estão'} na seleção: ${duplicates.map(f => f.name).join(', ')}`,
      });
    }

    if (newUnique.length > 0) {
      setSelectedFiles(prev => [...prev, ...newUnique]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // XHR upload de um lote — resolve com dados da resposta, rejeita com erro
  const uploadBatch = (
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

      let lastPct = -1;
      xhr.upload.onprogress = (ev) => {
        if (!ev.lengthComputable) return;
        const pct = Math.round((ev.loaded / ev.total) * 100);
        if (pct !== lastPct) { lastPct = pct; onProgress(pct); }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({}); }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.message || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        }
      };
      xhr.onerror = () => reject(new Error("Erro de rede"));
      xhr.ontimeout = () => reject(new Error("Tempo esgotado"));
      xhr.send(formData);
    });

  const onSubmit = async (data: z.infer<typeof uploadSchema>) => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione ao menos uma foto para o projeto.",
        variant: "destructive",
      });
      return;
    }

    const BATCH_SIZE = 10;
    const totalFiles = selectedFiles.length;
    const batches: File[][] = [];
    for (let i = 0; i < totalFiles; i += BATCH_SIZE) batches.push(selectedFiles.slice(i, i + BATCH_SIZE));
    const totalBatches = batches.length;
    const batchWeight = 95 / totalBatches;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatusMsg("Criando projeto...");

      // Passo 1: criar projeto via V2
      const createRes = await fetch("/api/v2/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: data.projectName.trim(),
          description: data.clientName.trim(),
          eventDate: data.eventDate || null,
          contractedPhotos: data.contractedPhotos || 0,
          additionalPhotoPrice: Math.round((data.additionalPhotoPrice || 0) * 100), // Converte R$ → centavos
        }),
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.message || "Erro ao criar projeto");
      }
      const project = await createRes.json();
      const projectId: string = project.id;
      setUploadProgress(5);

      // Passo 2: enviar fotos em lotes
      let totalUploaded = 0;
      const errors: string[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const bBase = 5 + i * batchWeight;
        setUploadStatusMsg(`Enviando lote ${i + 1} de ${totalBatches}...`);

        try {
          await uploadBatch(projectId, batch, (pct) => {
            setUploadProgress(Math.min(Math.round(bBase + pct * batchWeight / 100), 99));
          });
          totalUploaded += batch.length;
          setUploadProgress(Math.min(Math.round(5 + (i + 1) * batchWeight), 99));
        } catch (err: any) {
          errors.push(`Lote ${i + 1}: ${err.message}`);
          console.warn(`[Upload V2] Lote ${i + 1} falhou:`, err.message);
        }

        // Pequena pausa entre lotes
        await new Promise(r => setTimeout(r, 100));
      }

      // Se nenhuma foto foi enviada, remover o projeto órfão do banco
      if (totalUploaded === 0) {
        try {
          await fetch(`/api/projects/${projectId}`, { method: 'DELETE', credentials: 'include' });
        } catch (deleteErr) {
          console.warn('[Upload V2] Não foi possível remover projeto órfão:', deleteErr);
        }
        throw new Error(`Nenhuma foto foi enviada. ${errors.length} lote(s) falharam. Verifique sua conexão e tente novamente.`);
      }

      setUploadProgress(100);
      setUploadStatusMsg("Upload concluído!");

      const successMsg = errors.length === 0
        ? `O projeto "${data.projectName}" foi criado com ${totalUploaded} foto(s).`
        : `${totalUploaded} foto(s) enviadas. ${errors.length} lote(s) com falha — você pode adicionar as restantes depois.`;

      toast({ title: "Projeto criado com sucesso!", description: successMsg });

      // Callback normalizado — handleProjectCreated busca o projeto completo em seguida
      try {
        onUpload({
          id: projectId,
          name: data.projectName.trim(),
          clientName: data.clientName.trim(),
          clientEmail: '',
          fotos: totalUploaded,
          selecionadas: 0,
          status: 'pendente',
          data: new Date().toISOString(),
          showWatermark: true,
          photos: [],
          selectedPhotos: [],
          isV2: true,
        });
      } catch (e) {
        console.warn("[Upload V2] Erro no callback (não crítico):", e);
      }

      setSelectedFiles([]);
      setUploadStatusMsg("");
      form.reset();
      onClose();

    } catch (error: any) {
      console.error("[Upload V2] Erro fatal:", error);
      setUploadStatusMsg("");
      toast({
        title: "Erro ao criar projeto",
        description: error?.message || "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && isUploading) return; onClose(); }}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[700px] max-h-[90vh] overflow-y-auto overflow-x-hidden mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-3xl">
        <DialogHeader className="pb-6">
          <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 w-fit">
            ✨ Nova Galeria
          </span>
          <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white">
            Criar Novo Projeto
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mt-2">
            Preencha os detalhes e envie suas fotos. Originais sem compressão, direto para o servidor.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 w-full min-w-0">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    📋 Nome da Galeria
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Casamento de João e Maria"
                      className="h-14 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 bg-slate-50 dark:bg-slate-800 rounded-2xl text-base font-medium transition-all"
                      disabled={isUploading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    👤 Nome do Cliente
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: João da Silva"
                      className="h-14 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 bg-slate-50 dark:bg-slate-800 rounded-2xl text-base font-medium transition-all"
                      disabled={isUploading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      📅 Data do Evento
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-14 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 bg-slate-50 dark:bg-slate-800 rounded-2xl text-base font-medium transition-all"
                        disabled={isUploading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractedPhotos"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      📷 Fotos Incluídas
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Ex: 50"
                        className="h-14 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 bg-slate-50 dark:bg-slate-800 rounded-2xl text-base font-medium transition-all"
                        disabled={isUploading}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <p className="text-xs text-slate-400">0 = sem limite</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="additionalPhotoPrice"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    💰 Valor por Foto Extra (R$)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex: 5.00"
                      className="h-14 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 bg-slate-50 dark:bg-slate-800 rounded-2xl text-base font-medium transition-all"
                      disabled={isUploading}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <p className="text-xs text-slate-400">Cobrado quando o cliente seleciona além das fotos incluídas. 0 = sem cobrança</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-8">
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                📸 Fotos do Projeto
              </label>
              <div className="relative group border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-all duration-300">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  disabled={isUploading}
                />
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-lg font-black text-slate-700 dark:text-slate-200">
                    Clique ou arraste fotos
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    JPG, PNG, WEBP — Limite de 2mb por Foto
                  </p>
                </div>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-6 w-full min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {selectedFiles.length} foto(s) selecionada(s)
                    </h4>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Pronto
                  </span>
                </div>
                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl max-h-[240px] overflow-y-auto overflow-x-hidden w-full bg-slate-50 dark:bg-slate-800/50">
                  {selectedFiles.slice(0, 30).map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 px-4 border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all group min-w-0"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/10">
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                          <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                      {!isUploading && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {selectedFiles.length > 30 && (
                    <div className="py-3 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-widest border-t border-slate-100 dark:border-slate-700/50">
                      + {selectedFiles.length - 30} foto(s) adicional(is) selecionada(s)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Barra de progresso */}
            {isUploading && (
              <div className="w-full flex flex-col gap-4 mt-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 animate-pulse">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">Enviando {selectedFiles.length} fotos</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {uploadStatusMsg || "Processando..."}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{uploadProgress}%</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-600 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
                  Não feche a página durante o upload
                </p>
              </div>
            )}

            <DialogFooter className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-4 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isUploading}
                  className="flex-1 h-14 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs tracking-widest uppercase rounded-2xl transition-all"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl shadow-purple-500/20 transition-all hover:scale-105 border-0"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Criar Projeto"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Dynamic Dashboard Banner component
interface BannerData {
  imageUrl: string;
  linkUrl?: string;
  altText: string;
}

function DashboardBanner() {
  const { data: banner, isLoading } = useQuery<BannerData | null>({
    queryKey: ["/api/banner"],
  });

  if (isLoading || !banner || !banner.imageUrl) {
    return null;
  }

  // Garantir que o link tenha protocolo
  const getFullUrl = (url: string | undefined) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  const bannerContent = (
    <img 
      src={banner.imageUrl} 
      alt={banner.altText || "Banner"} 
      className="w-full h-auto object-cover"
      data-testid="dashboard-banner-image"
    />
  );

  return (
    <div className="w-full mb-8 bg-white rounded-xl shadow-md overflow-hidden p-0" data-testid="dashboard-banner">
      {banner.linkUrl ? (
        <a 
          href={getFullUrl(banner.linkUrl)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:opacity-95 transition-opacity cursor-pointer"
          data-testid="dashboard-banner-link"
        >
          {bannerContent}
        </a>
      ) : (
        bannerContent
      )}
    </div>
  );
}

// Dashboard statistics component
function Statistics({ setLocation, user }: { setLocation: (path: string) => void; user: any }) {
  // Statistics data
  const { data, isLoading } = useQuery<any>({
    queryKey: ["/api/user/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Current user plan and stats data
  const userQuery = useQuery<any>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Calculate percentage based on real user data
  const calculatePlanInfo = () => {
    // Always ensure we have real data from API
    const user = userQuery.data;
    const stats = data;
    
    // Special case for new accounts or missing data - show free plan with 0 usage
    if (!user) {
      return {
        planType: "free",
        uploadLimit: 50,
        usedUploads: 0,
        percentageUsed: 0
      };
    }
    
    // Convert Portuguese plan names to English for consistency
    let planType = (user.planType || "free").toLowerCase();
    if (planType === "gratuito") planType = "free";
    if (planType === "basico" || planType === "básico") planType = "basic"; 
    if (planType === "padrao" || planType === "padrão") planType = "standard";
    if (planType === "ilimitado") planType = "unlimited";
    if (planType === "profissional") planType = "professional";
    
    // Default values if we don't have stats yet
    let uploadLimit = user.uploadLimit || 50;
    let usedUploads = user.usedUploads || 0;
    
    // Override with stats-specific values if available
    if (stats && stats.planInfo) {
      // Use the more accurate values from the stats endpoint
      uploadLimit = stats.planInfo.uploadLimit || uploadLimit;
      usedUploads = stats.planInfo.usedUploads || usedUploads;
    }
    
    // For new accounts, ensure we display real-time correct data
    if (planType === "free" && !("planType" in user)) {
      uploadLimit = 50;
      usedUploads = 0;
    }
    
    // Calculate percentage with safety check for divide-by-zero
    const percentageUsed = uploadLimit > 0 ? Math.round((usedUploads / uploadLimit) * 100) : 0;
    
    // Calculate days until renewal
    let daysUntilRenewal: number | null = null;
    if (user.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      daysUntilRenewal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (daysUntilRenewal < 0) daysUntilRenewal = 0;
    }
    
    return {
      planType: planType,
      uploadLimit: uploadLimit,
      usedUploads: usedUploads,
      percentageUsed: percentageUsed,
      daysUntilRenewal: daysUntilRenewal
    };
  };
  
  // Get real-time plan info or provide sensible defaults for new accounts
  const planInfo = calculatePlanInfo() || {
    planType: "free",
    uploadLimit: 50,
    usedUploads: 0,
    percentageUsed: 0,
    daysUntilRenewal: null
  };
  
  return (
    <div className="mb-6 sm:mb-10">
      {/* Section Header - Youze Style */}
      <div className="flex items-center gap-3 mb-3 sm:mb-5">
        <span className="px-3 py-1 sm:px-3 sm:py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest">
          📊 Métricas
        </span>
      </div>
      
      <div className={`grid gap-2 sm:gap-4 ${(user?.billingPeriod === 'yearly' || user?.isManualActivation || user?.role === 'admin') ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-2'}`}>
        {/* Active projects card - Glassmorphism Style */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <Card className="relative border border-slate-100 dark:border-slate-800 shadow-lg sm:shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-2xl sm:rounded-3xl overflow-hidden h-full">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:gap-4 mb-2 sm:mb-4">
                <div className="w-8 h-8 sm:w-14 sm:h-14 bg-slate-900 dark:bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20 group-hover:scale-110 transition-transform mb-1 sm:mb-0">
                  <BarChart className="h-4 w-4 sm:h-7 sm:w-7 text-white dark:text-slate-900" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[8px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Projetos</p>
                  <p className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-300">Ativos</p>
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 sm:h-12 w-12 sm:w-20 mx-auto sm:mx-0" />
              ) : (
                <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white text-center sm:text-left">
                  {data?.activeProjects || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Monthly uploads card - TEMPORARIAMENTE OCULTO */}
        {/* <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl sm:rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <Card className="relative border border-slate-100 dark:border-slate-800 shadow-lg sm:shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-2xl sm:rounded-3xl overflow-hidden h-full">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:gap-4 mb-2 sm:mb-4">
                <div className="w-8 h-8 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform mb-1 sm:mb-0">
                  <Upload className="h-4 w-4 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[8px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Uploads</p>
                  <p className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-300">Este mês</p>
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 sm:h-12 w-12 sm:w-20 mx-auto sm:mx-0" />
              ) : (
                <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white text-center sm:text-left">
                  {data?.photosThisMonth || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div> */}

        {/* Upload usage card */}
        <div className="relative group">
          <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl blur-xl transition-opacity ${planInfo.planType !== 'free' ? 'bg-gradient-to-br from-slate-700 to-slate-900 opacity-25 group-hover:opacity-35' : 'bg-gradient-to-br from-violet-400 to-purple-500 opacity-20 group-hover:opacity-30'}`}></div>
          <Card onClick={() => setLocation("/subscription")} className={`relative cursor-pointer shadow-lg sm:shadow-xl backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-2xl sm:rounded-3xl overflow-hidden h-full ${planInfo.planType !== 'free' ? 'border-2 border-slate-300 dark:border-slate-600 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900' : 'border-2 border-violet-300 dark:border-violet-700 bg-white/80 dark:bg-slate-900/80'}`}>
            <CardContent className="p-3 sm:p-6">
              {/* Header: ícone + info — vertical no mobile, horizontal no sm+ */}
              <div className="flex flex-col sm:flex-row items-center sm:gap-4 mb-2 sm:mb-4">
                <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform mb-1 sm:mb-0 ${planInfo.planType !== 'free' ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20'}`}>
                  {planInfo.planType !== 'free' ? (
                    <Crown className="h-4 w-4 sm:h-7 sm:w-7 text-white" />
                  ) : (
                    <CreditCard className="h-4 w-4 sm:h-7 sm:w-7 text-white" />
                  )}
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <p className="text-[8px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Plano</p>
                  {planInfo.planType !== 'free' ? (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 tracking-tight leading-tight">
                        {planInfo.planType === 'basic' || planInfo.planType === 'basic_v2' ? 'Básico' :
                         planInfo.planType === 'standard' || planInfo.planType === 'standard_v2' ? 'Fotógrafo' :
                         planInfo.planType === 'professional' || planInfo.planType === 'professional_v2' ? 'Estúdio' :
                         planInfo.planType.charAt(0).toUpperCase() + planInfo.planType.slice(1)}
                      </span>
                      {user?.billingPeriod === 'yearly' && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-full uppercase tracking-wider">Anual</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-base font-bold text-slate-600 dark:text-slate-300">Gratuito</p>
                  )}
                </div>
              </div>
              {/* Barra de uso */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Uso</span>
                  <span className="text-xs sm:text-sm font-black text-blue-600 bg-blue-50 px-2 sm:px-3 py-0.5 rounded-full">
                    {planInfo.usedUploads}/{planInfo.planType === "unlimited" ? "∞" : planInfo.uploadLimit}
                  </span>
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: planInfo.planType === "unlimited" ? "0%" : `${planInfo.percentageUsed}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Portfolio card - Only for Annual Plan Users */}
        {(user?.billingPeriod === 'yearly' || user?.isManualActivation || user?.role === 'admin') && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl sm:rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <Card className="relative border border-slate-100 dark:border-slate-800 shadow-lg sm:shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-2xl sm:rounded-3xl overflow-hidden h-full">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:gap-4 mb-2 sm:mb-4">
                  <div className="w-8 h-8 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform mb-1 sm:mb-0">
                    <Sparkles className="h-4 w-4 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[8px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Portfólio</p>
                    <p className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-300">Online</p>
                  </div>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                  <span className="text-[9px] sm:text-xs font-bold text-amber-600 dark:text-amber-400">Anual</span>
                </div>
              </CardContent>
              <CardFooter className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                <Link href="/meu-portfolio" className="w-full">
                  <Button 
                    size="sm"
                    className="w-full font-bold text-[10px] sm:text-xs tracking-wide uppercase py-1.5 sm:py-3 rounded-lg sm:rounded-xl transition-all bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:scale-105"
                  >
                    <ExternalLink className="mr-1 sm:mr-2 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden sm:inline">Acessar</span>
                    <span className="sm:hidden">Ver</span>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Dashboard component
export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  
  // State for managing projects
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // State for modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // State for referral modal
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralData, setReferralData] = useState<{ referralCode: string; referralLink: string } | null>(null);
  const [referralStats, setReferralStats] = useState<{ total: number; converted: number; bonusPhotos: number; isAmbassador: boolean } | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  
  // Theme state and logic
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // Initialize theme on mount
  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  // Verifica se há uma sessão Stripe pendente de ativação (salva antes do redirect pro Stripe)
  // Isso garante a ativação mesmo que o webhook falhe e o usuário tenha voltado sem estar logado
  useEffect(() => {
    if (!user) return;
    const pendingSession = localStorage.getItem('pending_stripe_session');
    if (!pendingSession) return;

    const activatePendingSession = async () => {
      try {
        console.log(`%c[STRIPE-DASHBOARD] ===== SESSÃO PENDENTE DETECTADA =====`, 'color: #f59e0b; font-weight: bold');
        console.log(`[STRIPE-DASHBOARD] sessionId: ${pendingSession}`);
        console.log(`[STRIPE-DASHBOARD] userId: ${user.id} (${user.email})`);
        console.log(`[STRIPE-DASHBOARD] Chamando endpoint de ativação...`);

        const response = await apiRequest("GET", `/api/stripe/checkout-session/${pendingSession}`);
        const data = await response.json();

        console.log(`%c[STRIPE-DASHBOARD] Resposta (HTTP ${response.status}):`, 'color: #f59e0b');
        console.log('[STRIPE-DASHBOARD]', data);

        if (data.success) {
          localStorage.removeItem('pending_stripe_session');
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
          queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
          console.log(`%c[STRIPE-DASHBOARD] ✅ PLANO ATIVADO via localStorage: ${data.planType} (alreadyProcessed: ${data.alreadyProcessed})`, 'color: green; font-weight: bold');
        } else if (data.alreadyProcessed) {
          // Já estava ativo — limpa a entrada pendente
          localStorage.removeItem('pending_stripe_session');
          console.log(`[STRIPE-DASHBOARD] ✅ Plano já estava ativo — localStorage limpo`);
        } else {
          console.warn(`[STRIPE-DASHBOARD] ⏳ Sessão ainda não paga — mantendo no localStorage para próxima tentativa (status: ${data.status})`);
        }
      } catch (err: any) {
        console.error(`%c[STRIPE-DASHBOARD] ❌ Erro ao ativar sessão pendente: ${err.message}`, 'color: red; font-weight: bold');
        console.error('[STRIPE-DASHBOARD] Detalhes:', err);
      }
    };

    activatePendingSession();
  }, [user]);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Query for project comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery<PhotoComment[]>({
    queryKey: [`/api/projects/${selectedProjectId}/comments`],
    enabled: !!selectedProjectId && commentsModalOpen,
  });

  // Mutation to mark comments as viewed
  const markCommentsAsViewedMutation = useMutation({
    mutationFn: async (commentIds: string[]) => {
      const response = await apiRequest("POST", "/api/comments/mark-viewed", { commentIds });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/comments`] });
    },
  });

  // Handler to open comments modal
  const handleViewComments = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCommentsModalOpen(true);
  };

  // Handler to open referral modal
  const handleOpenReferralModal = async () => {
    setReferralModalOpen(true);
    setReferralLoading(true);
    
    try {
      // Buscar código e estatísticas em paralelo
      const [codeRes, statsRes] = await Promise.all([
        fetch('/api/referral/code'),
        fetch('/api/referral/stats')
      ]);
      
      if (codeRes.ok) {
        const codeData = await codeRes.json();
        setReferralData(codeData);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setReferralStats(statsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de indicação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados de indicação",
        variant: "destructive"
      });
    } finally {
      setReferralLoading(false);
    }
  };

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      toast({
        title: "Link copiado!",
        description: "Seu link de indicação foi copiado para a área de transferência",
      });
    }
  };
  
  // Carregar projetos
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        
        // Always fetch from API to ensure we only see current user's projects
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error("Error loading projects");
        }
        
        const data = await response.json();
        console.log("Projects loaded from API:", data.length);
        
        // Save to localStorage with user-specific key to avoid mixing projects between users
        if (user && user.id) {
          localStorage.setItem(`projects_user_${user.id}`, JSON.stringify(data));
        }
        
        setProjects(data);
        setFilteredProjects(data);
      } catch (e) {
        console.error("Error loading data:", e);
        toast({
          title: "Error loading data",
          description: "An error occurred while loading projects. Please refresh the page.",
          variant: "destructive",
        });
        
        // Fallback to empty projects array if API call fails
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if user is authenticated
    if (user && user.id) {
      fetchProjects();
    } else {
      // If no user, reset projects
      setProjects([]);
      setFilteredProjects([]);
      setIsLoading(false);
    }
  }, [toast, user]);
  
  const handleLogout = () => {
    // First remove user data from localStorage
    localStorage.removeItem("user");
    
    // Clear both the old and new format of project data
    localStorage.removeItem("projects");
    
    // Also remove user-specific project data if there's a user
    if (user && user.id) {
      localStorage.removeItem(`projects_user_${user.id}`);
    }
    
    // Then trigger the logout mutation to clear the auth state
    logoutMutation.mutate();
    
    // Redirect to auth page after logout
    setLocation("/auth");
  };
  
  // Handler for project deletion
  const handleDeleteProject = (id: number) => {
    // Find the project to be deleted to get its photo count
    const projectToDelete = projects.find(project => project.id === id);
    const photoCount = projectToDelete?.fotos || projectToDelete?.photos?.length || 0;
    
    // OPTIMISTIC UPDATE: Remove project from UI immediately
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
    setFilteredProjects(prevProjects => prevProjects.filter(project => project.id !== id));
    
    // Update user-specific localStorage to reflect deletion immediately
    try {
      if (user && user.id) {
        const storageKey = `projects_user_${user.id}`;
        const storedProjects = localStorage.getItem(storageKey);
        if (storedProjects) {
          const parsedProjects = JSON.parse(storedProjects);
          const updatedProjects = parsedProjects.filter((p: any) => p.id !== id);
          localStorage.setItem(storageKey, JSON.stringify(updatedProjects));
        }
      }
    } catch (storageError) {
      console.error('Error updating localStorage:', storageError);
    }
    
    // Make API call to delete the project in the background
    apiRequest('DELETE', `/api/projects/${id}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to delete project');
    })
    .then(data => {
      console.log('Project deleted successfully on server:', data);
      
      // Refresh the user data and stats to update the upload count
      import('@/lib/queryClient').then(({ queryClient }) => {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      });
    })
    .catch(error => {
      console.error('Error deleting project on server:', error);
      
      // ROLLBACK: If server deletion fails, restore the project to the UI
      if (projectToDelete) {
        setProjects(prevProjects => [...prevProjects, projectToDelete]);
        setFilteredProjects(prevProjects => [...prevProjects, projectToDelete]);
        
        // Restore to localStorage as well
        try {
          if (user && user.id) {
            const storageKey = `projects_user_${user.id}`;
            const storedProjects = localStorage.getItem(storageKey);
            if (storedProjects) {
              const parsedProjects = JSON.parse(storedProjects);
              const updatedProjects = [...parsedProjects, projectToDelete];
              localStorage.setItem(storageKey, JSON.stringify(updatedProjects));
            }
          }
        } catch (storageError) {
          console.error('Error restoring localStorage:', storageError);
        }
        
        toast({
          title: "Erro ao deletar",
          description: "Não foi possível deletar o projeto no servidor. O projeto foi restaurado.",
          variant: "destructive",
        });
      }
    });
  };
  
  // Handler for project creation
  const handleProjectCreated = async (newProject: any) => {
    console.log("Project created, ensuring complete data...");
    
    // Proteção contra tela branca: Garantir que sempre temos dados válidos
    if (!newProject || !newProject.id) {
      console.warn("handleProjectCreated: newProject inválido, ignorando");
      return;
    }
    
    try {
      // Use a more reliable approach to get the complete project data
      // First, prepare the formatted project with whatever data we have now
      const initialFormattedProject = {
        ...newProject,
        id: newProject.id,
        nome: newProject.name || newProject.nome || 'Projeto',
        cliente: newProject.clientName || newProject.cliente || 'Cliente',
        emailCliente: newProject.clientEmail || newProject.emailCliente || '',
        fotos: newProject.photos ? newProject.photos.length : (newProject.fotos || 0),
        selecionadas: newProject.selectedPhotos ? newProject.selectedPhotos.length : (newProject.selecionadas || 0),
        status: newProject.status || "pending"
      };
      
      // Immediately add this to the projects list for a responsive UI experience
      // Usa a forma funcional de setState para evitar closure stale
      try {
        setProjects(prev => [initialFormattedProject, ...prev.filter(p => p.id !== initialFormattedProject.id)]);
        if (currentTab === "all" || initialFormattedProject.status === getStatusFilter(currentTab)) {
          setFilteredProjects(prev => [initialFormattedProject, ...prev.filter(p => p.id !== initialFormattedProject.id)]);
        }
      } catch (stateError) {
        console.error("Erro ao atualizar estado dos projetos:", stateError);
        // Continua mesmo com erro - a UI já foi atualizada pelo modal
      }
      
      // Now make a separate call to get the complete and accurate data
      // Use a longer delay to ensure the server has fully processed everything
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch adicional do projeto completo - envolvido em try-catch para proteção
      try {
        const response = await fetch(`/api/projects/${newProject.id}`, { credentials: 'include' });
        
        if (!response.ok) {
          console.warn("Could not fetch complete project data, using initial data");
          // Não retorna - continua para atualizar cache
        } else {
          // Get the complete and accurate project data
          const completeProject = await response.json();
          console.log("Complete project data fetched:", completeProject);
          
          // Format for dashboard display with complete data
          const completeFormattedProject = {
            ...completeProject,
            nome: completeProject.name || 'Projeto',
            cliente: completeProject.clientName || 'Cliente',
            emailCliente: completeProject.clientEmail || '',
            fotos: completeProject.photos ? completeProject.photos.length : 0,
            selecionadas: completeProject.selectedPhotos ? completeProject.selectedPhotos.length : 0
          };
          
          // Update the projects state with the complete data (forma funcional evita closure stale)
          let finalUpdatedProjects: any[] = [];
          setProjects(prev => {
            finalUpdatedProjects = [completeFormattedProject, ...prev.filter(p => p.id !== completeFormattedProject.id)];
            return finalUpdatedProjects;
          });
          
          // Final update to filtered projects based on current tab and complete data
          if (currentTab === "all" || completeFormattedProject.status === getStatusFilter(currentTab)) {
            setFilteredProjects(prev => [completeFormattedProject, ...prev.filter(p => p.id !== completeFormattedProject.id)]);
          }
          
          // Update user-specific localStorage with the complete data
          try {
            if (user && user.id) {
              const storageKey = `projects_user_${user.id}`;
              // Pequena pausa para garantir que o state foi atualizado antes de salvar
              setTimeout(() => {
                try {
                  localStorage.setItem(storageKey, JSON.stringify(finalUpdatedProjects));
                } catch (e) {}
              }, 100);
            }
          } catch (storageErr) {
            console.warn("Erro ao salvar no localStorage:", storageErr);
          }
        }
      } catch (fetchError) {
        console.warn("Erro ao buscar projeto completo, usando dados iniciais:", fetchError);
        // Não lança erro - projeto já foi adicionado com dados iniciais
      }
      
      // Force a refresh of the entire projects list - também protegido
      try {
        const refreshResponse = await fetch('/api/projects');
        if (refreshResponse.ok) {
          const refreshedProjects = await refreshResponse.json();
          
          // Format the refreshed data
          const formattedProjects = (refreshedProjects || []).map((project: any) => ({
            ...project,
            nome: project.name || 'Projeto',
            cliente: project.clientName || 'Cliente',
            emailCliente: project.clientEmail || '',
            fotos: project.photos ? project.photos.length : 0,
            selecionadas: project.selectedPhotos ? project.selectedPhotos.length : 0
          }));
          
          // Update project states with the freshest data
          setProjects(formattedProjects);
          
          // Apply current filtering
          let filtered = formattedProjects;
          if (currentTab !== "all") {
            const statusFilter = getStatusFilter(currentTab);
            filtered = formattedProjects.filter(
              (project: any) => project.status === statusFilter
            );
          }
          
          // Apply search filter if any
          if (searchQuery && searchQuery.length > 0) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((project: any) => {
              const projectName = project.nome || project.name || '';
              const clientName = project.cliente || project.clientName || '';
              const clientEmail = project.emailCliente || project.clientEmail || '';
              
              return (
                projectName.toString().toLowerCase().includes(query) ||
                clientName.toString().toLowerCase().includes(query) ||
                clientEmail.toString().toLowerCase().includes(query)
              );
            });
          }
          
          setFilteredProjects(filtered);
        }
      } catch (refreshError) {
        console.warn("Erro ao atualizar lista de projetos:", refreshError);
        // Não lança erro - já temos os dados iniciais
      }
      
      // ✅ Invalidar cache do React Query - protegido contra erros
      console.log("Invalidating cache to update dashboard stats...");
      try {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
          queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        }, 500);
      } catch (cacheError) {
        console.warn("Erro ao invalidar cache:", cacheError);
      }
      
    } catch (error) {
      console.error("Error in project creation handling:", error);
      // We've already added the initial project data, so user still sees something
      // Não mostramos toast de erro para não confundir o usuário - projeto foi criado com sucesso
      console.log("Projeto foi criado, mas houve erro ao atualizar dados. Usuário pode atualizar a página.");
    }
  };
  
  // Function to convert the current tab to a status filter
  const getStatusFilter = (tab: string) => {
    switch (tab) {
      case "pending": return "pendente";
      case "reviewed": return "revisado";
      case "completed": return "finalizado";
      default: return "";
    }
  };
  
  // Filter projects by tab and search query
  useEffect(() => {
    let filtered = [...projects];
    
    // Apply tab filter
    if (currentTab !== "all") {
      const statusFilter = getStatusFilter(currentTab);
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => {
        // Verificar nome/name - aceitar ambos os formatos
        const projectName = project.nome || project.name || '';
        const clientName = project.cliente || project.clientName || '';
        const clientEmail = project.emailCliente || project.clientEmail || '';
        
        return (
          projectName.toString().toLowerCase().includes(query) ||
          clientName.toString().toLowerCase().includes(query) ||
          clientEmail.toString().toLowerCase().includes(query)
        );
      });
    }
    
    setFilteredProjects(filtered);
  }, [currentTab, searchQuery, projects]);
  
  // Load Poppins font for modern hero
  useEffect(() => {
    const linkId = 'fottufy-poppins-font';
    if (document.getElementById(linkId)) return;
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap';
    document.head.appendChild(link);
  }, []);

  // Compute hero summary counts from existing projects state (read-only)
  const pendingReviewCount = projects.filter((p: any) => p?.status === 'pendente').length;
  const newSelectionsCount = projects.filter((p: any) => p?.status === 'revisado').length;

  // Format current date in Brazilian Portuguese
  const heroDateLabel = (() => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      }).format(new Date());
    } catch {
      return '';
    }
  })();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Background Decorative Shapes - Youze Style */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="sticky top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <img
                src={fottufinhopng}
                alt="Fottufinho"
                className="w-10 h-10"
              />
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                Fottufy
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/whats-new">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:flex items-center gap-2 rounded-xl text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-bold text-xs tracking-widest uppercase"
                >
                  <Sparkles className="h-4 w-4" />
                  Novidades
                </Button>
              </Link>
              <Button
                onClick={() => setUploadModalOpen(true)}
                size="lg"
                className="hidden sm:flex bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-xs tracking-widest uppercase rounded-2xl px-8 py-6 shadow-xl shadow-purple-500/20 transform transition-all hover:scale-105"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Novo Projeto
              </Button>
              
              
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme} 
                className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                title={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
              >
                {theme === 'light' ? <Moon className="h-5 w-5 text-slate-600" /> : <Sun className="h-5 w-5 text-slate-400" />}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleLogout} 
                className="rounded-xl border-slate-200 dark:border-slate-700 font-bold text-xs tracking-widest uppercase py-6 px-6"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Banner - Modern App Style */}
      <div className="relative overflow-hidden py-8 sm:py-12 bg-gradient-to-br from-white via-slate-50/50 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-purple-100/30 dark:bg-purple-900/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative container mx-auto px-4 sm:px-6">
          <div style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            {heroDateLabel && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl sm:text-2xl">👋</span>
                <span
                  className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 capitalize"
                  style={{ fontWeight: 500 }}
                >
                  {heroDateLabel}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl"
                style={{ fontWeight: 800, letterSpacing: '-0.03em' }}
              >
                <span className="text-slate-900 dark:text-white">Olá, </span>
                <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  {user?.name?.split(' ')[0] || 'Fotógrafo'}
                </span>
              </h1>

              {(user as any)?.isAmbassador && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-sm shadow-amber-400/30">
                  <Award className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">Embaixador Fottufy</span>
                </div>
              )}
            </div>

            <p
              className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl"
              style={{ fontWeight: 500 }}
            >
              {pendingReviewCount === 0 && newSelectionsCount === 0 ? (
                <>Tudo em ordem por aqui. Que tal criar um novo projeto?</>
              ) : (
                <>
                  Você tem{' '}
                  <span className="text-blue-500 dark:text-blue-400" style={{ fontWeight: 700 }}>
                    {pendingReviewCount} {pendingReviewCount === 1 ? 'galeria' : 'galerias'}
                  </span>{' '}
                  aguardando revisão
                  {newSelectionsCount > 0 && (
                    <>
                      {' '}e{' '}
                      <span className="text-blue-500 dark:text-blue-400" style={{ fontWeight: 700 }}>
                        {newSelectionsCount} {newSelectionsCount === 1 ? 'nova seleção' : 'novas seleções'}
                      </span>{' '}
                      de cliente
                    </>
                  )}
                  .
                </>
              )}
            </p>
          </div>
        </div>
      </div>
      <main className="container mx-auto py-3 sm:py-6 px-3 sm:px-6">
        {/* Banner Dinâmico */}
        <DashboardBanner />

        {/* Aviso de novidades - Youze Style */}
        {user?.planType !== 'free' && (
        <div className="mt-0 mb-4 sm:mb-8 relative overflow-hidden">
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-sm">
            <div className="relative flex flex-row items-center gap-3 sm:gap-6">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-purple-50 dark:bg-purple-900/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-bold text-sm sm:text-xl text-slate-900 dark:text-white tracking-tight mb-0.5 sm:mb-1">Recomende a Fottufy a um amigo querido ❤️</p>
                <p className="font-medium text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">+1.000 fotos extras no seu pacote por indicação!</p>
              </div>
              <button 
                onClick={handleOpenReferralModal}
                className="shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] sm:text-xs tracking-wider uppercase px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl hover:opacity-90 transition-opacity"
              >
               indicar 
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Promotional Banner - only shown for free users */}
        {user?.planType === 'free' && <PromotionalBanner />}
        
        <Statistics setLocation={setLocation} user={user} />

        <MpConnect />
        
        {/* Meus Projetos Section - Youze Style */}
        <div className="mt-16">
          {/* Section Header with Pill Badge */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <div>
              <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                📁 Galeria
              </span>
              <h2
                className="text-4xl sm:text-5xl tracking-tight"
                style={{ fontFamily: "'Poppins', system-ui, sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}
              >
                <span className="text-slate-900 dark:text-white">Meus </span>
                <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Projetos
                </span>
              </h2>
              <p
                className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mt-2"
                style={{ fontFamily: "'Poppins', system-ui, sans-serif", fontWeight: 500 }}
              >
                Gerencie suas galerias com elegância profissional
              </p>
            </div>
            
            <div className="flex items-center w-full sm:w-auto gap-4">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Buscar projetos..."
                  className="pl-12 pr-4 py-7 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-lg shadow-xl focus:ring-purple-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
            <div className="mb-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
              <div className="flex justify-start w-full xl:w-auto overflow-x-auto pb-4 xl:pb-0">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl h-auto shrink-0">
                  <TabsTrigger value="all" className="rounded-xl px-6 sm:px-8 py-4 font-black text-xs tracking-widest uppercase data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-xl data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300">Todos</TabsTrigger>
                  <TabsTrigger value="pending" className="rounded-xl px-6 sm:px-8 py-4 font-black text-xs tracking-widest uppercase data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-xl data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300">Pendentes</TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-xl px-6 sm:px-8 py-4 font-black text-xs tracking-widest uppercase data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-xl data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300">Finalizados</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                <Button
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-xs tracking-widest uppercase rounded-2xl px-8 py-7 shadow-2xl shadow-purple-500/20 transform transition-all hover:scale-105"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Novo Projeto
                </Button>
                
                <Button
                  onClick={() => window.open('https://www.transferxl.com', '_blank', 'noopener,noreferrer')}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 font-black text-xs tracking-widest uppercase rounded-2xl px-8 py-7 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transform transition-all hover:scale-105"
                  data-testid="button-send-files-fromsmash"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Enviar Prontas
                </Button>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(null).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Skeleton className="h-8 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border-0 dark:border dark:border-gray-700/50 shadow-lg shadow-slate-200/50 dark:shadow-black/30">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-2xl flex items-center justify-center">
                    <Camera className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Nenhum projeto encontrado</h3>
                  <p className="text-slate-600 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                    {searchQuery 
                      ? "Tente ajustar seus filtros ou termos de pesquisa para encontrar seus projetos" 
                      : "Comece criando seu primeiro projeto fotográfico e organize suas fotos com elegância"
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      onDelete={handleDeleteProject}
                      onViewComments={handleViewComments}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            {["pending", "reviewed", "completed", "Completed"].map(tab => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(3).fill(null).map((_, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <Skeleton className="h-4 w-1/3 mb-2" />
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4" />
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Skeleton className="h-8 w-full" />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border-0 dark:border dark:border-gray-700/50 shadow-lg shadow-slate-200/50 dark:shadow-black/30">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-2xl flex items-center justify-center">
                      <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                      Nenhum projeto {getStatusFilter(tab)}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                      Os projetos aparecerão aqui quando forem marcados como {getStatusFilter(tab)}.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        onDelete={handleDeleteProject}
                        onViewComments={handleViewComments}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      {/* Seção de redefinição de senha discreta no rodapé */}
      <div className="border-t border-slate-200/60 pt-4 pb-6 mt-6 bg-white/30 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="text-slate-600 font-medium">
              © {new Date().getFullYear()} Fottufy. Todos os direitos reservados.
            </div>
            <div className="mt-6 md:mt-0 flex space-x-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center p-2 h-auto rounded-lg font-medium transition-all duration-200"
                onClick={() => setChangePasswordModalOpen(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Alterar minha senha
              </Button>
              <Link to="/forgot-password" className="text-sm text-slate-600 hover:text-blue-600 flex items-center p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium">
                <HelpCircle className="h-4 w-4 mr-2" />
                Esqueceu sua senha?
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for uploading new projects */}
      <UploadModal 
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleProjectCreated}
      />
      {/* Modal for changing password */}
      <ChangePasswordModal
        open={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
      
      {/* Modal de Indicação */}
      <Dialog open={referralModalOpen} onOpenChange={setReferralModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              Indique e Ganhe!
              {referralStats?.isAmbassador && (
                <span className="ml-1 px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-full">
                  Embaixador
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Indique amigos e ganhe +1.000 fotos extras!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4 py-2">
            {referralLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600 text-sm">Carregando...</span>
              </div>
            ) : referralData ? (
              <>
                {/* Selo de Embaixador (se tiver) */}
                {referralStats?.isAmbassador && (
                  <div className="text-center p-2.5 sm:p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-300">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                      <span className="text-sm sm:text-base font-bold text-amber-700">Embaixador Fottufy</span>
                    </div>
                    <p className="text-xs text-amber-600">Você já indicou clientes que assinaram!</p>
                  </div>
                )}
                
                {/* Fotos Bônus Acumuladas */}
                {referralStats && referralStats.bonusPhotos > 0 && (
                  <div className="text-center p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-600">Fotos extras ganhas</p>
                    <p className="text-2xl sm:text-3xl font-black text-green-600">+{referralStats.bonusPhotos.toLocaleString()}</p>
                  </div>
                )}
                
                {/* Link de indicação */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Seu link de indicação:</label>
                  <div className="flex gap-2">
                    <Input 
                      value={referralData.referralLink} 
                      readOnly 
                      className="flex-1 bg-gray-50 text-xs sm:text-sm h-9"
                    />
                    <Button onClick={copyReferralLink} className="bg-purple-600 hover:bg-purple-700 h-9 px-3">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Estatísticas */}
                {referralStats && (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="text-center p-2.5 bg-blue-50 rounded-lg">
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">{referralStats.total}</p>
                      <p className="text-xs text-gray-600">Indicações</p>
                    </div>
                    <div className="text-center p-2.5 bg-green-50 rounded-lg">
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{referralStats.converted}</p>
                      <p className="text-xs text-gray-600">Convertidas</p>
                    </div>
                  </div>
                )}
                
                {/* Informação */}
                <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Heart className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-semibold mb-0.5">Como funciona?</p>
                    <p>Quando alguém assinar usando seu link, você ganha <strong>+1.000 fotos extras</strong>!</p>
                    <p className="mt-1 text-amber-700">Na 1ª indicação, ganha o selo de <strong>Embaixador</strong>!</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                Erro ao carregar dados. Tente novamente.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Comments Modal */}
      <Dialog open={commentsModalOpen} onOpenChange={setCommentsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle
              className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent"
            >
              Comentários do Projeto
            </DialogTitle>
            <DialogDescription className="text-base mt-1">
      Visualize e gerencie comentários dos clientes nas fotos
    </DialogDescription>
  </DialogHeader>
  
  <div className="flex-1 overflow-y-auto">
    {commentsLoading ? (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando comentários...</span>
      </div>
    ) : comments.length === 0 ? (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum comentário ainda</h3>
        <p className="text-gray-500">
          Os comentários dos clientes aparecerão aqui quando eles interagirem com as fotos.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Cliente</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              {!comment.isViewed && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Novo
                </span>
              )}
            </div>
            
            {comment.photoId && comment.photoUrl && (
              <div className="flex items-start space-x-3 mb-3 p-3 bg-white rounded border">
                <div className="flex-shrink-0">
                  <img 
                    src={comment.photoUrl} 
                    alt={comment.photoOriginalName || comment.photoFilename || 'Foto'} 
                    className="w-16 h-16 object-cover rounded border"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {comment.photoOriginalName || comment.photoFilename || 'Arquivo sem nome'}
                  </p>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                    "{comment.comment}"
                  </p>
                </div>
              </div>
            )}

            {!comment.photoId && (
              <div className="mb-3">
                <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                  {comment.comment}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>

  <DialogFooter>
    <Button 
      variant="outline" 
      onClick={() => setCommentsModalOpen(false)}
    >
      Fechar
    </Button>
  </DialogFooter>
</DialogContent>
</Dialog>

    <div className="mt-8 mb-6 text-center">
      <p className="text-xs text-slate-400">
        A Fottufy é uma plataforma de <strong>seleção e entrega</strong> de fotos, não de armazenamento. Fotos de contas inativas podem ser removidas.{' '}
        <a href="https://fottufy.com/termos" target="_blank" rel="noopener" className="underline hover:text-slate-500 transition-colors">Saiba mais</a>
      </p>
    </div>
    </div>
  );
}