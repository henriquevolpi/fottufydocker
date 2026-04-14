import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SiMercadopago } from "react-icons/si";
import {
  CheckCircle2, Link2, Unlink, Loader2, X, Zap, TrendingUp,
  ShieldCheck, Smartphone, QrCode, CreditCard, ArrowRight,
  Star, Banknote, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// ---------- Mock visual: o que o cliente vê ----------
function ClientPaymentPreview() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 3), 3200);
    return () => clearInterval(t);
  }, []);

  const stepContent = [
    // Step 0 — seleção finalizada
    <div key="done">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seleção</p>
          <p className="text-xs font-bold text-slate-800">Finalizada!</p>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mb-2">
        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Fotos extras selecionadas</p>
        <p className="text-sm font-black text-amber-800">+8 fotos · R$ 160,00</p>
      </div>
      <p className="text-[10px] text-slate-400 text-center">Escolha como pagar →</p>
    </div>,

    // Step 1 — opções de pagamento
    <div key="pay">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pagar R$ 160,00</p>
      <div className="space-y-2">
        <div className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500 text-white">
          <QrCode className="h-4 w-4 shrink-0" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-wider">Pix</p>
            <p className="text-[9px] opacity-80">Aprovado na hora</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
        </div>
        <div className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#009EE3] text-white">
          <CreditCard className="h-4 w-4 shrink-0" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-wider">Cartão</p>
            <p className="text-[9px] opacity-80">Até 12x</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
        </div>
      </div>
    </div>,

    // Step 2 — pagamento confirmado
    <div key="confirmed" className="text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
      </div>
      <p className="text-xs font-black text-emerald-700">Pagamento confirmado!</p>
      <p className="text-[10px] text-slate-400 mt-1">R$ 160,00 depositado</p>
      <p className="text-[10px] text-slate-400">na sua conta Mercado Pago</p>
      <div className="mt-2 flex items-center justify-center gap-1">
        <Smartphone className="h-3 w-3 text-slate-400" />
        <p className="text-[9px] text-slate-400">Notificação ao fotógrafo</p>
      </div>
    </div>,
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-[220px] flex flex-col" style={{ height: 200 }}>
      {/* Container de altura fixa — todos os steps ficam em posição absoluta */}
      <div className="relative flex-1 overflow-hidden">
        {stepContent.map((content, i) => (
          <div
            key={i}
            className="absolute inset-0 flex flex-col justify-center transition-opacity duration-500"
            style={{ opacity: i === step ? 1 : 0, pointerEvents: i === step ? 'auto' : 'none' }}
          >
            {content}
          </div>
        ))}
      </div>
      {/* dots */}
      <div className="flex justify-center gap-1.5 mt-2 shrink-0">
        {stepContent.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${i === step ? 'w-4 h-1.5 bg-[#009EE3]' : 'w-1.5 h-1.5 bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
}

// ---------- Modal de apresentação ----------
function MpPromoModal({ open, onClose, onConnect, connecting }: {
  open: boolean;
  onClose: () => void;
  onConnect: () => void;
  connecting: boolean;
}) {
  const benefits = [
    {
      icon: <Banknote className="h-5 w-5" />,
      color: "bg-emerald-100 text-emerald-600",
      title: "Reduz inadimplência",
      desc: "O cliente paga na hora de receber — antes de você entregar as fotos extras.",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-600",
      title: "Vende mais fotos",
      desc: "Com Pix e Cartão disponíveis, a conversão de fotos extras dispara.",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      color: "bg-amber-100 text-amber-600",
      title: "Zero burocracia",
      desc: "Conecte uma vez. A cobrança acontece automática para cada cliente.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      color: "bg-violet-100 text-violet-600",
      title: "Dinheiro direto na sua conta",
      desc: "O pagamento vai direto para seu Mercado Pago. Nenhum intermediário.",
    },
  ];

  const howItWorks = [
    { num: "1", label: "Você conecta seu Mercado Pago uma única vez" },
    { num: "2", label: "O cliente seleciona as fotos extras na galeria" },
    { num: "3", label: "Ao finalizar, vê os botões de Pix e Cartão automaticamente" },
    { num: "4", label: "O pagamento cai direto na sua conta" },
  ];

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-3xl border-0 shadow-2xl max-h-[92vh] overflow-y-auto">
        <DialogTitle className="sr-only">Receber pagamentos via Mercado Pago</DialogTitle>
        <DialogDescription className="sr-only">Conheça como integrar Pix e Cartão na sua galeria Fottufy</DialogDescription>

        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-[#009EE3] via-[#00b4f0] to-[#0078b0] p-6 pb-8">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <X className="h-4 w-4 text-white" />
          </button>

          {/* Badge novidade */}
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            <Star className="h-3 w-3 fill-white" />
            Novidade Fottufy
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <SiMercadopago className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white leading-tight">
                Receba pagamentos<br />diretamente pelo Fottufy
              </h2>
              <p className="text-sm text-white/80 mt-1">
                Pix e Cartão integrados — seus clientes pagam na hora de selecionar
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Preview animado + Como funciona lado a lado */}
          <div className="flex flex-col sm:flex-row gap-6 items-center">

            {/* Preview */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">O que o cliente vê</p>
              <ClientPaymentPreview />
            </div>

            {/* Como funciona */}
            <div className="flex-1 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Como funciona</p>
              {howItWorks.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#009EE3] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step.num}
                  </div>
                  <p className="text-sm text-slate-700 leading-snug">{step.label}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 font-bold">Configuração em menos de 2 minutos</p>
              </div>
            </div>
          </div>

          {/* Benefícios */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Por que usar</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${b.color}`}>
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{b.title}</p>
                    <p className="text-xs text-slate-500 leading-snug mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-blue-100 p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                <Zap className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-black text-amber-600 uppercase tracking-wider">Você fica com até 97% do valor</p>
              </div>
              <p className="text-sm font-bold text-slate-700">Conecte agora e comece a receber. As taxas padrão do Mercado Pago se aplicam normalmente — a Fottufy cobra <span className="text-[#009EE3]">apenas 3%</span> por venda realizada pelo site.</p>
            </div>
            <Button
              onClick={onConnect}
              disabled={connecting}
              className="flex-shrink-0 bg-[#009EE3] hover:bg-[#0082c1] text-white font-black text-sm px-6 py-5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Conectar Mercado Pago
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Componente principal exportado ----------
export function MpConnect() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [connecting, setConnecting] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  const { data: status, isLoading } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/mp/status"],
  });

  // Detecta retorno do OAuth MP via query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mp = params.get("mp");
    if (mp === "connected") {
      toast({ title: "Mercado Pago conectado com sucesso!" });
      qc.invalidateQueries({ queryKey: ["/api/mp/status"] });
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
    } else if (mp === "error") {
      toast({ title: "Erro ao conectar Mercado Pago", description: "Tente novamente.", variant: "destructive" });
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
    }
  }, []);

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/mp/disconnect", {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/mp/status"] });
      toast({ title: "Mercado Pago desconectado." });
    },
  });

  const handleConnect = async () => {
    setConnecting(true);
    setShowPromo(false);
    try {
      const res = await apiRequest("GET", "/api/mp/auth-url", undefined);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Integração não configurada",
          description: data.error || "Aguarde a liberação do Mercado Pago.",
          variant: "destructive",
        });
        setConnecting(false);
      }
    } catch {
      toast({ title: "Erro ao conectar", variant: "destructive" });
      setConnecting(false);
    }
  };

  return (
    <>
      <MpPromoModal
        open={showPromo}
        onClose={() => setShowPromo(false)}
        onConnect={handleConnect}
        connecting={connecting}
      />

      <div className="max-w-xl mx-auto">
        {/* Se já conectado: card de status com acesso ao modal */}
        {status?.connected ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <SiMercadopago className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">Mercado Pago conectado</p>
              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Clientes pagam via Pix e Cartão ao finalizar
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-xs text-slate-500 hover:text-slate-700"
                onClick={() => setShowPromo(true)}
              >
                Como funciona
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <><Unlink className="h-3.5 w-3.5 mr-1" /> Desconectar</>
                )}
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex items-center gap-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            <p className="text-sm text-slate-400">Verificando integração...</p>
          </div>
        ) : (
          /* Card promo para não conectados */
          <button
            onClick={() => setShowPromo(true)}
            className="w-full text-left group"
          >
            <div className="rounded-2xl border-2 border-dashed border-[#009EE3]/40 bg-gradient-to-br from-[#009EE3]/5 to-blue-50 hover:from-[#009EE3]/10 hover:to-blue-100 hover:border-[#009EE3]/70 shadow-sm hover:shadow-md transition-all duration-200 p-5">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-[#009EE3]/10 group-hover:bg-[#009EE3]/20 flex items-center justify-center transition-colors">
                    <SiMercadopago className="w-7 h-7 text-[#009EE3]" />
                  </div>
                  {/* Ping de novidade */}
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#009EE3] opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#009EE3]"></span>
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-black text-slate-800">Receber pagamentos via Mercado Pago</p>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-[#009EE3] text-white px-2 py-0.5 rounded-full">
                      <Star className="h-2.5 w-2.5 fill-white" /> Novo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pix e Cartão automáticos · Reduz inadimplência · Venda mais
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-1.5 text-[#009EE3] text-xs font-bold">
                  <span className="hidden sm:block">Saiba mais</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </button>
        )}
      </div>
    </>
  );
}
