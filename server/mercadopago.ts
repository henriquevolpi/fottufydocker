import { Router, Request, Response } from "express";
import { db } from "./db";
import { users, newProjects } from "@shared/schema";
import { eq } from "drizzle-orm";
import https from "https";

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
      return res.status(400).json({ error: "Falha ao obter token do Mercado Pago." });
    }
    const userId = (req.user as any).id;
    await db
      .update(users)
      .set({ mpAccessToken: token.access_token, mpUserId: String(token.user_id) })
      .where(eq(users.id, userId));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
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
      .where(eq(newProjects.publicId, projectId));
    if (!project) return res.json({ acceptsPayment: false });
    const [photographer] = await db
      .select({ mpUserId: users.mpUserId })
      .from(users)
      .where(eq(users.id, project.userId));
    res.json({ acceptsPayment: !!photographer?.mpUserId });
  } catch {
    res.json({ acceptsPayment: false });
  }
});

// POST /api/mp/create-payment — cria cobrança Pix para o cliente pagar o fotógrafo
mpRouter.post("/api/mp/create-payment", async (req: Request, res: Response) => {
  try {
    const { projectId, amount, description } = req.body;
    if (!projectId || !amount) {
      return res.status(400).json({ error: "projectId e amount são obrigatórios." });
    }
    if (!isUUID(projectId)) {
      return res.status(400).json({ error: "Projeto inválido." });
    }
    const [project] = await db
      .select({ userId: newProjects.userId })
      .from(newProjects)
      .where(eq(newProjects.publicId, projectId));
    if (!project) return res.status(404).json({ error: "Projeto não encontrado." });

    const [photographer] = await db
      .select({ mpAccessToken: users.mpAccessToken, mpUserId: users.mpUserId })
      .from(users)
      .where(eq(users.id, project.userId));
    if (!photographer?.mpAccessToken) {
      return res.status(400).json({ error: "Fotógrafo não conectou o Mercado Pago." });
    }

    const platformFeeRatio = Number(process.env.MP_PLATFORM_FEE_RATIO || "0.05");
    const platformFee = Math.round(amount * platformFeeRatio * 100) / 100;

    const idempotencyKey = `fottufy-${projectId}-${Date.now()}`;
    const paymentBody = {
      transaction_amount: amount,
      description: description || "Fotos selecionadas — Fottufy",
      payment_method_id: "pix",
      payer: { email: "cliente@fottufy.com" },
      application_fee: platformFee,
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

    res.json({
      paymentId: mpRes.id,
      status: mpRes.status,
      pixCopiaECola: mpRes.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: mpRes.point_of_interaction?.transaction_data?.qr_code_base64,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
