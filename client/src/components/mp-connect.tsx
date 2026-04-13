import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SiMercadopago } from "react-icons/si";
import { CheckCircle2, Link2, Unlink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MpConnect() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [connecting, setConnecting] = useState(false);

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
      // Remove o param da URL sem recarregar a página
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
    <div className="mt-10 mb-2 max-w-xl mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#009EE3]/10 flex items-center justify-center flex-shrink-0">
          <SiMercadopago className="w-7 h-7 text-[#009EE3]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800">Receber pagamentos via Mercado Pago</p>
          {isLoading ? (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Verificando...
            </p>
          ) : status?.connected ? (
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Conta conectada — seus clientes podem pagar via Pix
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5">
              Conecte sua conta para receber pagamentos dos clientes direto no seu MP
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          {status?.connected ? (
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
          ) : (
            <Button
              size="sm"
              className="rounded-xl text-xs bg-[#009EE3] hover:bg-[#0082c1] text-white"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <><Link2 className="h-3.5 w-3.5 mr-1" /> Conectar</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
