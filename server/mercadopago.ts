import { Router, Request, Response } from "express";
import { db } from "./db";
import { users, newProjects, mpPayments } from "@shared/schema";
import { eq } from "drizzle-orm";
import https from "https";
import crypto from "crypto";

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const mpRouter = Router();

const MP_CLIENT_ID = process.env.MP_CLIENT_ID || "";
const MP_CLIENT_SECRET = process.env.MP_CLIENT_SECRET || "";
const MP_REDIRECT_URI = process.env.MP_REDIRECT_URI || "";

function isLoggedIn(req: Request, res: Response): boolean {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).json({ error: "Não autenticado" });
    return false;
  }
  return true;
}

function mpPost(path: string, body: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: "api.mercadopago.com",
      path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch { reject(new Error("MP response parse error")); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function mpGet(path: string, accessToken: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.mercadopago.com",
      path,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch { reject(new Error("MP response parse error")); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

// GET /api/mp/auth-url — URL para fotógrafo autorizar a conta MP dele
mpRouter.get("/api/mp/auth-url", (req: Request, res: Response) => {
  if (!isLoggedIn(req, res)) return;
  if (!MP_CLIENT_ID || !MP_REDIRECT_URI) {
    return res.status(503).json({ error: "Integração com Mercado Pago não configurada ainda." });
  }
  const url =
    `https://auth.mercadopago.com.br/authorization?client_id=${MP_CLIENT_ID}` +
    `&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(MP_REDIRECT_URI)}`;
  res.json({ url });
});

// GET /api/mp/callback — Recebe o code do OAuth e salva o token do fotógrafo
mpRouter.get("/api/mp/callback", async (req: Request, res: Response) => {
  if (!isLoggedIn(req, res)) return;
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Código de autorização ausente." });
  }
  if (!MP_CLIENT_ID || !MP_CLIENT_SECRET || !MP_REDIRECT_URI) {
    return res.status(503).json({ error: "Integração não configurada." });
  }
  try {
    const token = await mpPost("/oauth/token", {
      client_id: MP_CLIENT_ID,
      client_secret: MP_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: MP_REDIRECT_URI,
    });
    if (!token.access_token) {
      return res.redirect("/dashboard?mp=error");
    }
    const userId = (req.user as any).id;
    await db
      .update(users)
      .set({ mpAccessToken: token.access_token, mpUserId: String(token.user_id) })
      .where(eq(users.id, userId));
    res.redirect("/dashboard?mp=connected");
  } catch (e: any) {
    console.error("[MP OAuth callback] Erro:", e.message);
    res.redirect("/dashboard?mp=error");
  }
});

// GET /api/mp/status — verifica se fotógrafo logado tem MP conectado
mpRouter.get("/api/mp/status", async (req: Request, res: Response) => {
  if (!isLoggedIn(req, res)) return;
  const userId = (req.user as any).id;
  const [user] = await db.select({ mpUserId: users.mpUserId }).from(users).where(eq(users.id, userId));
  res.json({ connected: !!user?.mpUserId });
});

// POST /api/mp/disconnect — desconecta a conta MP do fotógrafo
mpRouter.post("/api/mp/disconnect", async (req: Request, res: Response) => {
  if (!isLoggedIn(req, res)) return;
  const userId = (req.user as any).id;
  await db.update(users).set({ mpAccessToken: null, mpUserId: null }).where(eq(users.id, userId));
  res.json({ ok: true });
});

// GET /api/mp/photographer-status/:projectId — o cliente verifica se fotógrafo do projeto aceita pagamento
mpRouter.get("/api/mp/photographer-status/:projectId", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    if (!isUUID(projectId)) {
      return res.json({ acceptsPayment: false });
    }
    const [project] = await db
      .select({ userId: newProjects.userId })
      .from(newProjects)
      .where(eq(newProjects.id, projectId));
    if (!project) return res.json({ acceptsPayment: false });
    const [photographer] = await db
      .select({ mpUserId: users.mpUserId, mpAccessToken: users.mpAccessToken })
      .from(users)
      .where(eq(users.id, project.userId));
    res.json({ acceptsPayment: !!(photographer?.mpUserId && photographer?.mpAccessToken) });
  } catch {
    res.json({ acceptsPayment: false });
  }
});

// POST /api/mp/webhook — recebe notificações do MP sobre status de pagamentos
mpRouter.post("/api/mp/webhook", async (req: Request, res: Response) => {
  try {
    // Validação da assinatura secreta do MP (apenas em live_mode)
    const webhookSecret = process.env.MP_WEBHOOK_SECRET || "";
    const isLiveMode = req.body?.live_mode !== false;
    if (webhookSecret && isLiveMode) {
      const xSignature = req.headers["x-signature"] as string | undefined;
      const xRequestId = req.headers["x-request-id"] as string | undefined;
      const dataId = (req.query["data.id"] || req.body?.data?.id) as string | undefined;

      if (!xSignature) {
        console.warn("[MP Webhook] Requisição sem x-signature rejeitada");
        return res.sendStatus(401);
      }

      // Extrair ts e v1 do header x-signature (formato: ts=...;v1=...)
      const parts: Record<string, string> = {};
      for (const part of xSignature.split(";")) {
        const [k, v] = part.split("=");
        if (k && v) parts[k.trim()] = v.trim();
      }

      const manifest = [
        parts.ts ? `ts:${parts.ts}` : null,
        xRequestId ? `x-request-id:${xRequestId}` : null,
        dataId ? `x-data-id:${dataId}` : null,
      ]
        .filter(Boolean)
        .join(",");

      const expectedHash = crypto
        .createHmac("sha256", webhookSecret)
        .update(manifest)
        .digest("hex");

      if (parts.v1 !== expectedHash) {
        console.warn("[MP Webhook] Assinatura inválida rejeitada");
        return res.sendStatus(401);
      }
    }

    const { type, action, data } = req.body;
    if (type === "payment" && data?.id) {
      const mpPaymentId = String(data.id);
      console.log(`[MP Webhook] Notificação recebida: ID=${mpPaymentId} action=${action}`);

      try {
        // Busca registro interno + token do fotógrafo para consultar status real no MP
        const [existing] = await db
          .select({
            id: mpPayments.id,
            status: mpPayments.status,
            projectId: mpPayments.projectId,
          })
          .from(mpPayments)
          .where(eq(mpPayments.mpPaymentId, mpPaymentId));

        if (existing && existing.status !== "approved") {
          // Busca o access token do fotógrafo para consultar o MP
          const [project] = await db
            .select({ userId: newProjects.userId })
            .from(newProjects)
            .where(eq(newProjects.id, existing.projectId));

          let mpStatus = "pending";
          if (project) {
            const [photographer] = await db
              .select({ mpAccessToken: users.mpAccessToken })
              .from(users)
              .where(eq(users.id, project.userId));

            if (photographer?.mpAccessToken) {
              // Consulta o status real do pagamento na API do MP
              const mpPayment = await mpGet(`/v1/payments/${mpPaymentId}`, photographer.mpAccessToken);
              mpStatus = mpPayment?.status || "pending";
            }
          }

          const validStatuses = ["approved", "rejected", "cancelled", "refunded"];
          if (validStatuses.includes(mpStatus)) {
            await db
              .update(mpPayments)
              .set({ status: mpStatus, updatedAt: new Date() })
              .where(eq(mpPayments.id, existing.id));
            console.log(`[MP Webhook] Pagamento ${mpPaymentId} atualizado para: ${mpStatus}`);
          }
        }
      } catch (dbErr: any) {
        console.error("[MP Webhook] Erro ao atualizar DB:", dbErr.message);
      }
    }

    res.sendStatus(200);
  } catch (e: any) {
    console.error("[MP Webhook] Erro:", e.message);
    res.sendStatus(200);
  }
});

// POST /api/mp/create-payment — cria cobrança Pix para o cliente pagar o fotógrafo
mpRouter.post("/api/mp/create-payment", async (req: Request, res: Response) => {
  try {
    const { projectId, amount, description, payerEmail } = req.body;
    if (!projectId || !amount) {
      return res.status(400).json({ error: "projectId e amount são obrigatórios." });
    }
    if (!isUUID(projectId)) {
      return res.status(400).json({ error: "Projeto inválido." });
    }

    const [project] = await db
      .select({ userId: newProjects.userId })
      .from(newProjects)
      .where(eq(newProjects.id, projectId));
    if (!project) return res.status(404).json({ error: "Projeto não encontrado." });

    const [photographer] = await db
      .select({ mpAccessToken: users.mpAccessToken, mpUserId: users.mpUserId })
      .from(users)
      .where(eq(users.id, project.userId));
    if (!photographer?.mpAccessToken) {
      return res.status(400).json({ error: "Fotógrafo não conectou o Mercado Pago." });
    }

    const amountCents = Math.round(amount * 100);

    const idempotencyKey = `fottufy-${projectId}-${Date.now()}`;
    const paymentBody = {
      transaction_amount: amount,
      description: description || "Fotos selecionadas — Fottufy",
      payment_method_id: "pix",
      payer: { email: payerEmail || "cliente@fottufy.com" },
    };

    const mpRes = await new Promise<any>((resolve, reject) => {
      const data = JSON.stringify(paymentBody);
      const options = {
        hostname: "api.mercadopago.com",
        path: "/v1/payments",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
          Authorization: `Bearer ${photographer.mpAccessToken}`,
          "X-Idempotency-Key": idempotencyKey,
        },
      };
      const r = https.request(options, (resp) => {
        let raw = "";
        resp.on("data", (chunk) => (raw += chunk));
        resp.on("end", () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error("parse error")); } });
      });
      r.on("error", reject);
      r.write(data);
      r.end();
    });

    if (!mpRes.id) {
      return res.status(400).json({ error: mpRes.message || "Erro ao criar pagamento." });
    }

    const pixCopiaECola = mpRes.point_of_interaction?.transaction_data?.qr_code || null;
    const qrCodeBase64 = mpRes.point_of_interaction?.transaction_data?.qr_code_base64 || null;

    // Salva registro do pagamento no banco para rastreamento
    const [savedPayment] = await db.insert(mpPayments).values({
      projectId,
      mpPaymentId: String(mpRes.id),
      status: mpRes.status || "pending",
      amount: amountCents,
      payerEmail: payerEmail || null,
      pixCopiaECola,
      qrCodeBase64,
    }).returning({ id: mpPayments.id });

    res.json({
      internalId: savedPayment.id,    // ID interno para polling de status
      mpPaymentId: mpRes.id,
      status: mpRes.status,
      pixCopiaECola,
      qrCodeBase64,
    });
  } catch (e: any) {
    console.error("[MP create-payment] Erro:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/mp/payment-status/:internalId — verifica status de um pagamento pelo ID interno
mpRouter.get("/api/mp/payment-status/:internalId", async (req: Request, res: Response) => {
  try {
    const { internalId } = req.params;
    if (!isUUID(internalId)) return res.status(400).json({ error: "ID inválido." });

    const [payment] = await db
      .select({ status: mpPayments.status, updatedAt: mpPayments.updatedAt })
      .from(mpPayments)
      .where(eq(mpPayments.id, internalId));

    if (!payment) return res.status(404).json({ error: "Pagamento não encontrado." });
    res.json({ status: payment.status, updatedAt: payment.updatedAt });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
