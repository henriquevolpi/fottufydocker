import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Loader2, 
  CheckCircle, 
  Camera,
  Sparkles,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SubscriptionSuccessPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const MAX_AUTO_RETRIES = 999; // polling contínuo — erro só aparece se pagamento realmente falhou

  useEffect(() => {
    const verifySession = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        // Verificar se há session_id salvo no localStorage (caso de retorno sem URL)
        const savedSession = localStorage.getItem('pending_stripe_session');
        if (savedSession) {
          // Redirecionar para si mesmo com o session_id
          setLocation(`/subscription/success?session_id=${savedSession}`);
          return;
        }
        console.log('[Success] Sem session_id, redirecionando para dashboard');
        setLocation('/dashboard');
        return;
      }

      // Registrar o sessionId no estado para uso na UI
      setCurrentSessionId(sessionId);

      // Parar de tentar após o limite de tentativas automáticas
      if (retryCount > 0 && retryCount >= MAX_AUTO_RETRIES) {
        console.log(`[Success] Limite de ${MAX_AUTO_RETRIES} tentativas automáticas atingido`);
        setStatus('error');
        return;
      }

      if (!user) {
        // Salvar session_id no localStorage para ativar após o login
        localStorage.setItem('pending_stripe_session', sessionId);
        console.log('[Success] Usuário não autenticado — session_id salvo para ativar após login');
        setStatus('pending');
        return;
      }

      try {
        console.log(`%c[STRIPE-SUCCESS] ===== CHAMANDO ENDPOINT DE ATIVAÇÃO =====`, 'color: #6366f1; font-weight: bold');
        console.log(`[STRIPE-SUCCESS] sessionId: ${sessionId}`);
        console.log(`[STRIPE-SUCCESS] userId autenticado: ${user.id} (${user.email})`);
        console.log(`[STRIPE-SUCCESS] retryCount: ${retryCount}`);

        const response = await apiRequest("GET", `/api/stripe/checkout-session/${sessionId}`);
        const data = await response.json();

        console.log(`%c[STRIPE-SUCCESS] Resposta da API (status HTTP ${response.status}):`, 'color: #6366f1');
        console.log('[STRIPE-SUCCESS]', data);

        if (data.success) {
          console.log(`%c[STRIPE-SUCCESS] ✅ PLANO ATIVADO: ${data.planType} (alreadyProcessed: ${data.alreadyProcessed})`, 'color: green; font-weight: bold');
          setPlanInfo(data);
          setStatus('success');
          // Limpa o localStorage após ativação bem-sucedida
          localStorage.removeItem('pending_stripe_session');
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        } else if (data.status === 'unpaid') {
          // Pagamento realmente falhou — mostrar erro
          console.error(`[STRIPE-SUCCESS] ❌ Pagamento não aprovado — status: ${data.status}`);
          setStatus('error');
        } else {
          // Qualquer outro caso (open, paid sem subscription, etc): manter processando
          console.warn(`[STRIPE-SUCCESS] ⏳ Aguardando confirmação — status: ${data.status || 'desconhecido'}`);
          setStatus('pending');
        }
      } catch (error: any) {
        console.error(`%c[STRIPE-SUCCESS] ❌ Erro na chamada ao endpoint: ${error.message}`, 'color: red; font-weight: bold');
        console.error('[STRIPE-SUCCESS] Detalhes:', error);
        // Em todos os casos de erro (401, 403, 500, rede): manter como pending e continuar tentando
        // Nunca mostrar erro de pagamento por falha técnica/rede — só por status 'unpaid' do Stripe
        console.warn(`[STRIPE-SUCCESS] Erro transitório (${error.message}) — continuando polling`);
        setStatus('pending');
      }
    };

    if (!authLoading) {
      verifySession();
    }
  }, [authLoading, user, retryCount]);

  const handleRetry = () => {
    setStatus('loading');
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    if (status === 'pending' && user) {
      const interval = setInterval(() => {
        console.log('[Success] Auto-retry para verificar status');
        setRetryCount(prev => prev + 1);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [status, user]);

  if (authLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Confirmando seu pagamento...</p>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto py-16 px-4 max-w-2xl">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-center text-white">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                Pagamento Recebido!
              </h1>
              <p className="text-blue-100">
                {user ? 'Seu plano está sendo ativado' : 'Faça login para ativar seu plano'}
              </p>
            </div>

            <CardContent className="p-8">
              <div className="text-center mb-8">
                {user ? (
                  <>
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando sua assinatura...
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Aguarde um momento
                    </h2>
                    <p className="text-gray-600">
                      Seu pagamento foi confirmado pelo Stripe. Estamos ativando seu plano agora. 
                      Isso pode levar alguns segundos.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                      <CheckCircle className="h-4 w-4" />
                      Pagamento confirmado!
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Faça login para ativar seu plano
                    </h2>
                    <p className="text-gray-600">
                      Seu pagamento foi recebido com sucesso. Faça login na sua conta para 
                      ativar automaticamente seu novo plano.
                    </p>
                  </>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-green-800 text-sm">
                  <strong>Seu pagamento foi confirmado!</strong> {user 
                    ? 'Aguarde enquanto ativamos seu plano.' 
                    : 'Clique em "Fazer Login" abaixo para acessar sua conta e ativar seu plano automaticamente.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <>
                    <Button 
                      onClick={handleRetry}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-lg py-6"
                    >
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Verificar Novamente
                    </Button>
                    <Link href="/dashboard" className="flex-1">
                      <Button variant="outline" className="w-full text-lg py-6">
                        Ir para Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={currentSessionId
                        ? `/auth?redirect=${encodeURIComponent(`/subscription/success?session_id=${currentSessionId}`)}`
                        : '/auth'}
                      className="flex-1"
                    >
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-lg py-6">
                        <Camera className="mr-2 h-5 w-5" />
                        Fazer Login
                      </Button>
                    </Link>
                    <Link href="/dashboard" className="flex-1">
                      <Button variant="outline" className="w-full text-lg py-6">
                        Ir para Dashboard
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-gray-500 text-sm mt-8">
            {user 
              ? 'Se você completou o pagamento, seu plano será ativado em instantes.'
              : 'Após fazer login, seu plano será ativado automaticamente.'}
            <br />
            Caso precise de ajuda, entre em contato com nosso suporte.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">!</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Pagamento não aprovado
            </h1>
            <p className="text-gray-600 mb-6">
              Seu pagamento não foi aprovado pela operadora. Nenhuma cobrança foi realizada. Verifique os dados do cartão e tente novamente.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/subscription">
                <Button className="w-full">
                  Tentar novamente
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Ir para Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planNames: Record<string, string> = {
    'basico': 'Básico',
    'fotografo': 'Fotógrafo',
    'estudio': 'Estúdio'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto py-16 px-4 max-w-2xl">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
            <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-green-100">
              Bem-vindo ao Fottufy Premium
            </p>
          </div>

          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Plano {planNames[planInfo?.planType] || planInfo?.planType}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Sua assinatura está ativa!
              </h2>
              <p className="text-gray-600">
                Você agora tem acesso a todos os recursos do seu plano.
              </p>
            </div>

            <Link href="/dashboard" className="block">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-lg py-6">
                <ArrowRight className="mr-2 h-5 w-5" />
                Ir para Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-sm mt-8">
          Um recibo foi enviado para seu email. 
          <br />
          Você pode gerenciar sua assinatura a qualquer momento no painel.
        </p>
      </div>
    </div>
  );
}
