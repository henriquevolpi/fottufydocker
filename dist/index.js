var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  STRIPE_PRICE_IDS: () => STRIPE_PRICE_IDS,
  SUBSCRIPTION_PLANS: () => SUBSCRIPTION_PLANS,
  hotmartOffers: () => hotmartOffers,
  insertHotmartOfferSchema: () => insertHotmartOfferSchema,
  insertMpPaymentSchema: () => insertMpPaymentSchema,
  insertNewProjectSchema: () => insertNewProjectSchema,
  insertNurturingEmailSchema: () => insertNurturingEmailSchema,
  insertPasswordResetTokenSchema: () => insertPasswordResetTokenSchema,
  insertPhotoCommentSchema: () => insertPhotoCommentSchema,
  insertPhotoSchema: () => insertPhotoSchema,
  insertPortfolioPhotoSchema: () => insertPortfolioPhotoSchema,
  insertPortfolioSchema: () => insertPortfolioSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertReferralSchema: () => insertReferralSchema,
  insertSiteSettingSchema: () => insertSiteSettingSchema,
  insertUserSchema: () => insertUserSchema,
  mpPayments: () => mpPayments,
  newProjects: () => newProjects,
  newProjectsRelations: () => newProjectsRelations,
  nurturingEmails: () => nurturingEmails,
  passwordResetTokens: () => passwordResetTokens,
  passwordResetTokensRelations: () => passwordResetTokensRelations,
  photoComments: () => photoComments,
  photoCommentsRelations: () => photoCommentsRelations,
  photos: () => photos,
  photosRelations: () => photosRelations,
  portfolioPhotos: () => portfolioPhotos,
  portfolioPhotosRelations: () => portfolioPhotosRelations,
  portfolios: () => portfolios,
  portfoliosRelations: () => portfoliosRelations,
  projects: () => projects,
  referrals: () => referrals,
  siteSettings: () => siteSettings,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var users, usersRelations, insertUserSchema, referrals, insertReferralSchema, STRIPE_PRICE_IDS, SUBSCRIPTION_PLANS, projects, insertProjectSchema, newProjects, newProjectsRelations, insertNewProjectSchema, photos, photosRelations, insertPhotoSchema, photoComments, photoCommentsRelations, insertPhotoCommentSchema, passwordResetTokens, portfolios, portfolioPhotos, passwordResetTokensRelations, portfoliosRelations, portfolioPhotosRelations, insertPasswordResetTokenSchema, insertPortfolioSchema, insertPortfolioPhotoSchema, hotmartOffers, insertHotmartOfferSchema, siteSettings, insertSiteSettingSchema, nurturingEmails, insertNurturingEmailSchema, mpPayments, insertMpPaymentSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      phone: text("phone").notNull(),
      // Adicionando campo de telefone
      role: text("role").notNull().default("photographer"),
      // photographer | admin
      status: text("status").notNull().default("active"),
      // active | suspended | canceled
      createdAt: timestamp("created_at").notNull().defaultNow(),
      // Campos relacionados ao plano e assinatura
      planType: text("plan_type").default("free"),
      // free | basic | standard | professional
      uploadLimit: integer("upload_limit").default(0),
      usedUploads: integer("used_uploads").default(0),
      subscriptionStartDate: timestamp("subscription_start_date"),
      subscriptionEndDate: timestamp("subscription_end_date"),
      subscriptionStatus: text("subscription_status").default("inactive"),
      // active | inactive | canceled
      stripeCustomerId: text("stripe_customer_id"),
      stripeSubscriptionId: text("stripe_subscription_id"),
      subscription_id: text("subscription_id"),
      // mantido para compatibilidade
      lastEvent: jsonb("last_event").default(null).$type(),
      // Campos para controle de downgrade automático
      pendingDowngradeDate: timestamp("pending_downgrade_date"),
      // Data quando o downgrade deve ocorrer (evento + 3 dias)
      pendingDowngradeReason: text("pending_downgrade_reason"),
      // Motivo do downgrade pendente (canceled, refunded, etc)
      originalPlanBeforeDowngrade: text("original_plan_before_downgrade"),
      // Plano original antes do downgrade
      // Campos para controle de ativação manual pelo ADM
      manualActivationDate: timestamp("manual_activation_date"),
      // Data quando o plano foi ativado manualmente pelo ADM
      manualActivationBy: text("manual_activation_by"),
      // Email do administrador que ativou manualmente
      isManualActivation: boolean("is_manual_activation").default(false),
      // Flag para indicar se é ativação manual
      // Campo para rastrear o último login do usuário
      lastLoginAt: timestamp("last_login_at"),
      // Campos para controle de portfólios (separado do sistema de dashboard)
      portfolioLimit: integer("portfolio_limit").default(4),
      // Limite de portfólios para contas ativas
      usedPortfolios: integer("used_portfolios").default(0),
      // Quantidade de portfólios criados
      portfolioPhotoLimit: integer("portfolio_photo_limit").default(40),
      // Limite de fotos por portfólio
      // Campo para identificar tipo de cobrança (mensal/anual) - usado para recursos exclusivos
      billingPeriod: text("billing_period").default("monthly"),
      // "monthly" | "yearly"
      // Sistema de indicação (referral)
      referralCode: text("referral_code").unique(),
      // Código único de 8 caracteres para indicação
      referredBy: integer("referred_by"),
      // ID do usuário que indicou (FK para users)
      // Bônus por indicações convertidas
      bonusPhotos: integer("bonus_photos").default(0),
      // Fotos extras ganhas por indicações (+1000 por indicação)
      isAmbassador: boolean("is_ambassador").default(false),
      // Selo de embaixador (ganhou ao menos 1 indicação convertida)
      // Mercado Pago — conta do fotógrafo para receber pagamentos dos clientes
      mpAccessToken: text("mp_access_token"),
      // Token OAuth do fotógrafo (salvo via OAuth MP)
      mpUserId: text("mp_user_id")
      // ID da conta MP do fotógrafo
    });
    usersRelations = relations(users, ({ many }) => ({
      projects: many(newProjects)
    }));
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      lastEvent: true,
      lastLoginAt: true,
      uploadLimit: true,
      usedUploads: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      portfolioLimit: true,
      usedPortfolios: true,
      portfolioPhotoLimit: true,
      referralCode: true,
      bonusPhotos: true,
      isAmbassador: true
    });
    referrals = pgTable("referrals", {
      id: serial("id").primaryKey(),
      referrerId: integer("referrer_id").notNull(),
      // Usuário que indicou
      referredId: integer("referred_id").notNull(),
      // Usuário indicado
      status: text("status").notNull().default("pending"),
      // pending | converted
      discountAppliedAt: timestamp("discount_applied_at"),
      // Quando o desconto foi aplicado ao indicador
      createdAt: timestamp("created_at").notNull().defaultNow(),
      convertedAt: timestamp("converted_at")
      // Quando o indicado fez a primeira compra
    });
    insertReferralSchema = createInsertSchema(referrals).omit({
      id: true,
      createdAt: true,
      discountAppliedAt: true,
      convertedAt: true
    });
    STRIPE_PRICE_IDS = {
      BASICO_MONTHLY: "price_1SuMfDHhs27r0l2SHQWt0qC3",
      BASICO_YEARLY: "price_1SuMfDHhs27r0l2SiHk6j5CN",
      FOTOGRAFO_MONTHLY: "price_1SuMfDHhs27r0l2SBblpOkuo",
      FOTOGRAFO_YEARLY: "price_1SuMfEHhs27r0l2SkyU5eXM6",
      ESTUDIO_MONTHLY: "price_1SuMfEHhs27r0l2S0xd4wG9b",
      ESTUDIO_YEARLY: "price_1SuMfEHhs27r0l2SlaPtrh7B"
    };
    SUBSCRIPTION_PLANS = {
      FREE: {
        name: "Gratuito",
        type: "free",
        price: 0,
        uploadLimit: 10,
        description: "Plano para testes"
      },
      // Planos antigos (mantidos para compatibilidade)
      BASIC: {
        name: "B\xE1sico",
        type: "basic",
        price: 14.9,
        uploadLimit: 1e4,
        description: "10.000 uploads por conta",
        stripePriceId: "price_1RLDC2Hhs27r0l2SJGfPUumX"
      },
      STANDARD: {
        name: "Padr\xE3o",
        type: "standard",
        price: 37.9,
        uploadLimit: 5e4,
        description: "50.000 uploads por conta",
        stripePriceId: "price_1RLDCLHhs27r0l2SXe9gkVlD"
      },
      PROFESSIONAL: {
        name: "Profissional",
        type: "professional",
        price: 70,
        uploadLimit: 1e5,
        description: "100.000 uploads por conta",
        stripePriceId: "price_1RLDCpHhs27r0l2S4InekNvP"
      },
      // Planos V2 (mantidos para compatibilidade com usuários existentes)
      BASIC_V2: {
        name: "B\xE1sico",
        type: "basic_v2",
        price: 14.9,
        uploadLimit: 6e3,
        description: "6.000 uploads por conta",
        stripePriceId: "price_1RLDC2Hhs27r0l2SJGfPUumX"
      },
      STANDARD_V2: {
        name: "Padr\xE3o",
        type: "standard_v2",
        price: 29.9,
        uploadLimit: 17e3,
        description: "17.000 uploads por conta",
        stripePriceId: "price_1RLDCLHhs27r0l2SXe9gkVlD"
      },
      PROFESSIONAL_V2: {
        name: "Profissional",
        type: "professional_v2",
        price: 49.9,
        uploadLimit: 4e4,
        description: "40.000 uploads por conta",
        stripePriceId: "price_1RLDCpHhs27r0l2S4InekNvP"
      },
      // Novos planos 2026 (com Stripe integrado)
      BASICO: {
        name: "B\xE1sico",
        type: "basico",
        price: 19.9,
        yearlyPrice: 155,
        uploadLimit: 6e3,
        description: "At\xE9 6.000 fotos por m\xEAs",
        stripePriceIdMonthly: STRIPE_PRICE_IDS.BASICO_MONTHLY,
        stripePriceIdYearly: STRIPE_PRICE_IDS.BASICO_YEARLY
      },
      FOTOGRAFO: {
        name: "Fot\xF3grafo",
        type: "fotografo",
        price: 29.9,
        yearlyPrice: 235,
        uploadLimit: 17e3,
        description: "At\xE9 17.000 fotos por m\xEAs",
        stripePriceIdMonthly: STRIPE_PRICE_IDS.FOTOGRAFO_MONTHLY,
        stripePriceIdYearly: STRIPE_PRICE_IDS.FOTOGRAFO_YEARLY
      },
      ESTUDIO: {
        name: "Est\xFAdio",
        type: "estudio",
        price: 49.9,
        yearlyPrice: 369,
        uploadLimit: 4e4,
        description: "At\xE9 40.000 fotos por m\xEAs",
        stripePriceIdMonthly: STRIPE_PRICE_IDS.ESTUDIO_MONTHLY,
        stripePriceIdYearly: STRIPE_PRICE_IDS.ESTUDIO_YEARLY
      }
    };
    projects = pgTable("projects", {
      id: serial("id").primaryKey(),
      publicId: text("public_id").notNull().unique(),
      // Used for public URLs
      name: text("name").notNull(),
      clientName: text("client_name").notNull(),
      clientEmail: text("client_email").notNull(),
      photographerId: integer("photographer_id").notNull().references(() => users.id),
      status: text("status").notNull().default("pendente"),
      // pendente | revisado | finalizado | arquivado
      photos: jsonb("photos").default([]).$type(),
      selectedPhotos: jsonb("selected_photos").default([]).$type(),
      showWatermark: boolean("show_watermark").default(true),
      // Frontend watermark control
      includedPhotos: integer("included_photos").default(0),
      // Number of photos included in base price (0 = unlimited)
      additionalPhotoPrice: integer("additional_photo_price").default(0),
      // Price in cents for each additional photo
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertProjectSchema = createInsertSchema(projects).omit({
      id: true,
      photos: true,
      selectedPhotos: true,
      createdAt: true
    });
    newProjects = pgTable("new_projects", {
      id: uuid("id").defaultRandom().primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      title: text("title").notNull(),
      description: text("description"),
      showWatermark: boolean("show_watermark").default(true),
      status: text("status").default("pendente"),
      eventDate: text("event_date"),
      // Data do evento (YYYY-MM-DD)
      contractedPhotos: integer("contracted_photos").default(0),
      // Fotos contratadas/inclusas no pacote
      additionalPhotoPrice: integer("additional_photo_price").default(0),
      // Valor em centavos por foto extra
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    newProjectsRelations = relations(newProjects, ({ one, many }) => ({
      user: one(users, {
        fields: [newProjects.userId],
        references: [users.id]
      }),
      photos: many(photos)
    }));
    insertNewProjectSchema = createInsertSchema(newProjects).omit({
      id: true,
      createdAt: true
    });
    photos = pgTable("photos", {
      id: uuid("id").defaultRandom().primaryKey(),
      projectId: text("project_id").notNull(),
      // References projects.public_id OR newProjects.id
      url: text("url").notNull(),
      // URL original (full res) no R2/CDN
      filename: text("filename"),
      // Nome único usado pelo R2
      originalName: text("original_name"),
      // Nome original do arquivo enviado pelo usuário
      selected: boolean("selected").default(false),
      thumbnailUrl: text("thumbnail_url"),
      // URL do thumb gerado pelo Sharp (400px)
      processingStatus: text("processing_status").default("pending"),
      // 'pending' | 'processing' | 'ready' | 'error'
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    photosRelations = relations(photos, ({ one, many }) => ({
      project: one(newProjects, {
        fields: [photos.projectId],
        references: [newProjects.id]
      }),
      comments: many(photoComments)
    }));
    insertPhotoSchema = createInsertSchema(photos).omit({
      id: true,
      createdAt: true
    });
    photoComments = pgTable("photo_comments", {
      id: uuid("id").defaultRandom().primaryKey(),
      photoId: uuid("photo_id").notNull().references(() => photos.id, { onDelete: "cascade" }),
      clientName: text("client_name").notNull(),
      // Nome do cliente que comentou
      comment: text("comment").notNull(),
      // O comentário em si
      isViewed: boolean("is_viewed").default(false),
      // Se o fotógrafo já viu o comentário
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    photoCommentsRelations = relations(photoComments, ({ one }) => ({
      photo: one(photos, {
        fields: [photoComments.photoId],
        references: [photos.id]
      })
    }));
    insertPhotoCommentSchema = createInsertSchema(photoComments).omit({
      id: true,
      createdAt: true,
      isViewed: true
    }).extend({
      photoId: z.string().min(1)
      // Accept any non-empty string for photo ID
    });
    passwordResetTokens = pgTable("password_reset_tokens", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      token: uuid("token").notNull().defaultRandom(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      expiresAt: timestamp("expires_at").notNull(),
      used: boolean("used").notNull().default(false)
    });
    portfolios = pgTable("portfolios", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      description: text("description"),
      coverImageUrl: text("cover_image_url"),
      bannerUrl: text("banner_url"),
      isPublic: boolean("is_public").default(true).notNull(),
      // Campos "Sobre mim"
      aboutTitle: varchar("about_title", { length: 255 }),
      aboutDescription: text("about_description"),
      aboutProfileImageUrl: text("about_profile_image_url"),
      aboutContact: text("about_contact"),
      aboutEmail: varchar("about_email", { length: 255 }),
      aboutPhone: varchar("about_phone", { length: 50 }),
      aboutWebsite: varchar("about_website", { length: 255 }),
      aboutInstagram: varchar("about_instagram", { length: 255 }),
      aboutEnabled: boolean("about_enabled").default(false).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    portfolioPhotos = pgTable("portfolio_photos", {
      id: serial("id").primaryKey(),
      portfolioId: integer("portfolio_id").notNull().references(() => portfolios.id, { onDelete: "cascade" }),
      photoUrl: text("photo_url").notNull(),
      originalName: varchar("original_name", { length: 255 }),
      description: text("description"),
      order: integer("order").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
      user: one(users, {
        fields: [passwordResetTokens.userId],
        references: [users.id]
      })
    }));
    portfoliosRelations = relations(portfolios, ({ one, many }) => ({
      user: one(users, {
        fields: [portfolios.userId],
        references: [users.id]
      }),
      photos: many(portfolioPhotos)
    }));
    portfolioPhotosRelations = relations(portfolioPhotos, ({ one }) => ({
      portfolio: one(portfolios, {
        fields: [portfolioPhotos.portfolioId],
        references: [portfolios.id]
      })
    }));
    insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
      id: true,
      token: true,
      createdAt: true
    });
    insertPortfolioSchema = createInsertSchema(portfolios).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPortfolioPhotoSchema = createInsertSchema(portfolioPhotos).omit({
      id: true,
      createdAt: true
    });
    hotmartOffers = pgTable("hotmart_offers", {
      id: serial("id").primaryKey(),
      offerCode: text("offer_code").notNull().unique(),
      // Código da oferta na Hotmart (ex: "ro76q5uz")
      planType: text("plan_type").notNull(),
      // Tipo de plano: "basic_v2", "standard_v2", "professional_v2"
      billingPeriod: text("billing_period").notNull().default("monthly"),
      // "monthly" (30 dias) ou "yearly" (365 dias)
      description: text("description"),
      // Descrição opcional da oferta
      isActive: boolean("is_active").notNull().default(true),
      // Se a oferta está ativa
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertHotmartOfferSchema = createInsertSchema(hotmartOffers).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      billingPeriod: z.enum(["monthly", "yearly"]).default("monthly")
    });
    siteSettings = pgTable("site_settings", {
      id: serial("id").primaryKey(),
      key: text("key").notNull().unique(),
      // Chave única para a configuração (ex: "dashboard_banner")
      value: jsonb("value").notNull().$type(),
      // Valor em JSON
      isActive: boolean("is_active").notNull().default(true),
      updatedAt: timestamp("updated_at").notNull().defaultNow(),
      updatedBy: integer("updated_by")
      // ID do admin que fez a última alteração
    });
    insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
      id: true,
      updatedAt: true
    });
    nurturingEmails = pgTable("nurturing_emails", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      // FK para users
      emailNumber: integer("email_number").notNull(),
      // 1, 2, 3, 4, 5, 6 (dias 1, 2, 4, 6, 8, 10)
      sentAt: timestamp("sent_at").notNull().defaultNow(),
      emailId: text("email_id")
      // ID do email retornado pelo Resend
    });
    insertNurturingEmailSchema = createInsertSchema(nurturingEmails).omit({
      id: true,
      sentAt: true
    });
    mpPayments = pgTable("mp_payments", {
      id: uuid("id").defaultRandom().primaryKey(),
      projectId: text("project_id").notNull(),
      // public_id (V1) ou uuid (V2) do projeto
      mpPaymentId: text("mp_payment_id").notNull(),
      // ID do pagamento no Mercado Pago
      status: text("status").notNull().default("pending"),
      // pending | approved | rejected | cancelled
      amount: integer("amount").notNull(),
      // Valor em centavos
      payerEmail: text("payer_email"),
      // Email do cliente pagador
      pixCopiaECola: text("pix_copia_e_cola"),
      // Código copia e cola do Pix
      qrCodeBase64: text("qr_code_base64"),
      // QR code em base64
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertMpPaymentSchema = createInsertSchema(mpPayments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
  }
});

// server/utils/sendEmail.ts
import { Resend } from "resend";
async function sendEmail(params) {
  const { to, subject, html, from = "Fottufy <noreply@fottufy.com>" } = params;
  const debug = process.env.DEBUG_EMAIL === "true";
  console.log(`[Email] Tentando enviar email para: ${to}, assunto: ${subject}`);
  try {
    if (!resendClient) {
      console.error("Erro ao enviar e-mail: RESEND_API_KEY n\xE3o est\xE1 configurada");
      return {
        success: false,
        message: "Servi\xE7o de e-mail n\xE3o configurado. RESEND_API_KEY n\xE3o est\xE1 definida."
      };
    }
    if (!to || !subject || !html) {
      return {
        success: false,
        message: "Par\xE2metros de email incompletos."
      };
    }
    const { data, error } = await resendClient.emails.send({
      from,
      to,
      subject,
      html
    });
    if (data) {
      console.log(`[Email] Email enviado com sucesso para ${to}, ID: ${data.id}`);
    }
    if (error) {
      console.error("Erro ao enviar e-mail via Resend:", error.message);
      console.error("Detalhes do erro:", JSON.stringify(error));
      return {
        success: false,
        message: `Falha ao enviar e-mail: ${error.message}`
      };
    }
    return {
      success: true,
      message: "E-mail enviado"
    };
  } catch (error) {
    console.error(
      "Erro inesperado ao enviar e-mail:",
      error instanceof Error ? error.message : "Erro desconhecido"
    );
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    return {
      success: false,
      message: `Erro ao enviar e-mail: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    };
  }
}
var resendClient;
var init_sendEmail = __esm({
  "server/utils/sendEmail.ts"() {
    "use strict";
    resendClient = null;
    if (process.env.RESEND_API_KEY) {
      resendClient = new Resend(process.env.RESEND_API_KEY);
    } else {
      console.warn("AVISO: RESEND_API_KEY n\xE3o est\xE1 configurada. O envio de e-mails n\xE3o funcionar\xE1.");
    }
  }
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
function logDbConnectionStatus(status, details = "") {
  if (process.env.DEBUG_MEMORY === "true") {
    console.log(`
=== DATABASE CONNECTION [${status}] ===
${details ? `Details: ${details}
` : ""}Time: ${(/* @__PURE__ */ new Date()).toISOString()}
Configuration: ${JSON.stringify({
      host: poolConfig.host,
      port: poolConfig.port,
      database: poolConfig.database,
      max: poolConfig.max,
      idleTimeoutMillis: poolConfig.idleTimeoutMillis,
      connectionTimeoutMillis: poolConfig.connectionTimeoutMillis
    }, null, 2)}
================================
    `);
  }
}
function startDbHealthCheck(intervalMs = 6e4) {
  if (dbHealthCheckInterval) {
    clearInterval(dbHealthCheckInterval);
  }
  dbHealthCheckInterval = setInterval(async () => {
    try {
      const result = await testConnection();
      if (result.connected) {
        logDbConnectionStatus("health-check-success", `Database connection healthy (Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount})`);
      } else {
        logDbConnectionStatus("health-check-failure", `Database connection failed: ${result.error}`);
        if (process.env.DEBUG_MEMORY === "true") {
          console.log("Detectado problema de conex\xE3o com o banco. Tentando estabelecer nova conex\xE3o...");
          try {
            const client = await pool.connect();
            console.log("Nova conex\xE3o estabelecida com sucesso. O banco de dados est\xE1 acess\xEDvel.");
            client.release();
          } catch (recoveryError) {
            console.error("Falha ao estabelecer nova conex\xE3o:", recoveryError);
            console.log("O problema de conex\xE3o persiste, mas o aplicativo continuar\xE1 tentando reconectar.");
          }
        }
      }
    } catch (error) {
      logDbConnectionStatus("health-check-error", `Error during database health check: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, intervalMs);
  logDbConnectionStatus("health-check-started", `Database health check scheduled every ${intervalMs / 1e3} seconds`);
  return dbHealthCheckInterval;
}
async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    return {
      connected: true,
      timestamp: result.rows[0].now,
      using: isReplit ? "Replit PostgreSQL" : "PostgreSQL"
    };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      connected: false,
      error: error.message,
      using: isReplit ? "Replit PostgreSQL" : "PostgreSQL"
    };
  }
}
var isReplit, isProduction, poolConfig, pool, db, dbHealthCheckInterval;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    isReplit = process.env.REPL_ID !== void 0;
    isProduction = process.env.NODE_ENV === "production";
    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      max: isReplit ? 10 : 20,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: isReplit ? 15e3 : 1e4,
      // SSL necessário para conectar ao banco
      ssl: {
        rejectUnauthorized: false
      }
    };
    pool = new Pool(poolConfig);
    pool.on("connect", (client) => {
      logDbConnectionStatus("connect", `New client connected to database (Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount})`);
    });
    pool.on("error", (err, client) => {
      logDbConnectionStatus("error", `Database pool error: ${err.message}`);
      console.error("Unexpected error on idle client", err);
    });
    pool.on("acquire", (client) => {
      if (process.env.DEBUG_MEMORY === "true") {
        logDbConnectionStatus("acquire", `Connection acquired from pool (Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount})`);
      }
    });
    pool.on("remove", (client) => {
      if (process.env.DEBUG_MEMORY === "true") {
        logDbConnectionStatus("remove", `Connection removed from pool (Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount})`);
      }
    });
    db = drizzle(pool, { schema: schema_exports });
    dbHealthCheckInterval = null;
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  hashPassword: () => hashPassword,
  setupAuth: () => setupAuth
});
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcrypt";
import axios from "axios";
import { eq } from "drizzle-orm";
async function sendBotConversaWebhook(name, phone) {
  if (process.env.NODE_ENV === "development" && process.env.FORCE_WEBHOOK !== "true") {
    return;
  }
  try {
    if (process.env.DEBUG_WEBHOOK === "true") {
      console.log(`[WEBHOOK] Enviando dados para BotConversa`);
    }
    await axios.post(BOT_CONVERSA_WEBHOOK_URL, {
      name,
      phone
    }, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 5e3
      // Timeout de 5 segundos para não atrasar o fluxo principal
    });
    if (process.env.DEBUG_WEBHOOK === "true") {
      console.log("[WEBHOOK] Dados enviados com sucesso");
    }
  } catch (error) {
    if (process.env.DEBUG_WEBHOOK === "true") {
      console.error("[WEBHOOK] Erro ao enviar dados");
    }
  }
}
async function sendWelcomeEmail(name, email) {
  if (process.env.NODE_ENV === "development" && process.env.FORCE_EMAIL !== "true") {
    return;
  }
  try {
    if (process.env.DEBUG_EMAIL === "true") {
      console.log(`[EMAIL] Enviando e-mail de boas-vindas`);
    }
    const displayName = name.split(" ")[0];
    const htmlContent = getWelcomeEmailTemplate(displayName, (/* @__PURE__ */ new Date()).getFullYear());
    const result = await sendEmail({
      to: email,
      subject: `Bem-vindo \xE0 Fottufy, ${displayName}!`,
      html: htmlContent
    });
    if (result.success) {
      if (process.env.DEBUG_EMAIL === "true") {
        console.log(`[EMAIL] E-mail enviado com sucesso`);
      }
    } else {
      if (process.env.DEBUG_EMAIL === "true") {
        console.error(`[EMAIL] Falha ao enviar e-mail: ${result.message}`);
      }
    }
  } catch (error) {
    if (process.env.DEBUG_EMAIL === "true") {
      console.error("[EMAIL] Erro ao enviar e-mail");
    }
  }
}
function getWelcomeEmailTemplate(displayName, currentYear) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo \xE0 Fottufy</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #6366f1;
          padding: 20px;
          text-align: center;
          color: white;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 14px;
        }
        h1 {
          color: white;
          margin: 0;
          font-size: 24px;
        }
        .button {
          display: inline-block;
          background-color: #6366f1;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin-top: 20px;
          font-weight: bold;
        }
        p {
          margin-bottom: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bem-vindo \xE0 Fottufy!</h1>
        </div>
        <div class="content">
          <p>Ol\xE1, <strong>${displayName}</strong>!</p>
          <p>\xC9 com grande prazer que damos as boas-vindas \xE0 Fottufy, sua nova plataforma para gerenciamento de fotos profissionais.</p>
          <p>Com a Fottufy, voc\xEA poder\xE1:</p>
          <ul>
            <li>Fazer upload e organizar suas fotos em projetos</li>
            <li>Compartilhar seus projetos com clientes atrav\xE9s de links \xFAnicos</li>
            <li>Acompanhar quais fotos seus clientes selecionaram</li>
            <li>Gerenciar entregas e visualiza\xE7\xF5es de seus trabalhos</li>
          </ul>
          <p>Para come\xE7ar, fa\xE7a login na plataforma e crie seu primeiro projeto:</p>
          <div style="text-align: center;">
            <a href="https://fottufy.com/dashboard" class="button">Acessar Minha Conta</a>
          </div>
          <p style="margin-top: 30px;">Se voc\xEA tiver qualquer d\xFAvida, basta responder a este e-mail que nossa equipe estar\xE1 pronta para ajudar.</p>
          <p>Atenciosamente,<br>Equipe Fottufy</p>
        </div>
        <div class="footer">
          <p>\xA9 ${currentYear} Fottufy. Todos os direitos reservados.</p>
          <p>Est\xE1 recebendo este e-mail porque voc\xEA se registrou na plataforma Fottufy.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}
async function comparePasswords(supplied, stored) {
  try {
    return await bcrypt.compare(supplied, stored);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}
function setupAuth(app2) {
  const sessionSettings = {
    // Use the enhanced secure secret
    secret: process.env.SESSION_SECRET,
    // Optimize for security vs compatibility
    resave: false,
    // Don't save session if unmodified
    saveUninitialized: false,
    // Don't create session until something is stored
    store: storage.sessionStore,
    name: "fottufy.sid",
    // Use project name
    cookie: {
      // Enable secure cookies in production
      secure: process.env.NODE_ENV === "production",
      // Reasonable session duration (7 days instead of 30)
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      // HttpOnly for security, except in development for debugging
      httpOnly: process.env.NODE_ENV === "production",
      // Stricter sameSite in production
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      // No domain restriction for better compatibility
      domain: void 0
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy({
      usernameField: "email",
      passwordField: "password"
    }, async (email, password, done) => {
      try {
        const normalizedEmail = email.toLowerCase();
        const user = await storage.getUserByEmail(normalizedEmail);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      if (process.env.DEBUG_AUTH === "true") {
        console.log("Processing registration request");
      }
      let { email, password, referralCode } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      email = email.toLowerCase();
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      let referrerId = null;
      if (referralCode && referralCode.length >= 6) {
        const referrer = await storage.getUserByReferralCode(referralCode.toUpperCase());
        if (referrer) {
          referrerId = referrer.id;
          console.log(`Registro via indica\xE7\xE3o: c\xF3digo ${referralCode} pertence ao usu\xE1rio ID=${referrer.id}`);
        }
      }
      const hashedPassword = await hashPassword(password);
      const userData = {
        name: req.body.name || email.split("@")[0],
        // Use part of email as name if not provided
        email,
        phone: req.body.phone || "+000000000000",
        // Use provided phone or default if not provided
        password: hashedPassword,
        role: "photographer",
        // Default to photographer role
        status: "active",
        // Default to active status
        referredBy: referrerId
        // ID do usuário que indicou (se houver)
      };
      const user = await storage.createUser(userData);
      if (referrerId && user.id !== referrerId) {
        try {
          await storage.createReferral(referrerId, user.id);
          console.log(`Referral criado: indicador ID=${referrerId}, indicado ID=${user.id}`);
        } catch (refError) {
          console.error("Erro ao criar referral (n\xE3o cr\xEDtico):", refError);
        }
      }
      Promise.all([
        sendBotConversaWebhook(userData.name, userData.phone).catch(() => {
        }),
        sendWelcomeEmail(userData.name, userData.email).catch(() => {
        })
      ]);
      if (req.session) {
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1e3;
      }
      req.login(user, (err) => {
        if (err) {
          if (process.env.DEBUG_AUTH === "true") {
            console.error("Error establishing session after registration");
          }
          return next(err);
        }
        if (process.env.DEBUG_AUTH === "true") {
          console.log(`Registration successful for ID: ${user.id}`);
          console.log(`Session ID: ${req.sessionID}`);
        }
        try {
          res.cookie("user_id", user.id, {
            httpOnly: process.env.NODE_ENV === "production",
            // Mais seguro em produção
            maxAge: 7 * 24 * 60 * 60 * 1e3,
            // 7 dias
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            secure: process.env.NODE_ENV === "production",
            domain: void 0
          });
        } catch (cookieError) {
          console.error("Error setting cookie after registration:", cookieError);
        }
        const { password: password2, ...completeUserData } = user;
        if (process.env.DEBUG_AUTH === "true") {
          console.log(`Sending complete user data after registration: ID=${user.id}`);
        }
        res.status(201).json(completeUserData);
      });
    } catch (error) {
      if (process.env.DEBUG_AUTH === "true") {
        console.error("Error during registration");
      }
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    if (req.body?.email) {
      req.body.email = req.body.email.toLowerCase();
    }
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({
          message: "Falha na autentica\xE7\xE3o. Verifique seu email e senha."
        });
      }
      req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1e3;
      req.login(user, async (err2) => {
        if (err2) return next(err2);
        try {
          await storage.updateUser(user.id, { lastLoginAt: /* @__PURE__ */ new Date() });
        } catch (updateError) {
          console.error("Error updating lastLoginAt:", updateError);
        }
        try {
          res.cookie("user_id", user.id, {
            httpOnly: process.env.NODE_ENV === "production",
            // Mais seguro em produção
            maxAge: 7 * 24 * 60 * 60 * 1e3,
            // 7 dias
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            secure: process.env.NODE_ENV === "production",
            // Força o cookie a ser definido mesmo em contextos de iframe
            domain: void 0
          });
        } catch (cookieError) {
          console.error("Error setting cookie:", cookieError);
        }
        const { password, ...userData } = user;
        res.json(userData);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ message: "Erro ao realizar logout" });
      }
      res.clearCookie("user_id");
      res.clearCookie("studio_user_id");
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (process.env.DEBUG_AUTH === "true") {
      console.log("[USER] Checking user authentication");
      console.log(`[USER] Session ID: ${req.sessionID}`);
      console.log(`[USER] Cookies: ${req.headers.cookie ? "present" : "undefined"}`);
      console.log(`[USER] Is authenticated: ${req.isAuthenticated ? req.isAuthenticated() : "not a function"}`);
      console.log(`[USER] User in request: ${req.user ? "set" : "not set"}`);
    }
    if (req.isAuthenticated && req.isAuthenticated()) {
      if (process.env.DEBUG_AUTH === "true") {
        console.log(`[USER] User authenticated via session`);
      }
      const { password, ...userData } = req.user;
      return res.json(userData);
    }
    if (req.headers.cookie) {
      if (process.env.DEBUG_AUTH === "true") {
        console.log("[USER] Found cookies but no passport session. Attempting to recover...");
      }
      let userId = null;
      const cookies = req.headers.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "studio_user_id" || name === "user_id") {
          userId = parseInt(value);
          break;
        }
      }
      if (userId && !isNaN(userId)) {
        storage.getUser(userId).then((user) => {
          if (user) {
            if (process.env.DEBUG_AUTH === "true") {
              console.log(`[USER] Loaded user from cookie`);
            }
            storage.updateUser(user.id, { lastLoginAt: /* @__PURE__ */ new Date() }).then((updatedUser) => {
              if (process.env.DEBUG_AUTH === "true") {
                console.log(`[USER] Last login timestamp updated`);
              }
              const userToLogin = updatedUser || user;
              req.login(userToLogin, (err) => {
                if (err && process.env.DEBUG_AUTH === "true") {
                  console.error("[USER] Error establishing session");
                  return res.status(401).json({ message: "N\xE3o autorizado" });
                }
                if (process.env.DEBUG_AUTH === "true") {
                  console.log("[USER] Session established");
                }
                const { password, ...userData } = userToLogin;
                return res.json(userData);
              });
            }).catch((error) => {
              if (process.env.DEBUG_AUTH === "true") {
                console.error("[USER] Error updating last login timestamp");
              }
              req.login(user, (err) => {
                if (err && process.env.DEBUG_AUTH === "true") {
                  console.error("[USER] Error establishing session");
                  return res.status(401).json({ message: "N\xE3o autorizado" });
                }
                if (process.env.DEBUG_AUTH === "true") {
                  console.log("[USER] Session established");
                }
                const { password, ...userData } = user;
                return res.json(userData);
              });
            });
            return;
          } else if (process.env.DEBUG_AUTH === "true") {
            console.log(`[USER] Could not find user from cookie`);
          }
        }).catch((err) => {
          if (process.env.DEBUG_AUTH === "true") {
            console.error("[USER] Error loading user from cookie");
          }
        });
        return;
      }
    }
    if (process.env.DEBUG_AUTH === "true" && req.session) {
      console.log("[USER] Session object debug info");
    }
    if (process.env.DEBUG_AUTH === "true") {
      console.log("[USER] Authentication failed, returning 401");
    }
    return res.status(401).json({ message: "N\xE3o autorizado" });
  });
  app2.post("/api/user/change-password", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "Usu\xE1rio n\xE3o autenticado"
      });
    }
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Senha atual e nova senha s\xE3o obrigat\xF3rias"
        });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usu\xE1rio n\xE3o encontrado"
        });
      }
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Senha atual incorreta"
        });
      }
      const hashedPassword = await hashPassword(newPassword);
      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, user.id));
      console.log(`Senha alterada com sucesso para o usu\xE1rio ID: ${user.id}`);
      return res.status(200).json({
        success: true,
        message: "Senha alterada com sucesso"
      });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao processar a solicita\xE7\xE3o"
      });
    }
  });
}
var SALT_ROUNDS, BOT_CONVERSA_WEBHOOK_URL;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    init_schema();
    init_sendEmail();
    init_db();
    SALT_ROUNDS = 10;
    BOT_CONVERSA_WEBHOOK_URL = "https://new-backend.botconversa.com.br/api/v1/webhooks-automation/catch/108243/V8tF64jdaanj/";
  }
});

// server/utils/welcomeEmail.ts
async function sendWelcomeEmail2(email, name, password) {
  const displayName = name || email.split("@")[0];
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const htmlContent = getWelcomeEmailTemplate2(displayName, email, password, currentYear);
  try {
    const result = await sendEmail({
      to: email,
      subject: "\u{1F973} Sua conta foi criada! Aqui est\xE3o seus dados de acesso",
      html: htmlContent
    });
    return result;
  } catch (error) {
    console.error("Erro ao enviar email de boas-vindas:", error);
    return { success: false, message: "Falha ao enviar e-mail de boas-vindas" };
  }
}
function getWelcomeEmailTemplate2(displayName, email, password, currentYear) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Bem-vindo \xE0 Fottufy!</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #4361ee; color: #ffffff; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Bem-vindo \xE0 Fottufy! \u{1F389}</h1>
      </div>
      
      <div style="padding: 30px 30px 20px; color: #333333;">
        <p style="font-size: 16px; margin-bottom: 25px;">
          Ol\xE1, <strong>${displayName}</strong>!
        </p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
          Sua conta na Fottufy foi criada com sucesso \u{1F389}
        </p>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid #4361ee; padding: 20px; margin-bottom: 25px;">
          <p style="font-size: 16px; margin: 0 0 10px 0;"><strong>Aqui est\xE3o seus dados de acesso:</strong></p>
          <p style="font-size: 16px; margin: 0 0 5px 0;">\u{1F4E7} E-mail: <strong>${email}</strong></p>
          <p style="font-size: 16px; margin: 0;">\u{1F510} Senha tempor\xE1ria: <strong>${password}</strong></p>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="https://fottufy.com/auth" 
             style="display: inline-block; background-color: #4361ee; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Acessar agora
          </a>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
          Recomendamos que voc\xEA troque a senha ap\xF3s o primeiro acesso.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 15px;">
          Obrigado por escolher a Fottufy para gerenciar seus projetos fotogr\xE1ficos!
        </p>
        
        <p style="font-size: 16px; margin-bottom: 0;">
          Atenciosamente,<br />
          Equipe Fottufy
        </p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666;">
        <p style="margin: 0 0 10px;">
          Este e-mail foi enviado automaticamente, por favor n\xE3o responda.
        </p>
        <p style="margin: 0 0 10px;">
          \xA9 ${currentYear} Fottufy. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </body>
</html>
  `;
}
var init_welcomeEmail = __esm({
  "server/utils/welcomeEmail.ts"() {
    "use strict";
    init_sendEmail();
  }
});

// server/integrations/hotmart.ts
import crypto from "crypto";
import { randomBytes } from "crypto";
function generateRandomPassword(length = 12) {
  const buffer = randomBytes(length);
  return buffer.toString("hex").slice(0, length);
}
function validateHotmartSignature(payload, signature, secret) {
  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[DEV] HOTMART_WEBHOOK_SECRET n\xE3o configurado. Valida\xE7\xE3o pulada apenas em desenvolvimento!");
      return true;
    } else {
      console.error("[SECURITY] HOTMART_WEBHOOK_SECRET \xE9 obrigat\xF3rio em produ\xE7\xE3o!");
      throw new Error("Webhook secret \xE9 obrigat\xF3rio em produ\xE7\xE3o");
    }
  }
  try {
    const hmac = crypto.createHmac("sha256", secret);
    const calculatedSignature = hmac.update(payload).digest("hex");
    return calculatedSignature === signature;
  } catch (error) {
    console.error("Erro na valida\xE7\xE3o da assinatura Hotmart:", error);
    return false;
  }
}
async function determineOffer(payload) {
  try {
    if (!payload) {
      console.log("Hotmart: Payload inv\xE1lido");
      return null;
    }
    const checkOfferInDatabase = async (offerId2) => {
      const offer = await storage.getHotmartOfferByCode(offerId2);
      if (offer && offer.isActive) {
        console.log(`Hotmart: Oferta encontrada no banco de dados: ${offerId2} -> ${offer.planType} (${offer.billingPeriod})`);
        return { planType: offer.planType, billingPeriod: offer.billingPeriod };
      }
      const lowerOfferId = offerId2.toLowerCase();
      const fallback = HOTMART_OFFER_TO_PLAN_MAP[lowerOfferId];
      if (fallback) {
        console.log(`Hotmart: Oferta encontrada no mapa fallback: ${offerId2} -> ${fallback.planType} (${fallback.billingPeriod})`);
        return fallback;
      }
      console.log(`Hotmart: Oferta N\xC3O encontrada (DB nem fallback) para c\xF3digo: ${offerId2}`);
      return null;
    };
    if (payload.data?.params?.off) {
      const offerId2 = payload.data.params.off;
      console.log(`Hotmart: ID da oferta encontrado em params: ${offerId2}`);
      const planType = await checkOfferInDatabase(offerId2);
      if (planType) return planType;
    }
    if (payload.data?.purchase?.offer?.off) {
      const offerId2 = payload.data.purchase.offer.off;
      console.log(`Hotmart: ID da oferta encontrado em offer: ${offerId2}`);
      const planType = await checkOfferInDatabase(offerId2);
      if (planType) return planType;
    }
    if (payload.data?.purchase?.transaction) {
      const transactionUrl = payload.data.purchase.transaction;
      if (typeof transactionUrl === "string" && transactionUrl.includes("off=")) {
        const offMatch = transactionUrl.match(/off=([a-zA-Z0-9]+)/);
        if (offMatch && offMatch[1]) {
          const offerId2 = offMatch[1];
          console.log(`Hotmart: ID da oferta encontrado na URL: ${offerId2}`);
          const planType = await checkOfferInDatabase(offerId2);
          if (planType) return planType;
        }
      }
    }
    const offerCode = payload.data?.purchase?.offer?.code;
    if (offerCode) {
      console.log(`Hotmart: Verificando c\xF3digo da oferta: ${offerCode}`);
      const planType = await checkOfferInDatabase(offerCode);
      if (planType) return planType;
    }
    console.log("Hotmart: Iniciando busca recursiva por ID de oferta...");
    const offerId = await findOfferIdInPayload(payload);
    if (offerId) {
      console.log(`Hotmart: ID da oferta encontrado por busca recursiva: ${offerId}`);
      const planType = await checkOfferInDatabase(offerId);
      if (planType) return planType;
    }
    const planName = payload.data?.purchase?.plan?.name || payload.data?.subscription?.plan;
    if (planName) {
      console.log(`Hotmart: Verificando nome do plano: ${JSON.stringify(planName)}`);
      let rawName = "";
      if (typeof planName === "string") {
        rawName = planName;
      } else if (typeof planName === "object" && planName !== null) {
        rawName = planName.name || "";
      }
      if (rawName && typeof rawName === "string") {
        console.log(`Hotmart: Nome do plano normalizado: ${rawName}`);
        const lowerName = rawName.toLowerCase();
        if (lowerName.includes("teste") || lowerName.includes("test")) {
          console.log(`Hotmart: Plano de teste detectado, n\xE3o ser\xE1 processado`);
          return null;
        }
      }
    }
    console.log(`Hotmart: Nenhuma oferta v\xE1lida encontrada. Payload resumido: event=${payload.event}, offer=${JSON.stringify(payload.data?.purchase?.offer)}, params=${JSON.stringify(payload.data?.params)}, transaction=${payload.data?.purchase?.transaction}`);
    return null;
  } catch (error) {
    console.error("Erro ao determinar tipo de plano:", error);
    return null;
  }
}
function findEmailInPayload(obj, depth = 0) {
  if (depth > 15 || !obj || typeof obj !== "object") {
    return null;
  }
  const complexEmail1 = obj?.data?.transaction?.details?.purchaseInfo?.clientProfile?.personalInfo?.contact?.email?.primaryAddress;
  if (complexEmail1 && typeof complexEmail1 === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(complexEmail1)) {
    console.log(`Hotmart: Email encontrado em estrutura complexa (tipo 1):`, complexEmail1);
    return complexEmail1;
  }
  const complexEmail2 = obj?.data?.order?.details?.buyer?.user_identity?.contact?.primary?.email_address;
  if (complexEmail2 && typeof complexEmail2 === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(complexEmail2)) {
    console.log(`Hotmart: Email encontrado em estrutura complexa (tipo 2):`, complexEmail2);
    return complexEmail2;
  }
  const emailKeys = [
    "email",
    "mail",
    "e-mail",
    "emailAddress",
    "email_address",
    "subscriber_email",
    "buyer_email",
    "customer_email",
    "primaryAddress",
    "primaryEmail",
    "emailPrimary",
    "userEmail",
    "client_email",
    "contactEmail"
  ];
  for (const key of Object.keys(obj)) {
    if (emailKeys.includes(key.toLowerCase()) && typeof obj[key] === "string") {
      const potentialEmail = obj[key];
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(potentialEmail)) {
        console.log(`Hotmart: Email encontrado na propriedade ${key}:`, potentialEmail);
        return potentialEmail;
      }
    }
    if (typeof obj[key] === "string") {
      const value = obj[key];
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        console.log(`Hotmart: Email encontrado como valor da propriedade ${key}:`, value);
        return value;
      }
    }
    if (obj[key] && typeof obj[key] === "object") {
      const nestedEmail = findEmailInPayload(obj[key], depth + 1);
      if (nestedEmail) {
        return nestedEmail;
      }
    }
  }
  return null;
}
function findPhoneRecursive(obj, depth = 0) {
  if (depth > 10 || !obj || typeof obj !== "object") {
    return null;
  }
  const phoneKeys = ["phone", "mobile", "cellphone", "telephone", "tel", "contactNumber", "phoneNumber"];
  for (const key of Object.keys(obj)) {
    if (phoneKeys.includes(key.toLowerCase()) && typeof obj[key] === "string") {
      const potentialPhone = obj[key];
      if (/^[+\d\s()-]{8,}$/.test(potentialPhone)) {
        console.log(`Hotmart: Telefone do cliente encontrado na propriedade ${key}: ${potentialPhone}`);
        return potentialPhone;
      }
    }
    if (obj[key] && typeof obj[key] === "object") {
      const nestedPhone = findPhoneRecursive(obj[key], depth + 1);
      if (nestedPhone) {
        return nestedPhone;
      }
    }
  }
  return null;
}
function findCustomerPhone(payload) {
  try {
    const complexPhone1 = payload?.data?.transaction?.details?.purchaseInfo?.clientProfile?.personalInfo?.contact?.phone?.mobile;
    if (complexPhone1 && typeof complexPhone1 === "string" && complexPhone1.length > 2) {
      console.log(`Hotmart: Telefone do cliente encontrado em estrutura complexa (tipo 1): ${complexPhone1}`);
      return complexPhone1;
    }
    const countryCode = payload?.data?.order?.details?.buyer?.user_identity?.contact?.primary?.phone?.countryCode;
    const phoneNumber = payload?.data?.order?.details?.buyer?.user_identity?.contact?.primary?.phone?.number;
    if (countryCode && phoneNumber && typeof countryCode === "string" && typeof phoneNumber === "string") {
      const fullPhone = countryCode.startsWith("+") ? `${countryCode}${phoneNumber}` : `+${countryCode}${phoneNumber}`;
      console.log(`Hotmart: Telefone do cliente composto a partir de countryCode e number: ${fullPhone}`);
      return fullPhone;
    }
    const complexPhone3 = payload?.purchaseDetails?.subscriber?.userDetails?.personalIdentity?.contactPhone;
    if (complexPhone3 && typeof complexPhone3 === "string" && complexPhone3.length > 2) {
      const formattedPhone = /^\d+$/.test(complexPhone3) ? `+${complexPhone3}` : complexPhone3;
      console.log(`Hotmart: Telefone do cliente encontrado em estrutura complexa (tipo 3): ${formattedPhone}`);
      return formattedPhone;
    }
    const phone = payload.data?.buyer?.phone || payload.data?.customer?.contact?.phone || payload.data?.purchase?.customer?.contact?.phone || payload.data?.contact?.phone || payload.customer?.contact?.phone || payload.customer?.phone || payload.buyer?.phone;
    if (phone && typeof phone === "string" && phone.length > 2) {
      console.log(`Hotmart: Telefone do cliente encontrado em local padr\xE3o: ${phone}`);
      return phone;
    }
    return findPhoneRecursive(payload);
  } catch (error) {
    console.error("Erro ao buscar telefone:", error);
    return null;
  }
}
function findCustomerName(payload, depth = 0) {
  if (depth > 15 || !payload || typeof payload !== "object") {
    return null;
  }
  const complexName1 = payload?.data?.transaction?.details?.purchaseInfo?.clientProfile?.personalInfo?.identification?.fullName;
  if (complexName1 && typeof complexName1 === "string" && complexName1.length > 0) {
    console.log(`Hotmart: Nome do cliente encontrado em estrutura complexa (tipo 1): ${complexName1}`);
    return complexName1;
  }
  const firstName = payload?.data?.transaction?.details?.purchaseInfo?.clientProfile?.personalInfo?.identification?.firstName;
  const lastName = payload?.data?.transaction?.details?.purchaseInfo?.clientProfile?.personalInfo?.identification?.lastName;
  if (firstName && lastName && typeof firstName === "string" && typeof lastName === "string") {
    const fullName = `${firstName} ${lastName}`;
    console.log(`Hotmart: Nome do cliente composto a partir de firstName e lastName: ${fullName}`);
    return fullName;
  }
  const complexName3 = payload?.data?.order?.details?.buyer?.user_identity?.name?.fullName;
  if (complexName3 && typeof complexName3 === "string" && complexName3.length > 0) {
    console.log(`Hotmart: Nome do cliente encontrado em estrutura complexa (tipo 3): ${complexName3}`);
    return complexName3;
  }
  const nameKeys = [
    "name",
    "customer_name",
    "clientName",
    "buyer_name",
    "fullName",
    "primeiro_nome",
    "full_name",
    "completeName",
    "displayName",
    "userName",
    "customerFullName",
    "buyerName"
  ];
  const customerName = payload.data?.customer?.name || payload.data?.purchase?.customer?.name || payload.data?.buyer?.name || payload.purchase?.customer?.name || payload.customer?.name || payload.data?.subscriber?.name;
  if (customerName && typeof customerName === "string" && customerName.length > 0) {
    console.log(`Hotmart: Nome do cliente encontrado em local espec\xEDfico: ${customerName}`);
    return customerName;
  }
  for (const key of Object.keys(payload)) {
    if (nameKeys.includes(key.toLowerCase()) && typeof payload[key] === "string" && payload[key].length > 0) {
      console.log(`Hotmart: Nome do cliente encontrado na propriedade ${key}: ${payload[key]}`);
      return payload[key];
    }
    if (payload[key] && typeof payload[key] === "object") {
      const nestedName = findCustomerName(payload[key], depth + 1);
      if (nestedName) {
        return nestedName;
      }
    }
  }
  return null;
}
async function findOfferIdInPayload(obj, depth = 0) {
  if (depth > 15 || !obj || typeof obj !== "object") {
    return null;
  }
  const complexOfferId1 = obj?.data?.transaction?.details?.purchaseInfo?.vendorInfo?.productData?.offerId;
  if (complexOfferId1 && typeof complexOfferId1 === "string") {
    console.log(`Hotmart: ID da oferta encontrado em estrutura complexa (tipo 1):`, complexOfferId1);
    return complexOfferId1;
  }
  const complexOfferId2 = obj?.purchaseDetails?.product?.information?.offerId;
  if (complexOfferId2 && typeof complexOfferId2 === "string") {
    console.log(`Hotmart: ID da oferta encontrado em estrutura complexa (tipo 2):`, complexOfferId2);
    return complexOfferId2;
  }
  const offerIdKeys = ["off", "offer_id", "offerId", "offer_code", "offerCode", "productCode", "planId"];
  for (const key of Object.keys(obj)) {
    if (offerIdKeys.includes(key.toLowerCase()) && typeof obj[key] === "string") {
      const potentialOfferId = obj[key];
      console.log(`Hotmart: ID da oferta encontrado na propriedade ${key}:`, potentialOfferId);
      return potentialOfferId;
    }
    if (typeof obj[key] === "string" && obj[key].includes("off=")) {
      const offMatch = obj[key].match(/off=([a-zA-Z0-9]+)/);
      if (offMatch && offMatch[1]) {
        console.log(`Hotmart: ID da oferta encontrado em URL:`, offMatch[1]);
        return offMatch[1];
      }
    }
    if (obj[key] && typeof obj[key] === "object") {
      const nestedOfferId = await findOfferIdInPayload(obj[key], depth + 1);
      if (nestedOfferId) {
        return nestedOfferId;
      }
    }
  }
  return null;
}
function isSafeToDowngrade(user, event) {
  if (!user.planType || user.planType === "free") {
    return { safe: false, reason: "Usu\xE1rio j\xE1 possui plano gratuito" };
  }
  if (user.isManualActivation && user.manualActivationDate) {
    const daysSinceManualActivation = Math.floor(
      ((/* @__PURE__ */ new Date()).getTime() - new Date(user.manualActivationDate).getTime()) / (1e3 * 60 * 60 * 24)
    );
    if (daysSinceManualActivation < 30) {
      return {
        safe: false,
        reason: `Ativa\xE7\xE3o manual recente (${daysSinceManualActivation} dias) - n\xE3o fazer downgrade autom\xE1tico`
      };
    }
  }
  if (user.lastEvent && user.lastEvent.type === "purchase.approved") {
    const hoursSinceLastPayment = Math.floor(
      ((/* @__PURE__ */ new Date()).getTime() - new Date(user.lastEvent.timestamp).getTime()) / (1e3 * 60 * 60)
    );
    if (hoursSinceLastPayment < 24) {
      return {
        safe: false,
        reason: `Pagamento muito recente (${hoursSinceLastPayment} horas) - poss\xEDvel conflito de webhooks`
      };
    }
  }
  if (event === "purchase.refunded" || event === "purchase.chargeback") {
    return { safe: true, reason: "Evento cr\xEDtico confirmado - downgrade justificado" };
  }
  if (event === "purchase.canceled" || event === "subscription.canceled") {
    return { safe: true, reason: "Cancelamento confirmado - agendar downgrade com toler\xE2ncia" };
  }
  return { safe: true, reason: "Verifica\xE7\xF5es de seguran\xE7a aprovadas" };
}
function analyzeSubscriptionStatus(user) {
  const now = /* @__PURE__ */ new Date();
  const result = {
    isActive: false,
    isExpired: false,
    isPendingCancellation: false,
    daysUntilExpiry: null,
    statusReason: "",
    recommendations: []
  };
  console.log(`[DEBUG] Analisando usu\xE1rio ${user.email}: planType=${user.planType}, subscriptionStatus=${user.subscriptionStatus}, subscriptionEndDate=${user.subscriptionEndDate}`);
  if (!user.planType || user.planType === "free") {
    result.statusReason = "Usu\xE1rio possui plano gratuito";
    result.recommendations.push("Considerar upgrade para plano pago");
    return result;
  }
  if (user.subscriptionStatus !== "active") {
    if (user.subscriptionStatus === "pending_cancellation") {
      result.isPendingCancellation = true;
      result.statusReason = "Assinatura em processo de cancelamento (per\xEDodo de toler\xE2ncia de 3 dias)";
      result.recommendations.push("Regularizar pagamento para manter acesso");
      return result;
    } else if (user.subscriptionStatus === "payment_failed") {
      result.isExpired = true;
      result.statusReason = "Assinatura desativada por falha cr\xEDtica de pagamento (reembolso ou chargeback)";
      result.recommendations.push("Entrar em contato com o suporte para reativar assinatura");
      result.recommendations.push("Verificar m\xE9todo de pagamento e efetuar nova compra se necess\xE1rio");
      return result;
    } else {
      result.statusReason = `Status da assinatura: ${user.subscriptionStatus || "indefinido"}`;
      result.recommendations.push("Verificar status da assinatura na Hotmart");
      return result;
    }
  }
  if (user.subscriptionEndDate) {
    const endDate = new Date(user.subscriptionEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    result.daysUntilExpiry = diffDays;
    if (diffDays <= 0) {
      result.isExpired = true;
      result.statusReason = `Assinatura expirou em ${endDate.toLocaleDateString()}`;
      result.recommendations.push("Renovar assinatura imediatamente");
      result.recommendations.push("Contatar suporte se houve renova\xE7\xE3o autom\xE1tica");
      return result;
    } else if (diffDays <= 7) {
      result.isActive = true;
      result.statusReason = `Assinatura expira em ${diffDays} dias`;
      result.recommendations.push("Verificar renova\xE7\xE3o autom\xE1tica");
      result.recommendations.push("Preparar backup dos projetos");
    } else if (diffDays <= 30) {
      result.isActive = true;
      result.statusReason = `Assinatura expira em ${diffDays} dias`;
      result.recommendations.push("Considerar renova\xE7\xE3o antecipada");
    } else {
      result.isActive = true;
      result.statusReason = `Assinatura ativa, expira em ${diffDays} dias`;
    }
  } else {
    result.isActive = true;
    result.statusReason = "Assinatura ativa (sem data de expira\xE7\xE3o definida)";
  }
  if (user.pendingDowngradeDate) {
    const downgradeDate = new Date(user.pendingDowngradeDate);
    const diffTime = downgradeDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    if (diffDays <= 0) {
      result.statusReason = "Downgrade pendente vencido - ser\xE1 processado automaticamente";
      result.recommendations.push("Regularizar pagamento urgentemente");
      result.recommendations.push("Entrar em contato com suporte");
    } else {
      result.isPendingCancellation = true;
      result.statusReason = `Downgrade agendado para ${diffDays} dias (motivo: ${user.pendingDowngradeReason || "n\xE3o especificado"})`;
      result.recommendations.push(`Voc\xEA tem ${diffDays} dias para regularizar o pagamento`);
      result.recommendations.push("Verificar problema de pagamento na Hotmart");
    }
  }
  if (!result.isExpired && !result.statusReason) {
    result.isActive = true;
    result.statusReason = "Assinatura ativa e funcionando normalmente";
  }
  return result;
}
function canUserUpload(user) {
  const analysis = analyzeSubscriptionStatus(user);
  if (analysis.isActive || analysis.isPendingCancellation) {
    return {
      allowed: true,
      reason: "Acesso autorizado",
      analysis
    };
  }
  return {
    allowed: false,
    reason: analysis.statusReason,
    analysis
  };
}
async function checkAdvancedUploadLimit(userId, uploadCount) {
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error("Usu\xE1rio n\xE3o encontrado");
  }
  const analysis = analyzeSubscriptionStatus(user);
  const uploadAccess = canUserUpload(user);
  const uploadInfo = {
    current: user.usedUploads || 0,
    limit: user.uploadLimit || 0,
    available: Math.max(0, (user.uploadLimit || 0) - (user.usedUploads || 0)),
    planType: user.planType || "free"
  };
  if (!uploadAccess.allowed) {
    return {
      allowed: false,
      reason: `Acesso negado: ${uploadAccess.reason}`,
      analysis,
      uploadInfo
    };
  }
  if (uploadInfo.available < uploadCount) {
    return {
      allowed: false,
      reason: `Limite de ${uploadInfo.limit} uploads atingido (${uploadInfo.current} utilizados)`,
      analysis,
      uploadInfo
    };
  }
  return {
    allowed: true,
    reason: "Upload autorizado",
    analysis,
    uploadInfo
  };
}
function generateWebhookKey(payload, event, email) {
  const transactionId = payload.data?.purchase?.transaction || payload.data?.subscription?.subscriber || payload.data?.product?.id || `${email}_${event}_${Date.now()}`;
  return `${event}_${email}_${transactionId}`.replace(/[^a-zA-Z0-9_]/g, "_");
}
function isWebhookAlreadyProcessed(key, payload) {
  const existing = processedWebhooks.get(key);
  if (!existing) {
    return false;
  }
  const hoursSinceProcessed = (Date.now() - existing.processedAt.getTime()) / (1e3 * 60 * 60);
  if (hoursSinceProcessed > 24) {
    processedWebhooks.delete(key);
    return false;
  }
  console.log(`[IDEMPOTENCY] Webhook j\xE1 processado: ${key} em ${existing.processedAt.toISOString()}`);
  return true;
}
function markWebhookAsProcessed(key, payload, event, email, result) {
  const transactionId = payload.data?.purchase?.transaction || payload.data?.subscription?.subscriber || "unknown";
  processedWebhooks.set(key, {
    transactionId,
    eventType: event,
    email,
    processedAt: /* @__PURE__ */ new Date(),
    result
  });
  if (processedWebhooks.size > 1e3) {
    const oldestKeys = Array.from(processedWebhooks.keys()).slice(0, 100);
    oldestKeys.forEach((key2) => processedWebhooks.delete(key2));
  }
}
async function processHotmartWebhook(payload) {
  try {
    if (!payload) {
      console.error("Hotmart webhook: payload inv\xE1lido ou vazio");
      return { success: false, message: "Payload inv\xE1lido ou vazio" };
    }
    let rawEvent = payload.event || "unknown_event";
    const normalizedEvent = EVENT_MAP[rawEvent] || EVENT_MAP[rawEvent.toUpperCase()] || EVENT_MAP[rawEvent.toLowerCase()];
    const event = normalizedEvent || String(rawEvent);
    console.log(`Hotmart: Evento recebido: ${rawEvent} (normalizado: ${event})`);
    const supportedEvents = [
      "purchase.approved",
      "purchase.refunded",
      "purchase.chargeback",
      "purchase.canceled",
      "subscription.canceled"
    ];
    if (!supportedEvents.includes(event)) {
      console.log(`Hotmart: Evento n\xE3o suportado: ${event}`);
      return { success: false, message: `Evento n\xE3o suportado: ${event}` };
    }
    const data = payload.data || {};
    let email = payload.email || payload.buyer?.email || data?.email || data?.buyer?.email || data?.buyer_email || data?.contact?.email || payload?.purchase?.buyer?.email;
    if (!email) {
      console.log("Hotmart: Email n\xE3o encontrado nas propriedades conhecidas, iniciando busca recursiva...");
      const foundEmail = findEmailInPayload(payload);
      if (foundEmail) {
        email = String(foundEmail);
      }
    }
    if (!email) {
      console.error("Hotmart webhook: email n\xE3o encontrado no payload", JSON.stringify(payload));
      return { success: false, message: "Email ausente no payload" };
    }
    console.log(`Hotmart: Processando evento ${event} para email: ${email}`);
    const webhookKey = generateWebhookKey(payload, event, email);
    if (isWebhookAlreadyProcessed(webhookKey, payload)) {
      console.log(`[IDEMPOTENCY] Webhook duplicado ignorado: ${webhookKey}`);
      return {
        success: true,
        message: "Webhook j\xE1 processado anteriormente (idempot\xEAncia)"
      };
    }
    let user = await storage.getUserByEmail(email);
    const offer = await determineOffer(payload);
    const planType = offer ? offer.planType : null;
    const billingPeriod = offer ? offer.billingPeriod : "monthly";
    const isCancellationEvent = [
      "purchase.refunded",
      "purchase.chargeback",
      "purchase.canceled",
      "subscription.canceled"
    ].includes(event);
    if (!planType && !isCancellationEvent) {
      console.log(`Hotmart: Nenhum plano v\xE1lido encontrado para o email ${email}, webhook ignorado`);
      return { success: false, message: "Nenhuma oferta v\xE1lida encontrada" };
    }
    const subscriptionDays = billingPeriod === "yearly" ? 365 : 30;
    const subscriptionEndDate = new Date(Date.now() + subscriptionDays * 24 * 60 * 60 * 1e3);
    console.log(`Hotmart: Calculando assinatura: ${billingPeriod} = ${subscriptionDays} dias (vence em ${subscriptionEndDate.toISOString()})`);
    switch (event) {
      case "purchase.approved":
        if (user) {
          console.log(`Hotmart: Ativando plano ${planType} (${billingPeriod}) para usu\xE1rio existente: ${email}`);
          if (user.pendingDowngradeDate) {
            console.log(`[DOWNGRADE] Cancelando downgrade pendente para usu\xE1rio ${email} - pagamento regularizado`);
            await storage.cancelPendingDowngrade(user.id);
          }
          if (planType) {
            await storage.updateUserSubscription(user.id, planType);
            await storage.updateUser(user.id, {
              subscriptionEndDate
            });
          } else {
            console.error(`Hotmart: Tipo de plano inv\xE1lido para usu\xE1rio existente: ${email}`);
          }
          await storage.updateUser(user.id, {
            status: "active",
            subscriptionStatus: "active",
            billingPeriod,
            // Salvar período de cobrança (monthly/yearly)
            // Salvar ID da transação no campo subscription_id para referência
            subscription_id: data?.purchase?.transaction || `hotmart_${Date.now()}`
          });
        } else {
          console.log(`Hotmart: Criando novo usu\xE1rio com plano ${planType} (${billingPeriod}): ${email}`);
          const tempPassword = generateRandomPassword(8);
          const hashedPassword = await hashPassword(tempPassword);
          const customerName = findCustomerName(payload);
          const customerPhone = findCustomerPhone(payload);
          const validPlanType = planType || "free";
          const userData = {
            name: customerName || data?.buyer?.name || email.split("@")[0] || "Usu\xE1rio Fottufy",
            email,
            password: hashedPassword,
            role: "photographer",
            status: "active",
            phone: customerPhone || data?.buyer?.phone || "",
            planType: validPlanType,
            // Usar o planType validado
            subscriptionStatus: "active",
            billingPeriod
            // Salvar período de cobrança (monthly/yearly)
          };
          user = await storage.createUser(userData);
          if (planType) {
            await storage.updateUserSubscription(user.id, planType);
            await storage.updateUser(user.id, {
              subscriptionEndDate
            });
          } else {
            console.error(`Hotmart: Tipo de plano inv\xE1lido para novo usu\xE1rio: ${email}`);
          }
          await storage.updateUser(user.id, {
            subscription_id: data?.purchase?.transaction || `hotmart_${Date.now()}`
          });
          try {
            const result = await sendWelcomeEmail2(userData.email, userData.name, tempPassword);
            if (result.success) {
              console.log(`Hotmart: Email com dados de acesso enviado para: ${email}`);
            } else {
              console.error(`Hotmart: Falha ao enviar email com dados de acesso: ${email}`);
            }
          } catch (emailError) {
            console.error("Erro ao enviar email com dados de acesso:", emailError);
          }
        }
        try {
          const pendingReferral = await storage.getPendingReferralByReferredId(user.id);
          if (pendingReferral && pendingReferral.status === "pending") {
            console.log(`Hotmart Referral: indicador ID=${pendingReferral.referrerId}, indicado ID=${user.id}`);
            const updatedReferral = await storage.markReferralAsConverted(pendingReferral.id);
            if (updatedReferral) {
              const referrer = await storage.getUser(pendingReferral.referrerId);
              if (referrer) {
                const currentBonus = referrer.bonusPhotos || 0;
                await storage.updateUser(referrer.id, {
                  bonusPhotos: currentBonus + 1e3,
                  isAmbassador: true
                });
                console.log(`Hotmart Referral: Indicador ID=${referrer.id} recebeu +1000 fotos (total b\xF4nus: ${currentBonus + 1e3}) e selo de embaixador`);
                await storage.markReferralDiscountApplied(pendingReferral.id);
              }
            }
          }
        } catch (referralError) {
          console.error("Hotmart: Erro ao processar referral (n\xE3o cr\xEDtico):", referralError.message);
        }
        markWebhookAsProcessed(webhookKey, payload, event, email, "PLANO_ATIVADO");
        const userFinal = await storage.getUser(user.id);
        const analysis = userFinal ? analyzeSubscriptionStatus(userFinal) : void 0;
        return {
          success: true,
          message: "Plano ativado com sucesso",
          analysis
        };
      case "purchase.refunded":
      case "purchase.chargeback":
      case "purchase.canceled":
      case "subscription.canceled":
        if (user) {
          const safetyCheck = isSafeToDowngrade(user, event);
          if (!safetyCheck.safe) {
            console.log(`[SEGURAN\xC7A] Downgrade cancelado para ${email}: ${safetyCheck.reason}`);
            markWebhookAsProcessed(webhookKey, payload, event, email, "DOWNGRADE_CANCELADO_SEGURANCA");
            return {
              success: true,
              message: `Downgrade cancelado por seguran\xE7a: ${safetyCheck.reason}`
            };
          }
          console.log(`[SEGURAN\xC7A] Downgrade aprovado para ${email}: ${safetyCheck.reason}`);
          const criticalPaymentFailure = event === "purchase.refunded" || event === "purchase.chargeback";
          if (criticalPaymentFailure) {
            console.log(`[DOWNGRADE CR\xCDTICO] Processando downgrade imediato para usu\xE1rio: ${email} (evento cr\xEDtico: ${event})`);
            const currentPlan = user.planType || "free";
            await storage.updateUserSubscription(user.id, "free");
            await storage.updateUser(user.id, {
              subscriptionStatus: "payment_failed",
              // Status específico para falha de pagamento
              originalPlanBeforeDowngrade: currentPlan,
              // Salvar plano original para possível restauração
              lastEvent: {
                type: `immediate_downgrade_${event}`,
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              }
            });
            console.log(`[DOWNGRADE CR\xCDTICO] Usu\xE1rio ${email} convertido para plano gratuito imediatamente. Plano anterior: ${currentPlan}`);
            markWebhookAsProcessed(webhookKey, payload, event, email, "DOWNGRADE_IMEDIATO");
            const userUpdated = await storage.getUser(user.id);
            const analysis2 = userUpdated ? analyzeSubscriptionStatus(userUpdated) : void 0;
            return {
              success: true,
              message: `Downgrade imediato realizado - falha cr\xEDtica de pagamento detectada (${event})`,
              analysis: analysis2
            };
          } else {
            console.log(`[DOWNGRADE] Agendando downgrade com toler\xE2ncia de 3 dias para usu\xE1rio: ${email} (evento: ${event})`);
            const currentPlan = user.planType || "free";
            if (currentPlan !== "free") {
              await storage.schedulePendingDowngrade(user.id, event, currentPlan);
              await storage.updateUser(user.id, {
                subscriptionStatus: "pending_cancellation",
                // Status especial para período de tolerância
                lastEvent: {
                  type: event,
                  timestamp: (/* @__PURE__ */ new Date()).toISOString()
                }
              });
              console.log(`[DOWNGRADE] Usu\xE1rio ${email} tem 3 dias para regularizar o pagamento antes do downgrade autom\xE1tico`);
              markWebhookAsProcessed(webhookKey, payload, event, email, "DOWNGRADE_AGENDADO");
              const userUpdated = await storage.getUser(user.id);
              const analysis2 = userUpdated ? analyzeSubscriptionStatus(userUpdated) : void 0;
              return {
                success: true,
                message: "Downgrade agendado para 3 dias - per\xEDodo de toler\xE2ncia ativado",
                analysis: analysis2
              };
            } else {
              console.log(`[DOWNGRADE] Usu\xE1rio ${email} j\xE1 possui plano gratuito, nenhuma a\xE7\xE3o necess\xE1ria`);
              markWebhookAsProcessed(webhookKey, payload, event, email, "JA_PLANO_GRATUITO");
              return {
                success: true,
                message: "Usu\xE1rio j\xE1 possui plano gratuito"
              };
            }
          }
        } else {
          console.log(`Hotmart: Usu\xE1rio n\xE3o encontrado para o email ${email}, nada a fazer`);
          markWebhookAsProcessed(webhookKey, payload, event, email, "USUARIO_NAO_ENCONTRADO");
          return { success: false, message: "Usu\xE1rio n\xE3o encontrado" };
        }
      default:
        console.log(`Hotmart: Evento n\xE3o processado: ${event}`);
        markWebhookAsProcessed(webhookKey, payload, event, email, "EVENTO_NAO_SUPORTADO");
        return { success: false, message: `Evento n\xE3o suportado: ${event}` };
    }
  } catch (error) {
    console.error("Erro ao processar webhook da Hotmart:", error);
    const errorMessage = error.message || "Erro desconhecido";
    try {
      if (payload && payload.event) {
        let email = "";
        if (payload.email) email = payload.email;
        else if (payload.data?.email) email = payload.data.email;
        else if (payload.buyer?.email) email = payload.buyer.email;
        if (email) {
          const event = payload.event;
          const webhookKey = generateWebhookKey(payload, event, email);
          markWebhookAsProcessed(webhookKey, payload, event, email, `ERRO: ${errorMessage}`);
        }
      }
    } catch (markingError) {
      console.error("Erro ao marcar webhook como processado ap\xF3s falha:", markingError);
    }
    return { success: false, message: `Erro interno: ${errorMessage}` };
  }
}
var HOTMART_OFFER_TO_PLAN_MAP, EVENT_MAP, processedWebhooks;
var init_hotmart = __esm({
  "server/integrations/hotmart.ts"() {
    "use strict";
    init_storage();
    init_auth();
    init_welcomeEmail();
    HOTMART_OFFER_TO_PLAN_MAP = {
      "ro76q5uz": { planType: "basic_v2", billingPeriod: "monthly" },
      "z0pxaesy": { planType: "basic_v2", billingPeriod: "monthly" },
      "ze3jhsob": { planType: "basic_v2", billingPeriod: "monthly" },
      "6fm4k0j3": { planType: "basic_v2", billingPeriod: "monthly" },
      "z0fgxfr5": { planType: "basic_v2", billingPeriod: "monthly" },
      "c1ogilsp": { planType: "basic_v2", billingPeriod: "monthly" },
      "tpfhcllk": { planType: "standard_v2", billingPeriod: "monthly" },
      "hjb8gqn7": { planType: "standard_v2", billingPeriod: "monthly" },
      "2rkaudbb": { planType: "standard_v2", billingPeriod: "monthly" },
      "suf6vkf6": { planType: "professional_v2", billingPeriod: "monthly" },
      "xtuh4ji0": { planType: "professional_v2", billingPeriod: "monthly" },
      "z61olrnh": { planType: "professional_v2", billingPeriod: "monthly" }
    };
    EVENT_MAP = {
      // Compra aprovada - variações
      "PURCHASE_APPROVED": "purchase.approved",
      "PURCHASE.APPROVED": "purchase.approved",
      "purchase.approved": "purchase.approved",
      "APPROVED": "purchase.approved",
      "PURCHASE_COMPLETE": "purchase.approved",
      "PURCHASE.COMPLETE": "purchase.approved",
      "purchase.complete": "purchase.approved",
      "PURCHASE_CONFIRMED": "purchase.approved",
      "PURCHASE.CONFIRMED": "purchase.approved",
      "purchase.confirmed": "purchase.approved",
      "SALE": "purchase.approved",
      "SALE_COMPLETE": "purchase.approved",
      "ORDER_COMPLETED": "purchase.approved",
      // Reembolso - variações
      "PURCHASE_REFUNDED": "purchase.refunded",
      "PURCHASE.REFUNDED": "purchase.refunded",
      "purchase.refunded": "purchase.refunded",
      "REFUNDED": "purchase.refunded",
      "REFUND": "purchase.refunded",
      "REFUND_COMPLETE": "purchase.refunded",
      "REFUND.COMPLETE": "purchase.refunded",
      "PURCHASE_REFUND": "purchase.refunded",
      "PURCHASE.REFUND": "purchase.refunded",
      "REEMBOLSO": "purchase.refunded",
      "REEMBOLSO_COMPLETO": "purchase.refunded",
      // Cancelamento - variações 
      "PURCHASE_CANCELED": "purchase.canceled",
      "PURCHASE.CANCELED": "purchase.canceled",
      "purchase.canceled": "purchase.canceled",
      "CANCELED": "purchase.canceled",
      "CANCEL": "purchase.canceled",
      "CANCELAMENTO": "purchase.canceled",
      "ORDER_CANCELED": "purchase.canceled",
      "PURCHASE_CANCELLED": "purchase.canceled",
      // Variação com escrita britânica
      "PURCHASE.CANCELLED": "purchase.canceled",
      "purchase.cancelled": "purchase.canceled",
      "CANCELLED": "purchase.canceled",
      // Atraso no pagamento
      "PURCHASE_DELAYED": "purchase.delayed",
      "PURCHASE.DELAYED": "purchase.delayed",
      "purchase.delayed": "purchase.delayed",
      "DELAYED": "purchase.delayed",
      "PAYMENT_DELAYED": "purchase.delayed",
      "PAYMENT.DELAYED": "purchase.delayed",
      "payment.delayed": "purchase.delayed",
      "ATRASO": "purchase.delayed",
      "PAGAMENTO_ATRASADO": "purchase.delayed",
      // Disputa/Chargeback
      "PURCHASE_PROTEST": "purchase.chargeback",
      "PURCHASE.PROTEST": "purchase.chargeback",
      "purchase.protest": "purchase.chargeback",
      "PROTEST": "purchase.chargeback",
      "CHARGEBACK_INITIATED": "purchase.chargeback",
      "CHARGEBACK.INITIATED": "purchase.chargeback",
      "PURCHASE_CHARGEBACK": "purchase.chargeback",
      "PURCHASE.CHARGEBACK": "purchase.chargeback",
      "purchase.chargeback": "purchase.chargeback",
      "CHARGEBACK": "purchase.chargeback",
      "DISPUTA": "purchase.chargeback",
      "DISPUTA_INICIADA": "purchase.chargeback",
      "CONTESTACAO": "purchase.chargeback",
      // Cancelamento de assinatura
      "SUBSCRIPTION_CANCELLATION": "subscription.canceled",
      "SUBSCRIPTION.CANCELLATION": "subscription.canceled",
      "subscription.cancellation": "subscription.canceled",
      "SUBSCRIPTION_CANCELED": "subscription.canceled",
      "SUBSCRIPTION.CANCELED": "subscription.canceled",
      "subscription.canceled": "subscription.canceled",
      "SUBSCRIPTION_CANCELLED": "subscription.canceled",
      // Variação com escrita britânica
      "SUBSCRIPTION.CANCELLED": "subscription.canceled",
      "subscription.cancelled": "subscription.canceled",
      "CANCEL_SUBSCRIPTION": "subscription.canceled",
      "CANCEL.SUBSCRIPTION": "subscription.canceled",
      "cancel.subscription": "subscription.canceled",
      "ASSINATURA_CANCELADA": "subscription.canceled",
      "CANCELAMENTO_ASSINATURA": "subscription.canceled"
    };
    processedWebhooks = /* @__PURE__ */ new Map();
  }
});

// server/storage.ts
import { nanoid } from "nanoid";
import { eq as eq2, and, desc, asc, count, inArray, sql, lt, ne, isNull, or, not } from "drizzle-orm";
import session2 from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
var MemoryStore, PostgresSessionStore, DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_hotmart();
    init_db();
    init_db();
    MemoryStore = createMemoryStore(session2);
    PostgresSessionStore = connectPg(session2);
    DatabaseStorage = class {
      sessionStore;
      constructor() {
        this.sessionStore = new PostgresSessionStore({
          pool,
          // Usar o pool já configurado com SSL
          createTableIfMissing: true,
          tableName: "session",
          schemaName: "public",
          ttl: 7 * 24 * 60 * 60 * 1e3
          // 7 dias em milissegundos (604800000 ms)
        });
        this.initializeAdminUser();
      }
      async initializeAdminUser() {
        try {
          const adminUser = await this.getUserByEmail("admin@studio.com");
          if (!adminUser) {
            console.log("Criando usu\xE1rio admin padr\xE3o...");
            const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
            await this.createUser({
              name: "Admin",
              email: "admin@studio.com",
              password: await hashPassword2(process.env.ADMIN_DEFAULT_PASSWORD || "change-me-on-first-login"),
              role: "admin",
              status: "active",
              planType: "professional"
            });
            console.log("Usu\xE1rio admin criado com sucesso!");
          } else {
            console.log("Usu\xE1rio admin j\xE1 existe.");
          }
        } catch (error) {
          console.error("Erro ao inicializar usu\xE1rio admin:", error);
        }
      }
      // User methods
      async getUser(id) {
        try {
          const [user] = await db.select().from(users).where(eq2(users.id, id));
          return user;
        } catch (error) {
          console.error("Erro ao buscar usu\xE1rio por ID:", error);
          return void 0;
        }
      }
      async getUserByEmail(email) {
        try {
          const normalizedEmail = email.toLowerCase();
          console.log(`Buscando usu\xE1rio com email (normalizado): ${normalizedEmail}`);
          const [user] = await db.select().from(users).where(sql`LOWER(${users.email}) = ${normalizedEmail}`);
          console.log(`Usu\xE1rio encontrado:`, user ? { id: user.id, email: user.email, role: user.role } : "nenhum");
          return user;
        } catch (error) {
          console.error("Erro ao buscar usu\xE1rio por email:", error);
          return void 0;
        }
      }
      async getUserBySubscriptionId(subscriptionId) {
        try {
          const [user] = await db.select().from(users).where(
            eq2(users.stripeSubscriptionId, subscriptionId)
          );
          if (!user) {
            const [legacyUser] = await db.select().from(users).where(
              eq2(users.subscription_id, subscriptionId)
            );
            return legacyUser;
          }
          return user;
        } catch (error) {
          console.error("Erro ao buscar usu\xE1rio por subscription ID:", error);
          return void 0;
        }
      }
      async getUserByStripeCustomerId(customerId) {
        try {
          const [user] = await db.select().from(users).where(eq2(users.stripeCustomerId, customerId));
          return user;
        } catch (error) {
          console.error("Erro ao buscar usu\xE1rio por customer ID:", error);
          return void 0;
        }
      }
      async getUsers() {
        try {
          return await db.select().from(users).orderBy(desc(users.createdAt));
        } catch (error) {
          console.error("Erro ao buscar todos os usu\xE1rios:", error);
          return [];
        }
      }
      async createUser(userData) {
        try {
          const userToCreate = {
            ...userData,
            role: userData.role || "photographer",
            status: userData.status || "active",
            planType: userData.planType || "free",
            usedUploads: 0,
            lastEvent: null
          };
          if (userToCreate.planType === "free") {
            userToCreate.uploadLimit = SUBSCRIPTION_PLANS.FREE.uploadLimit;
          }
          const [createdUser] = await db.insert(users).values(userToCreate).returning();
          return createdUser;
        } catch (error) {
          console.error("Erro ao criar usu\xE1rio:", error);
          throw error;
        }
      }
      async updateUser(id, userData) {
        const sanitized = { ...userData };
        const dateFields = ["subscriptionStartDate", "subscriptionEndDate"];
        for (const field of dateFields) {
          if (sanitized[field] !== void 0 && sanitized[field] !== null) {
            const d = sanitized[field] instanceof Date ? sanitized[field] : new Date(sanitized[field]);
            if (isNaN(d.getTime())) {
              console.warn(`[updateUser] Campo '${field}' tem data inv\xE1lida (${sanitized[field]}) \u2014 removendo do update`);
              delete sanitized[field];
            } else {
              sanitized[field] = d;
            }
          }
        }
        const [updatedUser] = await db.update(users).set(sanitized).where(eq2(users.id, id)).returning();
        return updatedUser;
      }
      async deleteUser(id) {
        try {
          const result = await db.delete(users).where(eq2(users.id, id));
          return true;
        } catch (error) {
          console.error("Erro ao excluir usu\xE1rio:", error);
          return false;
        }
      }
      // Métodos de gerenciamento de assinatura
      async updateUserSubscription(userId, planType) {
        try {
          const planKey = planType.toUpperCase();
          let plan = SUBSCRIPTION_PLANS[planKey];
          if (!plan) {
            if (planType.includes("_v2")) {
              const upperPlanType = planType.toUpperCase();
              plan = SUBSCRIPTION_PLANS[upperPlanType];
            } else {
              switch (planType) {
                case "basic":
                  plan = SUBSCRIPTION_PLANS.BASIC;
                  break;
                case "standard":
                  plan = SUBSCRIPTION_PLANS.STANDARD;
                  break;
                case "professional":
                  plan = SUBSCRIPTION_PLANS.PROFESSIONAL;
                  break;
                default:
                  plan = SUBSCRIPTION_PLANS.FREE;
              }
            }
          }
          console.log(`Atualizando assinatura: userId=${userId}, planType=${planType}, uploadLimit=${plan.uploadLimit}`);
          const now = /* @__PURE__ */ new Date();
          const endDate = /* @__PURE__ */ new Date();
          endDate.setMonth(endDate.getMonth() + 1);
          const [updatedUser] = await db.update(users).set({
            planType,
            uploadLimit: plan.uploadLimit,
            subscriptionStartDate: now,
            subscriptionEndDate: endDate,
            subscriptionStatus: "active",
            status: "active"
            // Garantir que o usuário esteja ativo
          }).where(eq2(users.id, userId)).returning();
          return updatedUser;
        } catch (error) {
          console.error("Erro ao atualizar assinatura do usu\xE1rio:", error);
          return void 0;
        }
      }
      async updateStripeInfo(userId, customerId, subscriptionId) {
        try {
          const [updatedUser] = await db.update(users).set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId
          }).where(eq2(users.id, userId)).returning();
          return updatedUser;
        } catch (error) {
          console.error("Erro ao atualizar informa\xE7\xF5es do Stripe:", error);
          return void 0;
        }
      }
      async handleStripeWebhook(payload) {
        try {
          let user = await this.getUserByStripeCustomerId(payload.data.customer.id);
          if (!user) {
            const email = payload.data.customer.email;
            if (email) {
              user = await this.getUserByEmail(email);
            }
          }
          if (!user) return void 0;
          let subscriptionStatus = user.subscriptionStatus;
          let userStatus = user.status;
          let planType = user.planType;
          let uploadLimit = user.uploadLimit;
          console.log(`Processando webhook Stripe: evento=${payload.type}, usu\xE1rio=${user.id}, customer=${payload.data.customer.id}`);
          let billingPeriod = user.billingPeriod || "monthly";
          const subscriptionItems = payload.data.subscription?.items?.data || [];
          if (subscriptionItems.length > 0) {
            const interval = subscriptionItems[0]?.price?.recurring?.interval;
            if (interval === "year") {
              billingPeriod = "yearly";
            } else if (interval === "month") {
              billingPeriod = "monthly";
            }
          }
          switch (payload.type) {
            case "subscription.created":
            case "subscription.updated":
              if (payload.data.subscription.status === "active") {
                subscriptionStatus = "active";
                userStatus = "active";
                const metadata = payload.data.subscription.metadata || {};
                if (metadata.planType) {
                  planType = metadata.planType;
                  const planKey = planType.toUpperCase();
                  let plan = SUBSCRIPTION_PLANS[planKey];
                  if (!plan && planType.includes("_v2")) {
                    const upperPlanType = planType.toUpperCase();
                    plan = SUBSCRIPTION_PLANS[upperPlanType];
                  }
                  if (plan) {
                    uploadLimit = plan.uploadLimit;
                    console.log(`Atualizando plano via webhook: planType=${planType}, uploadLimit=${uploadLimit}, billingPeriod=${billingPeriod}`);
                  }
                }
              } else if (payload.data.subscription.status === "canceled") {
                subscriptionStatus = "inactive";
              }
              break;
            case "subscription.cancelled":
              subscriptionStatus = "inactive";
              break;
          }
          let subscriptionEndDate = user.subscriptionEndDate;
          if (payload.data.subscription.current_period_end) {
            subscriptionEndDate = new Date(payload.data.subscription.current_period_end * 1e3);
          }
          const [updatedUser] = await db.update(users).set({
            planType,
            uploadLimit,
            subscriptionStatus,
            status: userStatus,
            subscriptionEndDate,
            billingPeriod,
            // Salvar período de cobrança (monthly/yearly)
            stripeSubscriptionId: payload.data.subscription.id,
            lastEvent: {
              type: payload.type,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            }
          }).where(eq2(users.id, user.id)).returning();
          return updatedUser;
        } catch (error) {
          console.error("Erro ao processar webhook do Stripe:", error);
          return void 0;
        }
      }
      // Métodos de gerenciamento de uploads
      async checkUploadLimit(userId, newCount) {
        try {
          const [user] = await db.select().from(users).where(eq2(users.id, userId));
          if (!user) return false;
          if (user.subscriptionStatus !== "active" && user.planType !== "free") {
            return false;
          }
          if (user.uploadLimit !== null && user.uploadLimit < 0) {
            return true;
          }
          const uploadLimit = (user.uploadLimit || 0) + (user.bonusPhotos || 0);
          const [v1Row] = await db.select({ total: sql`COALESCE(SUM(jsonb_array_length(photos)), 0)` }).from(projects).where(and(
            eq2(projects.photographerId, userId),
            sql`${projects.status} != 'arquivado'`
          ));
          const [v2Row] = await db.select({ total: sql`COUNT(*)` }).from(photos).innerJoin(newProjects, sql`${newProjects.id}::text = ${photos.projectId}`).where(eq2(newProjects.userId, userId));
          const realUsed = Number(v1Row?.total ?? 0) + Number(v2Row?.total ?? 0);
          const available = uploadLimit - realUsed;
          console.log(`[LIMIT CHECK] user=${userId} limit=${uploadLimit} realUsed=${realUsed} (v1=${Number(v1Row?.total ?? 0)} v2=${Number(v2Row?.total ?? 0)}) requesting=${newCount} \u2192 ${available >= newCount ? "ALLOWED" : "BLOCKED"}`);
          return available >= newCount;
        } catch (error) {
          console.error("Erro ao verificar limite de uploads:", error);
          return false;
        }
      }
      async updateUploadUsage(userId, addCount) {
        try {
          const [user] = await db.select().from(users).where(eq2(users.id, userId));
          if (!user) return void 0;
          const currentUsed = user.usedUploads || 0;
          let newUsedUploads = currentUsed + addCount;
          if (newUsedUploads < 0) {
            newUsedUploads = 0;
          }
          console.log(`Upload usage updated for user ${userId}: ${currentUsed} \u2192 ${newUsedUploads} (added ${addCount})`);
          const [updatedUser] = await db.update(users).set({ usedUploads: newUsedUploads }).where(eq2(users.id, userId)).returning();
          return updatedUser;
        } catch (error) {
          console.error("Erro ao atualizar uso de uploads:", error);
          return void 0;
        }
      }
      async syncUsedUploads(userId) {
        try {
          const [user] = await db.select().from(users).where(eq2(users.id, userId));
          if (!user) return void 0;
          const userProjects = await this.getProjects(userId);
          const projectIds = userProjects.map((p) => p.id.toString());
          if (projectIds.length === 0) {
            const [updatedUser2] = await db.update(users).set({ usedUploads: 0 }).where(eq2(users.id, userId)).returning();
            return updatedUser2;
          }
          const photoCountQuery = await db.select({ count: count() }).from(photos).where(inArray(photos.projectId, projectIds));
          const totalPhotoCount = photoCountQuery[0]?.count || 0;
          console.log(`Syncing usedUploads for user ${userId}: calculated ${totalPhotoCount} total photos`);
          const [updatedUser] = await db.update(users).set({ usedUploads: totalPhotoCount }).where(eq2(users.id, userId)).returning();
          return updatedUser;
        } catch (error) {
          console.error("Erro ao sincronizar contagem de uploads:", error);
          return void 0;
        }
      }
      // Enhanced access control methods
      async checkAdvancedAccessControl(userId, uploadCount = 0) {
        try {
          const result = await checkAdvancedUploadLimit(userId, uploadCount);
          return {
            allowed: result.allowed,
            reason: result.reason,
            analysis: result.analysis,
            uploadInfo: result.uploadInfo
          };
        } catch (error) {
          console.error("Erro na verifica\xE7\xE3o avan\xE7ada de acesso:", error);
          return {
            allowed: false,
            reason: "Erro interno na verifica\xE7\xE3o de acesso",
            analysis: {
              isActive: false,
              isExpired: true,
              isPendingCancellation: false,
              daysUntilExpiry: null,
              statusReason: "Erro na verifica\xE7\xE3o",
              recommendations: ["Tente novamente ou contate o suporte"]
            }
          };
        }
      }
      async verifyUserSubscriptionStatus(userId) {
        try {
          const user = await this.getUser(userId);
          if (!user) {
            throw new Error("Usu\xE1rio n\xE3o encontrado");
          }
          const analysis = analyzeSubscriptionStatus(user);
          const accessInfo = canUserUpload(user);
          return {
            isActive: accessInfo.allowed,
            analysis,
            recommendations: analysis.recommendations
          };
        } catch (error) {
          console.error("Erro na verifica\xE7\xE3o de status de assinatura:", error);
          return {
            isActive: false,
            analysis: {
              isActive: false,
              isExpired: true,
              isPendingCancellation: false,
              daysUntilExpiry: null,
              statusReason: "Erro na verifica\xE7\xE3o de status",
              recommendations: ["Verificar conectividade", "Contatar suporte"]
            },
            recommendations: ["Tente novamente", "Contate o suporte"]
          };
        }
      }
      // ==================== HOTMART OFFERS MANAGEMENT ====================
      /**
       * Busca todas as ofertas da Hotmart (ativas e inativas)
       */
      async getAllHotmartOffers() {
        try {
          const offers = await db.select().from(hotmartOffers).orderBy(desc(hotmartOffers.createdAt));
          return offers;
        } catch (error) {
          console.error("Erro ao buscar ofertas da Hotmart:", error);
          return [];
        }
      }
      /**
       * Busca apenas ofertas ativas da Hotmart
       */
      async getActiveHotmartOffers() {
        try {
          const offers = await db.select().from(hotmartOffers).where(eq2(hotmartOffers.isActive, true)).orderBy(desc(hotmartOffers.createdAt));
          return offers;
        } catch (error) {
          console.error("Erro ao buscar ofertas ativas da Hotmart:", error);
          return [];
        }
      }
      /**
       * Busca uma oferta específica pelo código
       */
      async getHotmartOfferByCode(offerCode) {
        try {
          const [offer] = await db.select().from(hotmartOffers).where(sql`LOWER(${hotmartOffers.offerCode}) = LOWER(${offerCode})`).limit(1);
          return offer;
        } catch (error) {
          console.error("Erro ao buscar oferta por c\xF3digo:", error);
          return void 0;
        }
      }
      /**
       * Cria uma nova oferta da Hotmart
       */
      async createHotmartOffer(offer) {
        try {
          const [newOffer] = await db.insert(hotmartOffers).values({
            ...offer,
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          console.log(`[HOTMART] Nova oferta criada: ${newOffer.offerCode} -> ${newOffer.planType}`);
          return newOffer;
        } catch (error) {
          console.error("Erro ao criar oferta da Hotmart:", error);
          throw error;
        }
      }
      /**
       * Atualiza uma oferta existente
       */
      async updateHotmartOffer(id, data) {
        try {
          const [updatedOffer] = await db.update(hotmartOffers).set({
            ...data,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(hotmartOffers.id, id)).returning();
          console.log(`[HOTMART] Oferta atualizada: ID=${id}`);
          return updatedOffer;
        } catch (error) {
          console.error("Erro ao atualizar oferta da Hotmart:", error);
          return void 0;
        }
      }
      /**
       * Deleta uma oferta (soft delete - apenas desativa)
       */
      async deleteHotmartOffer(id) {
        try {
          await db.update(hotmartOffers).set({
            isActive: false,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(hotmartOffers.id, id));
          console.log(`[HOTMART] Oferta desativada: ID=${id}`);
          return true;
        } catch (error) {
          console.error("Erro ao deletar oferta da Hotmart:", error);
          return false;
        }
      }
      /**
       * Deleta permanentemente uma oferta do banco de dados (hard delete)
       */
      async hardDeleteHotmartOffer(id) {
        try {
          await db.delete(hotmartOffers).where(eq2(hotmartOffers.id, id));
          console.log(`[HOTMART] Oferta exclu\xEDda permanentemente: ID=${id}`);
          return true;
        } catch (error) {
          console.error("Erro ao excluir permanentemente oferta da Hotmart:", error);
          return false;
        }
      }
      // ==================== SITE SETTINGS METHODS ====================
      /**
       * Obtém uma configuração do site pela chave
       */
      async getSiteSetting(key) {
        try {
          const [setting] = await db.select().from(siteSettings).where(eq2(siteSettings.key, key));
          return setting;
        } catch (error) {
          console.error(`[SITE_SETTINGS] Erro ao obter configura\xE7\xE3o ${key}:`, error);
          return void 0;
        }
      }
      /**
       * Cria ou atualiza uma configuração do site
       */
      async upsertSiteSetting(key, value, isActive, updatedBy) {
        try {
          const existing = await this.getSiteSetting(key);
          if (existing) {
            const [updated] = await db.update(siteSettings).set({
              value,
              isActive,
              updatedBy: updatedBy || null,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq2(siteSettings.key, key)).returning();
            console.log(`[SITE_SETTINGS] Configura\xE7\xE3o ${key} atualizada`);
            return updated;
          } else {
            const [created] = await db.insert(siteSettings).values({
              key,
              value,
              isActive,
              updatedBy: updatedBy || null
            }).returning();
            console.log(`[SITE_SETTINGS] Configura\xE7\xE3o ${key} criada`);
            return created;
          }
        } catch (error) {
          console.error(`[SITE_SETTINGS] Erro ao salvar configura\xE7\xE3o ${key}:`, error);
          throw error;
        }
      }
      async handleWebhookEvent(payload) {
        try {
          let user = await this.getUserByEmail(payload.email);
          if (!user && payload.subscription_id) {
            user = await this.getUserBySubscriptionId(payload.subscription_id);
          }
          if (!user) return void 0;
          let status = user.status;
          switch (payload.type) {
            case "payment.approved":
              status = "active";
              break;
            case "payment.failed":
              status = "suspended";
              break;
            case "subscription.canceled":
              status = "canceled";
              break;
          }
          const [updatedUser] = await db.update(users).set({
            status,
            subscription_id: payload.subscription_id || user.subscription_id,
            lastEvent: {
              type: payload.type,
              timestamp: payload.timestamp
            }
          }).where(eq2(users.id, user.id)).returning();
          return updatedUser;
        } catch (error) {
          console.error("Erro ao processar evento de webhook:", error);
          return void 0;
        }
      }
      // Project methods
      async getProject(id) {
        try {
          console.log(`DatabaseStorage: Buscando projeto ID=${id}`);
          if (typeof id === "number") {
            const [project2] = await db.select().from(projects).where(eq2(projects.id, id));
            if (project2) {
              console.log(`DatabaseStorage: Projeto encontrado com ID num\xE9rico: ${project2.name}`);
              return project2;
            }
          }
          const numericId = parseInt(id.toString());
          if (!isNaN(numericId)) {
            const [project2] = await db.select().from(projects).where(eq2(projects.id, numericId));
            if (project2) {
              console.log(`DatabaseStorage: Projeto encontrado com ID string (convertido): ${project2.name}`);
              return project2;
            }
          }
          const [project] = await db.select().from(projects).where(eq2(projects.publicId, id.toString()));
          if (project) {
            console.log(`DatabaseStorage: Projeto encontrado via publicId: ${project.name}`);
          } else {
            console.log(`DatabaseStorage: Projeto ID=${id} n\xE3o encontrado`);
          }
          return project;
        } catch (error) {
          console.error("Erro ao buscar projeto:", error);
          return void 0;
        }
      }
      async getProjects(photographerId) {
        try {
          if (photographerId) {
            return await db.select().from(projects).where(eq2(projects.photographerId, photographerId)).orderBy(desc(projects.createdAt));
          }
          return await db.select().from(projects).orderBy(desc(projects.createdAt));
        } catch (error) {
          console.error("Erro ao buscar projetos:", error);
          return [];
        }
      }
      async createProject(projectData, photos2) {
        try {
          const processedPhotos = photos2.map((photo) => ({
            ...photo,
            id: nanoid()
          }));
          const [createdProject] = await db.insert(projects).values({
            ...projectData,
            photos: processedPhotos,
            selectedPhotos: [],
            includedPhotos: projectData.includedPhotos || 0,
            additionalPhotoPrice: projectData.additionalPhotoPrice || 0
          }).returning();
          return createdProject;
        } catch (error) {
          console.error("Erro ao criar projeto:", error);
          throw error;
        }
      }
      async updateProject(id, projectData) {
        try {
          const [updatedProject] = await db.update(projects).set(projectData).where(eq2(projects.id, id)).returning();
          return updatedProject;
        } catch (error) {
          console.error("Erro ao atualizar projeto:", error);
          return void 0;
        }
      }
      async updateProjectSelections(id, selectedPhotoIds) {
        try {
          console.log(`DatabaseStorage: Atualizando sele\xE7\xF5es para projeto ID=${id}, total de ${selectedPhotoIds.length} fotos selecionadas`);
          const project = await this.getProject(id);
          if (!project) {
            console.log(`DatabaseStorage: Projeto ID=${id} n\xE3o encontrado`);
            return void 0;
          }
          if (project.photos && Array.isArray(project.photos)) {
            const updatedPhotos = project.photos.map((photo) => ({
              ...photo,
              selected: selectedPhotoIds.includes(photo.id)
            }));
            const [updatedProject] = await db.update(projects).set({
              photos: updatedPhotos,
              // Não atualizar selectedPhotos, que será definido apenas na finalização
              status: project.status === "pendente" && selectedPhotoIds.length > 0 ? "revisado" : project.status
            }).where(eq2(projects.id, id)).returning();
            console.log(`DatabaseStorage: Sele\xE7\xF5es atualizadas para projeto ID=${id}`);
            return updatedProject;
          } else {
            console.log(`DatabaseStorage: Projeto ID=${id} n\xE3o tem fotos para atualizar`);
            return project;
          }
        } catch (error) {
          console.error(`Erro ao atualizar sele\xE7\xF5es do projeto ${id}:`, error);
          return void 0;
        }
      }
      async finalizeProjectSelection(id, selectedPhotos) {
        try {
          console.log(`DatabaseStorage: Finalizando sele\xE7\xE3o para projeto ID=${id}, fotos selecionadas: ${selectedPhotos.length}`);
          const [updatedProject] = await db.update(projects).set({
            selectedPhotos,
            status: "finalizado"
            // Atualiza o status para finalizado
          }).where(eq2(projects.id, id)).returning();
          return updatedProject;
        } catch (error) {
          console.error("Erro ao finalizar sele\xE7\xE3o de fotos:", error);
          return void 0;
        }
      }
      async archiveProject(id) {
        try {
          const [archivedProject] = await db.update(projects).set({ status: "arquivado" }).where(eq2(projects.id, id)).returning();
          return archivedProject;
        } catch (error) {
          console.error("Erro ao arquivar projeto:", error);
          return void 0;
        }
      }
      async reopenProject(id) {
        try {
          let projectId = id;
          if (typeof id === "string") {
            const numId = parseInt(id);
            if (!isNaN(numId)) {
              projectId = numId;
            } else {
              const project = await this.getProject(id);
              if (project) {
                projectId = project.id;
              } else {
                console.error(`Projeto n\xE3o encontrado com ID=${id}`);
                return void 0;
              }
            }
          }
          const [reopenedProject] = await db.update(projects).set({ status: "pendente" }).where(eq2(projects.id, projectId)).returning();
          console.log(`Projeto ID=${projectId} reaberto com sucesso`);
          return reopenedProject;
        } catch (error) {
          console.error("Erro ao reabrir projeto:", error);
          return void 0;
        }
      }
      async updateProjectWatermark(id, showWatermark) {
        try {
          const [updatedProject] = await db.update(projects).set({ showWatermark }).where(eq2(projects.id, id)).returning();
          console.log(`DatabaseStorage: Marca d'\xE1gua do projeto ID=${id} atualizada para ${showWatermark}`);
          return updatedProject;
        } catch (error) {
          console.error("Erro ao atualizar marca d'\xE1gua do projeto:", error);
          return void 0;
        }
      }
      async deleteProject(id) {
        try {
          const project = await this.getProject(id);
          if (!project) {
            console.log(`DatabaseStorage: Projeto ID=${id} n\xE3o encontrado para dele\xE7\xE3o`);
            return false;
          }
          const photographerId = project.photographerId;
          const photoCount = project.photos ? project.photos.length : 0;
          console.log(`DatabaseStorage: Deletando projeto ID=${id} com ${photoCount} fotos do fot\xF3grafo ID=${photographerId}`);
          await db.delete(projects).where(eq2(projects.id, id));
          if (photoCount > 0) {
            console.log(`DatabaseStorage: Atualizando contador de uploads para o fot\xF3grafo ID=${photographerId}, reduzindo ${photoCount} fotos`);
            await this.updateUploadUsage(photographerId, -photoCount);
          }
          return true;
        } catch (error) {
          console.error("Erro ao excluir projeto:", error);
          return false;
        }
      }
      // ==================== Portfolio Methods ====================
      async getUserPortfolios(userId) {
        try {
          const result = await db.select().from(portfolios).where(eq2(portfolios.userId, userId));
          return result.map((portfolio) => ({
            ...portfolio,
            photos: []
            // Will be populated in a real implementation
          }));
        } catch (error) {
          console.error("Error fetching user portfolios:", error);
          return [];
        }
      }
      async createPortfolio(data) {
        try {
          const [portfolio] = await db.insert(portfolios).values({
            name: data.name,
            slug: data.slug,
            description: data.description,
            isPublic: data.isPublic,
            userId: data.userId
          }).returning();
          return {
            ...portfolio,
            photos: []
          };
        } catch (error) {
          console.error("Error creating portfolio:", error);
          throw error;
        }
      }
      async getPortfolio(id) {
        try {
          const [portfolio] = await db.select().from(portfolios).where(eq2(portfolios.id, id));
          if (!portfolio) return void 0;
          const photos2 = await db.select().from(portfolioPhotos).where(eq2(portfolioPhotos.portfolioId, id));
          return {
            ...portfolio,
            photos: photos2
          };
        } catch (error) {
          console.error("Error fetching portfolio:", error);
          return void 0;
        }
      }
      async getPortfolioBySlug(slug) {
        try {
          const [portfolio] = await db.select().from(portfolios).where(eq2(portfolios.slug, slug));
          if (!portfolio) return void 0;
          const photos2 = await db.select().from(portfolioPhotos).where(eq2(portfolioPhotos.portfolioId, portfolio.id));
          return {
            ...portfolio,
            photos: photos2,
            user: { name: "Fot\xF3grafo Profissional" }
          };
        } catch (error) {
          console.error("Error fetching portfolio by slug:", error);
          return void 0;
        }
      }
      async updatePortfolio(id, data) {
        try {
          const [portfolio] = await db.update(portfolios).set({
            name: data.name,
            description: data.description,
            isPublic: data.isPublic,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(portfolios.id, id)).returning();
          if (!portfolio) return void 0;
          const photos2 = await db.select().from(portfolioPhotos).where(eq2(portfolioPhotos.portfolioId, id));
          return {
            ...portfolio,
            photos: photos2
          };
        } catch (error) {
          console.error("Error updating portfolio:", error);
          return void 0;
        }
      }
      async deletePortfolio(id) {
        try {
          await db.delete(portfolioPhotos).where(eq2(portfolioPhotos.portfolioId, id));
          const result = await db.delete(portfolios).where(eq2(portfolios.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting portfolio:", error);
          return false;
        }
      }
      async addPhotosToPortfolio(portfolioId, photoIds) {
        try {
          const userProjects = await db.select().from(projects);
          const photosToAdd = [];
          let order = 0;
          for (const project of userProjects) {
            if (project.photos && Array.isArray(project.photos)) {
              for (const photo of project.photos) {
                if (photoIds.includes(photo.id)) {
                  photosToAdd.push({
                    portfolioId,
                    photoUrl: photo.url,
                    originalName: photo.originalName || photo.filename,
                    order: order++
                  });
                }
              }
            }
          }
          if (photosToAdd.length > 0) {
            await db.insert(portfolioPhotos).values(photosToAdd);
          }
        } catch (error) {
          console.error("Error adding photos to portfolio:", error);
          throw error;
        }
      }
      async removePhotosFromPortfolio(portfolioId, photoIds) {
        try {
          for (const photoId of photoIds) {
            await db.delete(portfolioPhotos).where(
              and(
                eq2(portfolioPhotos.portfolioId, portfolioId),
                eq2(portfolioPhotos.id, parseInt(photoId))
              )
            );
          }
        } catch (error) {
          console.error("Error removing photos from portfolio:", error);
          throw error;
        }
      }
      // ==================== Métodos de Controle Automático de Downgrade ====================
      /**
       * Agenda um downgrade pendente para um usuário com 3 dias de tolerância
       * @param userId ID do usuário
       * @param reason Motivo do downgrade (canceled, refunded, etc.)
       * @param originalPlan Plano original antes do downgrade
       */
      async schedulePendingDowngrade(userId, reason, originalPlan) {
        try {
          const downgradeDate = /* @__PURE__ */ new Date();
          downgradeDate.setDate(downgradeDate.getDate() + 3);
          console.log(`[DOWNGRADE] Agendando downgrade para usu\xE1rio ID=${userId}, motivo=${reason}, data=${downgradeDate.toISOString()}`);
          const [updatedUser] = await db.update(users).set({
            pendingDowngradeDate: downgradeDate,
            pendingDowngradeReason: reason,
            originalPlanBeforeDowngrade: originalPlan,
            lastEvent: {
              type: `pending_downgrade_${reason}`,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            }
          }).where(eq2(users.id, userId)).returning();
          console.log(`[DOWNGRADE] Downgrade agendado com sucesso para usu\xE1rio ID=${userId}`);
          return updatedUser;
        } catch (error) {
          console.error("Erro ao agendar downgrade:", error);
          return void 0;
        }
      }
      /**
       * Cancela um downgrade pendente (quando pagamento é regularizado)
       * @param userId ID do usuário
       */
      async cancelPendingDowngrade(userId) {
        try {
          console.log(`[DOWNGRADE] Cancelando downgrade pendente para usu\xE1rio ID=${userId}`);
          const [updatedUser] = await db.update(users).set({
            pendingDowngradeDate: null,
            pendingDowngradeReason: null,
            originalPlanBeforeDowngrade: null,
            lastEvent: {
              type: "downgrade_cancelled",
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            }
          }).where(eq2(users.id, userId)).returning();
          console.log(`[DOWNGRADE] Downgrade cancelado com sucesso para usu\xE1rio ID=${userId}`);
          return updatedUser;
        } catch (error) {
          console.error("Erro ao cancelar downgrade:", error);
          return void 0;
        }
      }
      /**
       * Busca usuários com downgrades que já venceram
       */
      async getUsersWithExpiredDowngrades() {
        try {
          const now = /* @__PURE__ */ new Date();
          const expiredUsers = await db.select().from(users).where(
            and(
              sql`pending_downgrade_date IS NOT NULL`,
              sql`pending_downgrade_date <= ${now}`
            )
          );
          console.log(`[DOWNGRADE] Encontrados ${expiredUsers.length} usu\xE1rios com downgrades expirados`);
          return expiredUsers;
        } catch (error) {
          console.error("Erro ao buscar usu\xE1rios com downgrades expirados:", error);
          return [];
        }
      }
      /**
       * Processa todos os downgrades que venceram, convertendo para plano gratuito
       * @returns Número de usuários processados
       */
      // ==================== CONTROLE MANUAL DE PLANOS (ADM) ====================
      // Método para redefinir senha de usuário pelo ADM
      async resetUserPasswordByAdmin(userId, newPassword, adminEmail) {
        const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        const hashedPassword = await hashPassword2(newPassword);
        await db.update(users).set({
          password: hashedPassword,
          lastEvent: {
            type: "password_reset_by_admin",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        }).where(eq2(users.id, userId));
        console.log(`[ADM] Senha redefinida para usu\xE1rio ID=${userId} por ${adminEmail}`);
      }
      // Método para ativar plano manualmente pelo ADM (expira em 34 dias)
      async activateManualPlan(userId, planType, adminEmail) {
        const activationDate = /* @__PURE__ */ new Date();
        await db.update(users).set({
          planType,
          subscriptionStatus: "active",
          subscriptionStartDate: activationDate,
          manualActivationDate: activationDate,
          manualActivationBy: adminEmail,
          isManualActivation: true,
          // Limpar campos de downgrade se existirem
          pendingDowngradeDate: null,
          pendingDowngradeReason: null,
          originalPlanBeforeDowngrade: null,
          // Configurar limites do plano
          uploadLimit: SUBSCRIPTION_PLANS[planType]?.uploadLimit || 1e3,
          lastEvent: {
            type: "manual_activation",
            timestamp: activationDate.toISOString()
          }
        }).where(eq2(users.id, userId));
        console.log(`[ADM] Plano ${planType} ativado manualmente para usu\xE1rio ${userId} por ${adminEmail} - expira em 34 dias`);
      }
      // Método para processar planos manuais expirados (executa automaticamente a cada hora)
      async processExpiredManualActivations() {
        const now = /* @__PURE__ */ new Date();
        const thirtyFourDaysAgo = new Date(now.getTime() - 34 * 24 * 60 * 60 * 1e3);
        const expiredUsers = await db.select().from(users).where(
          and(
            eq2(users.isManualActivation, true),
            lt(users.manualActivationDate, thirtyFourDaysAgo),
            ne(users.planType, "free")
          )
        );
        let processedCount = 0;
        for (const user of expiredUsers) {
          if (!user.subscription_id) {
            await db.update(users).set({
              planType: "free",
              subscriptionStatus: "cancelled",
              uploadLimit: 1e3,
              isManualActivation: false,
              manualActivationDate: null,
              manualActivationBy: null,
              lastEvent: {
                type: "manual_activation_expired",
                timestamp: now.toISOString()
              }
            }).where(eq2(users.id, user.id));
            console.log(`[ADM] Usu\xE1rio ${user.email} convertido para plano gratuito - ativa\xE7\xE3o manual expirada ap\xF3s 34 dias`);
            processedCount++;
          } else {
            await db.update(users).set({
              isManualActivation: false,
              manualActivationDate: null,
              manualActivationBy: null,
              lastEvent: {
                type: "manual_activation_converted_to_paid",
                timestamp: now.toISOString()
              }
            }).where(eq2(users.id, user.id));
            console.log(`[ADM] Usu\xE1rio ${user.email} convertido para plano pago via Hotmart - removendo controle manual`);
          }
        }
        return processedCount;
      }
      // ==================== SISTEMA DE DOWNGRADE AUTOMÁTICO ====================
      /**
       * Identifica usuários com assinaturas vencidas sem pagamento detectado
       * Critérios: plano pago + subscriptionEndDate vencida + sem pagamento recente
       */
      async getUsersWithExpiredSubscriptionsNeedsDowngrade() {
        try {
          const now = /* @__PURE__ */ new Date();
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
          const expiredUsers = await db.select().from(users).where(
            and(
              // Não é plano gratuito
              ne(users.planType, "free"),
              // Tem data de fim de assinatura definida
              not(isNull(users.subscriptionEndDate)),
              // Data de fim já passou (este é o critério principal)
              lt(users.subscriptionEndDate, now),
              // Não é ativação manual recente (menos de 30 dias)
              or(
                isNull(users.isManualActivation),
                eq2(users.isManualActivation, false),
                and(
                  eq2(users.isManualActivation, true),
                  lt(users.manualActivationDate, thirtyDaysAgo)
                )
              ),
              // Não tem downgrade pendente já agendado
              isNull(users.pendingDowngradeDate)
            )
          );
          console.log(`[EXPIRED-CHECK] Encontrados ${expiredUsers.length} usu\xE1rios com assinaturas vencidas que precisam de an\xE1lise`);
          const usersNeedingDowngrade = expiredUsers.filter((user) => {
            const daysSinceExpiry = Math.floor(
              (now.getTime() - new Date(user.subscriptionEndDate).getTime()) / (1e3 * 60 * 60 * 24)
            );
            if (daysSinceExpiry > 0) {
              const hasRecentPayment = user.lastEvent && user.lastEvent.type === "purchase.approved" && new Date(user.lastEvent.timestamp) > sevenDaysAgo;
              if (!hasRecentPayment) {
                console.log(`[EXPIRED-CHECK] Usu\xE1rio ${user.email}: venceu h\xE1 ${daysSinceExpiry} dias, sem pagamento recente - DOWNGRADE IMEDIATO`);
                return true;
              } else {
                console.log(`[EXPIRED-CHECK] Usu\xE1rio ${user.email}: tem pagamento recente, mantendo ativo`);
              }
            } else {
              console.log(`[EXPIRED-CHECK] Usu\xE1rio ${user.email}: ainda n\xE3o venceu (${daysSinceExpiry} dias)`);
            }
            return false;
          });
          console.log(`[EXPIRED-CHECK] ${usersNeedingDowngrade.length} usu\xE1rios precisam de downgrade por assinatura vencida`);
          return usersNeedingDowngrade;
        } catch (error) {
          console.error("Erro ao buscar usu\xE1rios com assinaturas vencidas:", error);
          return [];
        }
      }
      /**
       * Processa usuários com assinaturas vencidas sem pagamento e faz downgrade para free
       */
      async processExpiredSubscriptionsWithoutPayment() {
        try {
          const expiredUsers = await this.getUsersWithExpiredSubscriptionsNeedsDowngrade();
          let processedCount = 0;
          console.log(`[EXPIRED-DOWNGRADE] Iniciando processamento de ${expiredUsers.length} usu\xE1rios com assinaturas vencidas`);
          for (const user of expiredUsers) {
            try {
              const originalPlan = user.planType;
              const daysSinceExpiry = Math.floor(
                ((/* @__PURE__ */ new Date()).getTime() - new Date(user.subscriptionEndDate).getTime()) / (1e3 * 60 * 60 * 24)
              );
              console.log(`[EXPIRED-DOWNGRADE] Processando usu\xE1rio ${user.email}: ${originalPlan} -> free (venceu h\xE1 ${daysSinceExpiry} dias)`);
              await this.updateUserSubscription(user.id, "free");
              await this.updateUser(user.id, {
                subscriptionStatus: "expired_no_payment",
                originalPlanBeforeDowngrade: originalPlan,
                lastEvent: {
                  type: "auto_downgrade_expired_no_payment",
                  timestamp: (/* @__PURE__ */ new Date()).toISOString()
                }
              });
              console.log(`[EXPIRED-DOWNGRADE] Usu\xE1rio ${user.email} convertido para plano gratuito (assinatura vencida h\xE1 ${daysSinceExpiry} dias)`);
              processedCount++;
            } catch (userError) {
              console.error(`[EXPIRED-DOWNGRADE] Erro ao processar usu\xE1rio ${user.email}:`, userError);
            }
          }
          console.log(`[EXPIRED-DOWNGRADE] Processamento conclu\xEDdo: ${processedCount} usu\xE1rios convertidos para plano gratuito`);
          return processedCount;
        } catch (error) {
          console.error("Erro ao processar assinaturas vencidas:", error);
          return 0;
        }
      }
      async processExpiredDowngrades() {
        try {
          const expiredUsers = await this.getUsersWithExpiredDowngrades();
          let processedCount = 0;
          for (const user of expiredUsers) {
            console.log(`[DOWNGRADE] Processando downgrade para usu\xE1rio ID=${user.id}, email=${user.email}`);
            const [updatedUser] = await db.update(users).set({
              planType: "free",
              uploadLimit: SUBSCRIPTION_PLANS.FREE.uploadLimit,
              subscriptionStatus: "inactive",
              subscriptionEndDate: /* @__PURE__ */ new Date(),
              pendingDowngradeDate: null,
              pendingDowngradeReason: null,
              originalPlanBeforeDowngrade: null,
              lastEvent: {
                type: "downgrade_executed",
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              }
            }).where(eq2(users.id, user.id)).returning();
            if (updatedUser) {
              console.log(`[DOWNGRADE] Usu\xE1rio ID=${user.id} convertido para plano gratuito por motivo: ${user.pendingDowngradeReason}`);
              processedCount++;
            }
          }
          console.log(`[DOWNGRADE] Processamento conclu\xEDdo: ${processedCount} usu\xE1rios convertidos para plano gratuito`);
          return processedCount;
        } catch (error) {
          console.error("Erro ao processar downgrades expirados:", error);
          return 0;
        }
      }
      // ==================== Photo Comment Methods ====================
      async createPhotoComment(comment) {
        try {
          const [newComment] = await db.insert(photoComments).values(comment).returning();
          console.log(`DatabaseStorage: Coment\xE1rio criado para foto ID=${comment.photoId}`);
          return newComment;
        } catch (error) {
          console.error("Erro ao criar coment\xE1rio da foto:", error);
          throw error;
        }
      }
      async getPhotoComments(photoId) {
        try {
          const comments = await db.select().from(photoComments).where(eq2(photoComments.photoId, photoId)).orderBy(desc(photoComments.createdAt));
          return comments;
        } catch (error) {
          console.error("Erro ao buscar coment\xE1rios da foto:", error);
          return [];
        }
      }
      async getProjectPhotoComments(projectId) {
        try {
          const project = await this.getProject(parseInt(projectId));
          if (!project || !project.photos) {
            console.log(`DatabaseStorage: Projeto ${projectId} n\xE3o encontrado ou sem fotos`);
            return [];
          }
          const photoIds = project.photos.map((photo) => photo.id);
          if (photoIds.length === 0) {
            console.log(`DatabaseStorage: Nenhuma foto encontrada para projeto ID=${projectId}`);
            return [];
          }
          const comments = await db.select().from(photoComments).where(inArray(photoComments.photoId, photoIds)).orderBy(desc(photoComments.createdAt));
          const enrichedComments = comments.map((comment) => {
            const photo = project.photos?.find((p) => p.id === comment.photoId);
            return {
              ...comment,
              photoUrl: photo?.url,
              photoFilename: photo?.filename,
              photoOriginalName: photo?.originalName
            };
          });
          console.log(`DatabaseStorage: Encontrados ${comments.length} coment\xE1rios para projeto ID=${projectId} (${photoIds.length} fotos)`);
          return enrichedComments;
        } catch (error) {
          console.error("Erro ao buscar coment\xE1rios do projeto:", error);
          return [];
        }
      }
      async markCommentsAsViewed(commentIds) {
        try {
          if (commentIds.length === 0) return;
          await db.update(photoComments).set({ isViewed: true }).where(inArray(photoComments.id, commentIds));
          console.log(`DatabaseStorage: ${commentIds.length} coment\xE1rios marcados como visualizados`);
        } catch (error) {
          console.error("Erro ao marcar coment\xE1rios como visualizados:", error);
          throw error;
        }
      }
      async getPublicPortfolio(slug) {
        try {
          const [portfolio] = await db.select().from(portfolios).where(and(
            eq2(portfolios.slug, slug),
            eq2(portfolios.isPublic, true)
          ));
          if (!portfolio) {
            console.log(`DatabaseStorage: Portf\xF3lio p\xFAblico com slug='${slug}' n\xE3o encontrado`);
            return void 0;
          }
          const photos2 = await db.select().from(portfolioPhotos).where(eq2(portfolioPhotos.portfolioId, portfolio.id)).orderBy(asc(portfolioPhotos.order));
          console.log(`DatabaseStorage: Portf\xF3lio p\xFAblico slug='${slug}' encontrado com ${photos2.length} fotos`);
          return {
            ...portfolio,
            photos: photos2
          };
        } catch (error) {
          console.error("Erro ao buscar portf\xF3lio p\xFAblico:", error);
          return void 0;
        }
      }
      async updatePortfolio(id, data) {
        try {
          const updateData = {
            name: data.name,
            description: data.description,
            isPublic: data.isPublic,
            updatedAt: /* @__PURE__ */ new Date()
          };
          if (data.name) {
            updateData.slug = data.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").trim();
          }
          const [updatedPortfolio] = await db.update(portfolios).set(updateData).where(eq2(portfolios.id, id)).returning();
          if (!updatedPortfolio) {
            console.log(`DatabaseStorage: Portf\xF3lio ID=${id} n\xE3o encontrado para atualiza\xE7\xE3o`);
            return void 0;
          }
          const photos2 = await db.select().from(portfolioPhotos).where(eq2(portfolioPhotos.portfolioId, id)).orderBy(asc(portfolioPhotos.order));
          console.log(`DatabaseStorage: Portf\xF3lio ID=${id} atualizado`);
          return {
            ...updatedPortfolio,
            photos: photos2
          };
        } catch (error) {
          console.error("Erro ao atualizar portf\xF3lio:", error);
          throw error;
        }
      }
      async deletePortfolio(id) {
        try {
          await db.delete(portfolioPhotos).where(eq2(portfolioPhotos.portfolioId, id));
          const result = await db.delete(portfolios).where(eq2(portfolios.id, id));
          console.log(`DatabaseStorage: Portf\xF3lio ID=${id} exclu\xEDdo`);
          return true;
        } catch (error) {
          console.error("Erro ao excluir portf\xF3lio:", error);
          return false;
        }
      }
      async addPhotosToPortfolio(portfolioId, photoUrls) {
        try {
          const [maxOrderResult] = await db.select({ maxOrder: sql`COALESCE(MAX(${portfolioPhotos.order}), -1)` }).from(portfolioPhotos).where(eq2(portfolioPhotos.portfolioId, portfolioId));
          const startOrder = (maxOrderResult?.maxOrder ?? -1) + 1;
          const newPhotos = photoUrls.map((photoUrl, index) => ({
            portfolioId,
            photoUrl,
            order: startOrder + index,
            originalName: photoUrl.split("/").pop() || "photo.jpg",
            description: null
          }));
          const insertedPhotos = await db.insert(portfolioPhotos).values(newPhotos).returning();
          console.log(`DatabaseStorage: ${insertedPhotos.length} fotos adicionadas ao portf\xF3lio ID=${portfolioId}`);
          return insertedPhotos;
        } catch (error) {
          console.error("Erro ao adicionar fotos ao portf\xF3lio:", error);
          throw error;
        }
      }
      async removePhotosFromPortfolio(portfolioId, photoIds) {
        try {
          await db.delete(portfolioPhotos).where(and(
            eq2(portfolioPhotos.portfolioId, portfolioId),
            inArray(portfolioPhotos.id, photoIds)
          ));
          console.log(`DatabaseStorage: ${photoIds.length} fotos removidas do portf\xF3lio ID=${portfolioId}`);
        } catch (error) {
          console.error("Erro ao remover fotos do portf\xF3lio:", error);
          throw error;
        }
      }
      async getUserProjects(userId) {
        try {
          const userProjects = await this.getProjects(userId);
          const formattedProjects = userProjects.map((project) => ({
            id: project.id,
            name: project.name,
            photos: project.photos?.map((photo) => ({
              id: photo.id,
              url: photo.url,
              filename: photo.filename,
              originalName: photo.originalName
            })) || []
          }));
          console.log(`DatabaseStorage: Encontrados ${formattedProjects.length} projetos para usu\xE1rio ID=${userId}`);
          return formattedProjects;
        } catch (error) {
          console.error("Erro ao buscar projetos do usu\xE1rio:", error);
          return [];
        }
      }
      async reorderPortfolioPhotos(portfolioId, photoOrders) {
        try {
          for (const { photoId, order } of photoOrders) {
            await db.update(portfolioPhotos).set({ order }).where(and(
              eq2(portfolioPhotos.portfolioId, portfolioId),
              eq2(portfolioPhotos.id, photoId)
            ));
          }
          console.log(`DatabaseStorage: Ordem das fotos atualizada no portf\xF3lio ID=${portfolioId}`);
        } catch (error) {
          console.error("Erro ao reordenar fotos do portf\xF3lio:", error);
          throw error;
        }
      }
      async updatePortfolioPhoto(photoId, data) {
        try {
          const [updatedPhoto] = await db.update(portfolioPhotos).set({
            description: data.description,
            order: data.order,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(portfolioPhotos.id, photoId)).returning();
          console.log(`DatabaseStorage: Foto do portf\xF3lio ID=${photoId} atualizada`);
          return updatedPhoto;
        } catch (error) {
          console.error("Erro ao atualizar foto do portf\xF3lio:", error);
          throw error;
        }
      }
      async deletePortfolioPhoto(photoId) {
        try {
          await db.delete(portfolioPhotos).where(eq2(portfolioPhotos.id, photoId));
          console.log(`DatabaseStorage: Foto do portf\xF3lio ID=${photoId} exclu\xEDda`);
        } catch (error) {
          console.error("Erro ao excluir foto do portf\xF3lio:", error);
          throw error;
        }
      }
      async getPortfolioPhotos(portfolioId) {
        try {
          const photos2 = await db.select().from(portfolioPhotos).where(eq2(portfolioPhotos.portfolioId, portfolioId)).orderBy(asc(portfolioPhotos.order));
          console.log(`DatabaseStorage: Encontradas ${photos2.length} fotos no portf\xF3lio ID=${portfolioId}`);
          return photos2;
        } catch (error) {
          console.error("Erro ao buscar fotos do portf\xF3lio:", error);
          return [];
        }
      }
      // ============ REFERRAL METHODS ============
      async getUserByReferralCode(referralCode) {
        try {
          const [user] = await db.select().from(users).where(eq2(users.referralCode, referralCode)).limit(1);
          return user;
        } catch (error) {
          console.error("Erro ao buscar usu\xE1rio por c\xF3digo de indica\xE7\xE3o:", error);
          return void 0;
        }
      }
      async generateReferralCode(userId) {
        try {
          const code = nanoid(8).toUpperCase();
          await db.update(users).set({ referralCode: code }).where(eq2(users.id, userId));
          console.log(`DatabaseStorage: C\xF3digo de indica\xE7\xE3o ${code} gerado para usu\xE1rio ID=${userId}`);
          return code;
        } catch (error) {
          console.error("Erro ao gerar c\xF3digo de indica\xE7\xE3o:", error);
          throw error;
        }
      }
      async createReferral(referrerId, referredId) {
        try {
          const [newReferral] = await db.insert(referrals).values({
            referrerId,
            referredId,
            status: "pending"
          }).returning();
          console.log(`DatabaseStorage: Referral criado - Indicador ID=${referrerId}, Indicado ID=${referredId}`);
          return newReferral;
        } catch (error) {
          console.error("Erro ao criar referral:", error);
          throw error;
        }
      }
      async getReferralByReferredId(referredId) {
        try {
          const [referral] = await db.select().from(referrals).where(eq2(referrals.referredId, referredId)).limit(1);
          return referral;
        } catch (error) {
          console.error("Erro ao buscar referral por referredId:", error);
          return void 0;
        }
      }
      async getPendingReferralByReferredId(referredId) {
        try {
          const [referral] = await db.select().from(referrals).where(
            and(
              eq2(referrals.referredId, referredId),
              eq2(referrals.status, "pending")
            )
          ).limit(1);
          return referral;
        } catch (error) {
          console.error("Erro ao buscar referral pendente:", error);
          return void 0;
        }
      }
      async markReferralAsConverted(referralId) {
        try {
          const [updatedReferral] = await db.update(referrals).set({
            status: "converted",
            convertedAt: /* @__PURE__ */ new Date()
          }).where(
            and(
              eq2(referrals.id, referralId),
              eq2(referrals.status, "pending")
            )
          ).returning();
          if (updatedReferral) {
            console.log(`DatabaseStorage: Referral ID=${referralId} marcado como convertido`);
          } else {
            console.log(`DatabaseStorage: Referral ID=${referralId} n\xE3o encontrado ou j\xE1 convertido`);
          }
          return updatedReferral;
        } catch (error) {
          console.error("Erro ao marcar referral como convertido:", error);
          return void 0;
        }
      }
      async markReferralDiscountApplied(referralId) {
        try {
          const [updatedReferral] = await db.update(referrals).set({
            discountAppliedAt: /* @__PURE__ */ new Date()
          }).where(eq2(referrals.id, referralId)).returning();
          console.log(`DatabaseStorage: Desconto aplicado no referral ID=${referralId}`);
          return updatedReferral;
        } catch (error) {
          console.error("Erro ao marcar desconto aplicado:", error);
          return void 0;
        }
      }
      async getUserReferrals(userId) {
        try {
          const userReferrals = await db.select().from(referrals).where(eq2(referrals.referrerId, userId)).orderBy(desc(referrals.createdAt));
          return userReferrals;
        } catch (error) {
          console.error("Erro ao buscar indica\xE7\xF5es do usu\xE1rio:", error);
          return [];
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/imageProcessor.ts
import sharp from "sharp";
function forceGarbageCollection() {
  if (global.gc) {
    try {
      global.gc();
      if (process.env.DEBUG_MEMORY === "true") {
        console.log("[GC] Garbage collection executado manualmente");
      }
    } catch (error) {
      console.warn("[GC] Erro ao executar garbage collection:", error);
    }
  }
}
async function processImage(buffer, mimetype, applyWatermark = false) {
  console.log(`[Backend] Processamento de imagem DESATIVADO - retornando arquivo original: ${mimetype}, Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  return buffer;
}
var watermarkCache, watermarkUsageTracker;
var init_imageProcessor = __esm({
  "server/imageProcessor.ts"() {
    "use strict";
    watermarkCache = /* @__PURE__ */ new Map();
    watermarkUsageTracker = /* @__PURE__ */ new Map();
    sharp.cache(false);
    setInterval(() => {
      if (watermarkCache.size > 0) {
        watermarkCache.clear();
        watermarkUsageTracker.clear();
        if (process.env.DEBUG_MEMORY === "true") {
          console.log("[CACHE] Cache de watermark limpo automaticamente");
        }
        forceGarbageCollection();
      }
    }, 5 * 60 * 1e3);
  }
});

// server/r2.ts
var r2_exports = {};
__export(r2_exports, {
  ALLOWED_MIME_TYPES: () => ALLOWED_MIME_TYPES,
  BUCKET_NAME: () => BUCKET_NAME,
  MAX_FILE_SIZE: () => MAX_FILE_SIZE,
  R2_CONFIGURED: () => R2_CONFIGURED,
  deleteFileFromR2: () => deleteFileFromR2,
  downloadAndUploadToR2: () => downloadAndUploadToR2,
  ensureBucketExists: () => ensureBucketExists,
  generateUniqueFileName: () => generateUniqueFileName,
  isValidFileSize: () => isValidFileSize,
  isValidFileType: () => isValidFileType,
  r2Client: () => r2Client,
  r2Upload: () => r2Upload,
  uploadFileToR2: () => uploadFileToR2
});
import { S3Client, PutObjectCommand, HeadBucketCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
function generateUniqueFileName(originalName) {
  const timestamp2 = Date.now();
  const randomString = Math.random().toString(36).substring(2, 12);
  const extension = originalName.split(".").pop() || "jpg";
  return `${timestamp2}-${randomString}.${extension}`;
}
function isValidFileType(mimetype) {
  return ALLOWED_MIME_TYPES.includes(mimetype);
}
function isValidFileSize(size) {
  return size <= MAX_FILE_SIZE;
}
async function uploadFileToR2(buffer, fileName, contentType, applyWatermark = true) {
  try {
    const processedBuffer = buffer;
    console.log(`Enviando arquivo direto para R2: ${fileName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB) - sem processamento backend`);
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: processedBuffer,
      ContentType: contentType
    });
    await r2Client.send(uploadCommand);
    const accountId = process.env.R2_ACCOUNT_ID || "";
    const publicUrl = `https://cdn.fottufy.com/${fileName}`;
    console.log(`Generated CDN URL: ${publicUrl}`);
    return {
      url: publicUrl,
      key: fileName
    };
  } catch (error) {
    console.error("Error uploading file to R2:", error);
    throw error;
  }
}
async function downloadAndUploadToR2(sourceUrl, filename, applyWatermark = true) {
  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    let processedBuffer = buffer;
    if (isValidFileType(contentType)) {
      try {
        const watermarkStatus = applyWatermark ? "com marca d'\xE1gua" : "sem marca d'\xE1gua";
        console.log(`Processando imagem baixada: ${filename} (redimensionamento ${watermarkStatus})`);
        processedBuffer = await processImage(buffer, contentType, applyWatermark);
        console.log(`Imagem baixada processada com sucesso: ${filename}`);
      } catch (processingError) {
        console.error(`Erro ao processar imagem baixada ${filename}:`, processingError);
        processedBuffer = buffer;
      }
    }
    const result = await uploadFileToR2(
      processedBuffer,
      filename,
      contentType,
      applyWatermark
    );
    try {
      buffer = null;
      processedBuffer = null;
    } catch (e) {
    }
    return result;
  } catch (error) {
    console.error(`Error downloading and uploading image from ${sourceUrl}:`, error);
    throw error;
  }
}
async function ensureBucketExists() {
  try {
    try {
      await r2Client.send(
        new HeadBucketCommand({
          Bucket: BUCKET_NAME
        })
      );
      console.log(`Bucket '${BUCKET_NAME}' already exists.`);
      return;
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404) {
        console.error(`Bucket '${BUCKET_NAME}' not found in Cloudflare R2.`);
        console.error(`IMPORTANT: Buckets must be created manually in the Cloudflare dashboard before use.`);
        console.error(`Please go to https://dash.cloudflare.com and create the bucket '${BUCKET_NAME}' with public access enabled.`);
        throw new Error(`Bucket '${BUCKET_NAME}' does not exist in Cloudflare R2. It must be created manually in the Cloudflare dashboard.`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    throw error;
  }
}
async function deleteFileFromR2(fileName) {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName
    });
    await r2Client.send(deleteCommand);
    console.log(`Successfully deleted ${fileName} from Cloudflare R2.`);
  } catch (error) {
    console.error(`Failed to delete ${fileName} from Cloudflare R2:`, error);
    throw error;
  }
}
var R2_CONFIGURED, R2_REGION, BUCKET_NAME, endpoint, r2Client, ALLOWED_MIME_TYPES, MAX_FILE_SIZE, r2Upload;
var init_r2 = __esm({
  "server/r2.ts"() {
    "use strict";
    init_imageProcessor();
    R2_CONFIGURED = !!process.env.R2_ACCESS_KEY_ID && !!process.env.R2_SECRET_ACCESS_KEY && !!process.env.R2_BUCKET_NAME && !!process.env.R2_ACCOUNT_ID;
    if (!R2_CONFIGURED) {
      console.warn("[R2] WARNING: One or more R2 environment variables are missing.");
      console.warn("[R2] R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME and R2_ACCOUNT_ID must be set.");
      console.warn("[R2] Photo upload/download features will be unavailable until these are configured.");
    }
    R2_REGION = process.env.R2_REGION || "auto";
    BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
    endpoint = process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "https://placeholder.r2.cloudflarestorage.com";
    if (R2_CONFIGURED) {
      console.log(`[R2] Using R2 endpoint: ${endpoint}`);
    }
    r2Client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "placeholder",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "placeholder"
      }
    });
    ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    MAX_FILE_SIZE = 1e3 * 1024 * 1024;
    r2Upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: MAX_FILE_SIZE
      },
      fileFilter: (req, file, cb) => {
        if (isValidFileType(file.mimetype)) {
          cb(null, true);
        } else {
          cb(null, false);
          cb(new Error(`Tipo de arquivo n\xE3o permitido: ${file.mimetype}. Apenas imagens JPEG, PNG, GIF e WebP s\xE3o aceitas.`));
        }
      }
    });
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_r2();
init_schema();
import { createServer } from "http";
import { z as z2 } from "zod";
import { GetObjectCommand as GetObjectCommand2 } from "@aws-sdk/client-s3";

// server/utils/nurturingEmails.ts
var baseStyles = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo-text { font-size: 32px; font-weight: 900; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    h1 { color: #1f2937; font-size: 24px; font-weight: 800; margin-bottom: 20px; line-height: 1.3; }
    p { color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 16px; }
    .highlight { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 16px; margin: 24px 0; border-left: 4px solid #f59e0b; }
    .highlight p { margin: 0; color: #92400e; font-weight: 600; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; margin: 24px 0; }
    .cta-button:hover { opacity: 0.9; }
    .feature-list { background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; }
    .feature-item { display: flex; align-items: center; margin-bottom: 12px; }
    .feature-icon { width: 24px; height: 24px; margin-right: 12px; color: #10b981; }
    .footer { text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb; }
    .footer p { color: #9ca3af; font-size: 14px; }
    .stat-box { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 20px; border-radius: 16px; text-align: center; margin: 20px 0; }
    .stat-number { font-size: 36px; font-weight: 900; color: #059669; }
    .stat-label { color: #047857; font-size: 14px; font-weight: 600; }
  </style>
`;
var nurturingEmailTemplates = {
  1: {
    subject: "\u{1F3AF} Voc\xEA est\xE1 perdendo sele\xE7\xF5es de fotos agora mesmo?",
    getHtml: (userName) => `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <span class="logo-text">\u{1F4F8} Fottufy</span>
            </div>
            
            <h1>Ol\xE1, ${userName}! Seus clientes merecem ver suas fotos com estilo.</h1>
            
            <p>Voc\xEA sabia que fot\xF3grafos que usam galerias profissionais <strong>fecham 40% mais contratos</strong>?</p>
            
            <div class="highlight">
              <p>\u{1F4A1} Seus clientes ainda recebem fotos por Google Drive ou WeTransfer? Existe uma forma muito mais elegante...</p>
            </div>
            
            <p>Com a Fottufy, voc\xEA envia galerias com:</p>
            
            <div class="feature-list">
              <div class="feature-item">\u2728 Marca d'\xE1gua autom\xE1tica que protege seu trabalho</div>
              <div class="feature-item">\u{1F3A8} Design profissional que impressiona clientes</div>
              <div class="feature-item">\u{1F4F1} Funciona perfeito no celular</div>
              <div class="feature-item">\u2705 Sistema de sele\xE7\xE3o integrado</div>
            </div>
            
            <p style="text-align: center;">
              <a href="https://fottufy.com/subscription" class="cta-button">Quero impressionar meus clientes \u2192</a>
            </p>
            
            <div class="footer">
              <p>Fottufy - A plataforma premium para fot\xF3grafos profissionais</p>
              <p>Voc\xEA recebeu este email porque se cadastrou na Fottufy.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  },
  2: {
    subject: "\u26A1 O segredo dos fot\xF3grafos que faturam 2x mais",
    getHtml: (userName) => `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <span class="logo-text">\u{1F4F8} Fottufy</span>
            </div>
            
            <h1>${userName}, voc\xEA est\xE1 cobrando pelo seu trabalho como deveria?</h1>
            
            <p>Muitos fot\xF3grafos perdem dinheiro por n\xE3o ter uma apresenta\xE7\xE3o profissional.</p>
            
            <div class="stat-box">
              <div class="stat-number">+67%</div>
              <div class="stat-label">Valor percebido ao usar galerias profissionais</div>
            </div>
            
            <p>Quando seu cliente recebe as fotos em uma galeria elegante, com marca d'\xE1gua e sistema de sele\xE7\xE3o, ele <strong>percebe mais valor</strong> no seu trabalho.</p>
            
            <div class="highlight">
              <p>\u{1F3AF} Resultado: Voc\xEA pode cobrar mais e ainda assim o cliente fica mais satisfeito!</p>
            </div>
            
            <p>A Fottufy foi criada exatamente para isso: elevar a percep\xE7\xE3o do seu trabalho.</p>
            
            <p style="text-align: center;">
              <a href="https://fottufy.com/subscription" class="cta-button">Come\xE7ar a cobrar o que mere\xE7o \u2192</a>
            </p>
            
            <div class="footer">
              <p>Fottufy - Eleve o valor do seu trabalho fotogr\xE1fico</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  },
  3: {
    subject: "\u{1F512} Suas fotos est\xE3o protegidas? (Importante)",
    getHtml: (userName) => `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <span class="logo-text">\u{1F4F8} Fottufy</span>
            </div>
            
            <h1>${userName}, preciso te perguntar algo s\xE9rio...</h1>
            
            <p>Quando voc\xEA envia fotos para o cliente aprovar, elas est\xE3o protegidas?</p>
            
            <div class="highlight">
              <p>\u26A0\uFE0F Sem marca d'\xE1gua, qualquer pessoa pode baixar e usar suas fotos sem pagar!</p>
            </div>
            
            <p>Na Fottufy, <strong>toda foto recebe marca d'\xE1gua autom\xE1tica</strong>. Seu cliente v\xEA, seleciona, mas s\xF3 recebe as originais depois de pagar.</p>
            
            <div class="feature-list">
              <div class="feature-item">\u{1F510} Marca d'\xE1gua personalizada autom\xE1tica</div>
              <div class="feature-item">\u{1F6AB} Bloqueio de download de originais</div>
              <div class="feature-item">\u2705 Libera\xE7\xE3o ap\xF3s pagamento</div>
              <div class="feature-item">\u{1F4CA} Controle total das suas entregas</div>
            </div>
            
            <p>Proteja seu trabalho. Voc\xEA merece ser pago por cada foto entregue.</p>
            
            <p style="text-align: center;">
              <a href="https://fottufy.com/subscription" class="cta-button">Proteger minhas fotos agora \u2192</a>
            </p>
            
            <div class="footer">
              <p>Fottufy - Prote\xE7\xE3o profissional para fot\xF3grafos</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  },
  4: {
    subject: "\u{1F4F1} Seus clientes selecionam fotos pelo celular?",
    getHtml: (userName) => `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <span class="logo-text">\u{1F4F8} Fottufy</span>
            </div>
            
            <h1>${userName}, 85% dos seus clientes est\xE3o no celular!</h1>
            
            <p>Se voc\xEA ainda envia links do Google Drive ou pastas zip, seu cliente sofre para ver as fotos no celular.</p>
            
            <div class="stat-box">
              <div class="stat-number">85%</div>
              <div class="stat-label">das pessoas acessam pelo celular</div>
            </div>
            
            <p>A Fottufy foi pensada para o celular primeiro:</p>
            
            <div class="feature-list">
              <div class="feature-item">\u{1F4F1} Carregamento ultra-r\xE1pido</div>
              <div class="feature-item">\u{1F446} Sele\xE7\xE3o com um toque</div>
              <div class="feature-item">\u{1F4AC} Coment\xE1rios em cada foto</div>
              <div class="feature-item">\u2728 Visual incr\xEDvel em qualquer tela</div>
            </div>
            
            <div class="highlight">
              <p>\u{1F4A1} Clientes felizes = mais indica\xE7\xF5es = mais trabalho pra voc\xEA!</p>
            </div>
            
            <p style="text-align: center;">
              <a href="https://fottufy.com/subscription" class="cta-button">Oferecer a melhor experi\xEAncia \u2192</a>
            </p>
            
            <div class="footer">
              <p>Fottufy - Perfeito no celular, perfeito no computador</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  },
  5: {
    subject: "\u{1F680} Fot\xF3grafos profissionais j\xE1 est\xE3o usando isso",
    getHtml: (userName) => `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <span class="logo-text">\u{1F4F8} Fottufy</span>
            </div>
            
            <h1>${userName}, voc\xEA est\xE1 ficando para tr\xE1s?</h1>
            
            <p>Enquanto alguns fot\xF3grafos ainda usam Google Drive, outros est\xE3o profissionalizando suas entregas.</p>
            
            <div class="highlight">
              <p>\u{1F3C6} "Desde que comecei a usar a Fottufy, meus clientes elogiam demais a experi\xEAncia. J\xE1 fechei 3 contratos novos s\xF3 por indica\xE7\xE3o!" - Marina S.</p>
            </div>
            
            <p>O que fot\xF3grafos profissionais est\xE3o fazendo diferente:</p>
            
            <div class="feature-list">
              <div class="feature-item">\u2705 Galerias com marca d'\xE1gua autom\xE1tica</div>
              <div class="feature-item">\u2705 Sistema de sele\xE7\xE3o profissional</div>
              <div class="feature-item">\u2705 Portf\xF3lio online para captar clientes</div>
              <div class="feature-item">\u2705 Organiza\xE7\xE3o impec\xE1vel de projetos</div>
            </div>
            
            <p>N\xE3o deixe a concorr\xEAncia passar na sua frente.</p>
            
            <p style="text-align: center;">
              <a href="https://fottufy.com/subscription" class="cta-button">Quero me profissionalizar \u2192</a>
            </p>
            
            <div class="footer">
              <p>Fottufy - A escolha dos fot\xF3grafos profissionais</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  },
  6: {
    subject: "\u{1F381} \xDAltima chance: Comece agora com a Fottufy",
    getHtml: (userName) => `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <span class="logo-text">\u{1F4F8} Fottufy</span>
            </div>
            
            <h1>${userName}, vamos dar o primeiro passo juntos?</h1>
            
            <p>J\xE1 faz 10 dias que voc\xEA se cadastrou, mas ainda n\xE3o ativou seu plano.</p>
            
            <p>Entendo que mudar de ferramenta d\xE1 trabalho. Mas pense:</p>
            
            <div class="highlight">
              <p>\u{1F4AD} Quanto tempo voc\xEA perde organizando fotos em pastas? Quanto deixa de ganhar por n\xE3o ter uma apresenta\xE7\xE3o profissional?</p>
            </div>
            
            <p>Com a Fottufy voc\xEA ganha:</p>
            
            <div class="feature-list">
              <div class="feature-item">\u23F1\uFE0F Horas economizadas toda semana</div>
              <div class="feature-item">\u{1F4B0} Mais valor percebido pelo cliente</div>
              <div class="feature-item">\u{1F512} Prote\xE7\xE3o total do seu trabalho</div>
              <div class="feature-item">\u{1F31F} Impress\xE3o profissional garantida</div>
            </div>
            
            <div class="stat-box">
              <div class="stat-number">A partir de R$29/m\xEAs</div>
              <div class="stat-label">Menos que um caf\xE9 por dia!</div>
            </div>
            
            <p>Vamos come\xE7ar? Estou aqui para te ajudar!</p>
            
            <p style="text-align: center;">
              <a href="https://fottufy.com/subscription" class="cta-button">Ativar meu plano agora \u2192</a>
            </p>
            
            <div class="footer">
              <p>Fottufy - Seu parceiro na fotografia profissional</p>
              <p style="font-size: 12px; color: #9ca3af;">Se n\xE3o quiser mais receber esses emails, basta assinar qualquer plano ou responder pedindo para sair da lista.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
};
var emailSchedule = {
  1: 1,
  // Email 1 no dia 1
  2: 2,
  // Email 2 no dia 2
  3: 4,
  // Email 3 no dia 4
  4: 6,
  // Email 4 no dia 6
  5: 8,
  // Email 5 no dia 8
  6: 10
  // Email 6 no dia 10
};
function getEmailNumberForDay(daysSinceSignup) {
  for (const [emailNum, dayToSend] of Object.entries(emailSchedule)) {
    if (dayToSend === daysSinceSignup) {
      return parseInt(emailNum);
    }
  }
  return null;
}

// server/routes.ts
import path2 from "path";
init_auth();
import { nanoid as nanoid2 } from "nanoid";
import Stripe from "stripe";
init_db();
init_imageProcessor();
init_sendEmail();
init_welcomeEmail();
import { eq as eq6, and as and2, not as not2, desc as desc3, count as count2, sql as sql3, inArray as inArray3 } from "drizzle-orm";

// server/mercadopago.ts
init_db();
init_schema();
import { Router } from "express";
import { eq as eq3, isNotNull, desc as desc2 } from "drizzle-orm";
import https from "https";
import crypto2 from "crypto";
var isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
var mpRouter = Router();
var MP_CLIENT_ID = process.env.MP_CLIENT_ID || "";
var MP_CLIENT_SECRET = process.env.MP_CLIENT_SECRET || "";
var MP_REDIRECT_URI = process.env.MP_REDIRECT_URI || "";
var PLATFORM_FEE_RATE = 0.03;
var calcFee = (amount) => Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
var oauthStateMap = /* @__PURE__ */ new Map();
function isLoggedIn(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).json({ error: "N\xE3o autenticado" });
    return false;
  }
  return true;
}
function generateOAuthState(userId) {
  const token = crypto2.randomBytes(24).toString("hex");
  oauthStateMap.set(token, { userId, expiresAt: Date.now() + 10 * 60 * 1e3 });
  return token;
}
function consumeOAuthState(token) {
  const entry = oauthStateMap.get(token);
  if (!entry) return null;
  oauthStateMap.delete(token);
  if (Date.now() > entry.expiresAt) return null;
  return entry.userId;
}
function mpPost(path7, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: "api.mercadopago.com",
      path: path7,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => raw += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(new Error("MP response parse error"));
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}
function mpGet(path7, accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.mercadopago.com",
      path: path7,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` }
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => raw += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(new Error("MP response parse error"));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}
mpRouter.get("/api/mp/auth-url", (req, res) => {
  if (!isLoggedIn(req, res)) return;
  if (!MP_CLIENT_ID || !MP_REDIRECT_URI) {
    return res.status(503).json({ error: "Integra\xE7\xE3o com Mercado Pago n\xE3o configurada ainda." });
  }
  const userId = req.user.id;
  const state = generateOAuthState(userId);
  const url = `https://auth.mercadopago.com.br/authorization?client_id=${MP_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(MP_REDIRECT_URI)}&state=${state}`;
  res.json({ url });
});
mpRouter.get("/api/mp/callback", async (req, res) => {
  const { code, state } = req.query;
  if (!code || typeof code !== "string") {
    console.warn("[MP OAuth callback] C\xF3digo de autoriza\xE7\xE3o ausente");
    return res.redirect("/dashboard?mp=error");
  }
  if (!state || typeof state !== "string") {
    console.warn("[MP OAuth callback] State OAuth ausente \u2014 poss\xEDvel CSRF ou link expirado");
    return res.redirect("/dashboard?mp=error");
  }
  const userId = consumeOAuthState(state);
  if (!userId) {
    console.warn("[MP OAuth callback] State inv\xE1lido ou expirado");
    return res.redirect("/dashboard?mp=error");
  }
  if (!MP_CLIENT_ID || !MP_CLIENT_SECRET || !MP_REDIRECT_URI) {
    return res.redirect("/dashboard?mp=error");
  }
  try {
    const token = await mpPost("/oauth/token", {
      client_id: MP_CLIENT_ID,
      client_secret: MP_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: MP_REDIRECT_URI
    });
    if (!token.access_token) {
      console.error("[MP OAuth callback] Token sem access_token:", token);
      return res.redirect("/dashboard?mp=error");
    }
    await db.update(users).set({ mpAccessToken: token.access_token, mpUserId: String(token.user_id) }).where(eq3(users.id, userId));
    console.log(`[MP OAuth callback] Fot\xF3grafo ${userId} conectou conta MP ${token.user_id}`);
    res.redirect("/dashboard?mp=connected");
  } catch (e) {
    console.error("[MP OAuth callback] Erro:", e.message);
    res.redirect("/dashboard?mp=error");
  }
});
mpRouter.get("/api/mp/status", async (req, res) => {
  if (!isLoggedIn(req, res)) return;
  const userId = req.user.id;
  const [user] = await db.select({ mpUserId: users.mpUserId }).from(users).where(eq3(users.id, userId));
  res.json({ connected: !!user?.mpUserId });
});
mpRouter.post("/api/mp/disconnect", async (req, res) => {
  if (!isLoggedIn(req, res)) return;
  const userId = req.user.id;
  await db.update(users).set({ mpAccessToken: null, mpUserId: null }).where(eq3(users.id, userId));
  res.json({ ok: true });
});
mpRouter.get("/api/mp/photographer-status/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!isUUID(projectId)) {
      return res.json({ acceptsPayment: false });
    }
    const [project] = await db.select({ userId: newProjects.userId }).from(newProjects).where(eq3(newProjects.id, projectId));
    if (!project) return res.json({ acceptsPayment: false });
    const [photographer] = await db.select({ mpUserId: users.mpUserId, mpAccessToken: users.mpAccessToken }).from(users).where(eq3(users.id, project.userId));
    res.json({ acceptsPayment: !!(photographer?.mpUserId && photographer?.mpAccessToken) });
  } catch {
    res.json({ acceptsPayment: false });
  }
});
mpRouter.post("/api/mp/webhook", async (req, res) => {
  try {
    const webhookSecret = process.env.MP_WEBHOOK_SECRET || "";
    const isLiveMode = req.body?.live_mode !== false;
    if (webhookSecret && isLiveMode) {
      const xSignature = req.headers["x-signature"];
      const xRequestId = req.headers["x-request-id"];
      const dataId = req.query["data.id"] || req.body?.data?.id;
      if (!xSignature) {
        console.warn("[MP Webhook] Requisi\xE7\xE3o sem x-signature rejeitada");
        return res.sendStatus(401);
      }
      const parts = {};
      for (const part of xSignature.split(";")) {
        const [k, v] = part.split("=");
        if (k && v) parts[k.trim()] = v.trim();
      }
      const manifest = [
        parts.ts ? `ts:${parts.ts}` : null,
        xRequestId ? `x-request-id:${xRequestId}` : null,
        dataId ? `x-data-id:${dataId}` : null
      ].filter(Boolean).join(",");
      const expectedHash = crypto2.createHmac("sha256", webhookSecret).update(manifest).digest("hex");
      if (parts.v1 !== expectedHash) {
        console.warn("[MP Webhook] Assinatura inv\xE1lida rejeitada");
        return res.sendStatus(401);
      }
    }
    const { type, action, data } = req.body;
    if (type === "payment" && data?.id) {
      const mpPaymentId = String(data.id);
      console.log(`[MP Webhook] Notifica\xE7\xE3o recebida: ID=${mpPaymentId} action=${action}`);
      try {
        const [existing] = await db.select({
          id: mpPayments.id,
          status: mpPayments.status,
          projectId: mpPayments.projectId
        }).from(mpPayments).where(eq3(mpPayments.mpPaymentId, mpPaymentId));
        const validStatuses = ["approved", "rejected", "cancelled", "refunded"];
        if (existing && existing.status !== "approved") {
          const [project] = await db.select({ userId: newProjects.userId }).from(newProjects).where(eq3(newProjects.id, existing.projectId));
          let mpStatus = "pending";
          if (project) {
            const [photographer] = await db.select({ mpAccessToken: users.mpAccessToken }).from(users).where(eq3(users.id, project.userId));
            if (photographer?.mpAccessToken) {
              const mpPayment = await mpGet(`/v1/payments/${mpPaymentId}`, photographer.mpAccessToken);
              mpStatus = mpPayment?.status || "pending";
            }
          }
          if (validStatuses.includes(mpStatus)) {
            await db.update(mpPayments).set({ status: mpStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(mpPayments.id, existing.id));
            console.log(`[MP Webhook] Pix ${mpPaymentId} atualizado para: ${mpStatus}`);
          }
        } else if (!existing) {
          const photographers = await db.select({ id: users.id, mpAccessToken: users.mpAccessToken }).from(users).where(isNotNull(users.mpAccessToken));
          for (const photo of photographers) {
            if (!photo.mpAccessToken) continue;
            try {
              const mpPayment = await mpGet(`/v1/payments/${mpPaymentId}`, photo.mpAccessToken);
              if (!mpPayment?.id) continue;
              const projectId = mpPayment.external_reference;
              if (!projectId || !isUUID(projectId)) continue;
              const [project] = await db.select({ userId: newProjects.userId }).from(newProjects).where(eq3(newProjects.id, projectId));
              if (!project || project.userId !== photo.id) continue;
              const amountCents = Math.round((mpPayment.transaction_amount || 0) * 100);
              await db.insert(mpPayments).values({
                projectId,
                mpPaymentId,
                status: mpPayment.status || "pending",
                amount: amountCents,
                payerEmail: mpPayment.payer?.email || null,
                pixCopiaECola: null,
                qrCodeBase64: null
              });
              console.log(`[MP Webhook] Cart\xE3o ${mpPaymentId} salvo no DB: status=${mpPayment.status} projeto=${projectId}`);
              break;
            } catch {
            }
          }
        }
      } catch (dbErr) {
        console.error("[MP Webhook] Erro ao atualizar DB:", dbErr.message);
      }
    }
    res.sendStatus(200);
  } catch (e) {
    console.error("[MP Webhook] Erro:", e.message);
    res.sendStatus(200);
  }
});
mpRouter.post("/api/mp/create-payment", async (req, res) => {
  try {
    const { projectId, amount, description, payerEmail } = req.body;
    const parsedAmount = Number(amount);
    if (!projectId || !amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "projectId e amount v\xE1lido (> 0) s\xE3o obrigat\xF3rios." });
    }
    if (!isUUID(projectId)) {
      return res.status(400).json({ error: "Projeto inv\xE1lido." });
    }
    const [project] = await db.select({ userId: newProjects.userId }).from(newProjects).where(eq3(newProjects.id, projectId));
    if (!project) return res.status(404).json({ error: "Projeto n\xE3o encontrado." });
    const [photographer] = await db.select({ mpAccessToken: users.mpAccessToken, mpUserId: users.mpUserId }).from(users).where(eq3(users.id, project.userId));
    if (!photographer?.mpAccessToken) {
      return res.status(400).json({ error: "Fot\xF3grafo n\xE3o conectou o Mercado Pago." });
    }
    const amountCents = Math.round(parsedAmount * 100);
    const idempotencyKey = `fottufy-${projectId}-${Date.now()}`;
    const paymentBody = {
      transaction_amount: parsedAmount,
      description: description || "Fotos selecionadas \u2014 Fottufy",
      payment_method_id: "pix",
      payer: { email: payerEmail || "cliente@fottufy.com" }
    };
    const mpRes = await new Promise((resolve, reject) => {
      const data = JSON.stringify(paymentBody);
      const options = {
        hostname: "api.mercadopago.com",
        path: "/v1/payments",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
          Authorization: `Bearer ${photographer.mpAccessToken}`,
          "X-Idempotency-Key": idempotencyKey
        }
      };
      const r = https.request(options, (resp) => {
        let raw = "";
        resp.on("data", (chunk) => raw += chunk);
        resp.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch {
            reject(new Error("parse error"));
          }
        });
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
    const [savedPayment] = await db.insert(mpPayments).values({
      projectId,
      mpPaymentId: String(mpRes.id),
      status: mpRes.status || "pending",
      amount: amountCents,
      payerEmail: payerEmail || null,
      pixCopiaECola,
      qrCodeBase64
    }).returning({ id: mpPayments.id });
    res.json({
      internalId: savedPayment.id,
      // ID interno para polling de status
      mpPaymentId: mpRes.id,
      status: mpRes.status,
      pixCopiaECola,
      qrCodeBase64
    });
  } catch (e) {
    console.error("[MP create-payment] Erro:", e.message);
    res.status(500).json({ error: e.message });
  }
});
mpRouter.post("/api/mp/create-preference", async (req, res) => {
  try {
    const { projectId, amount, description } = req.body;
    const parsedAmount = Number(amount);
    if (!projectId || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "Dados inv\xE1lidos." });
    }
    if (!isUUID(projectId)) {
      return res.status(400).json({ error: "Projeto inv\xE1lido." });
    }
    const [project] = await db.select({ userId: newProjects.userId }).from(newProjects).where(eq3(newProjects.id, projectId));
    if (!project) return res.status(404).json({ error: "Projeto n\xE3o encontrado." });
    const [photographer] = await db.select({ mpAccessToken: users.mpAccessToken }).from(users).where(eq3(users.id, project.userId));
    if (!photographer?.mpAccessToken) {
      return res.status(400).json({ error: "Fot\xF3grafo n\xE3o conectou o Mercado Pago." });
    }
    const baseUrl = process.env.NODE_ENV === "production" ? "https://fottufy.com" : `http://localhost:${process.env.PORT || 5e3}`;
    const isPublicHttps = baseUrl.startsWith("https://");
    const preferenceBody = {
      items: [{
        title: description || "Fotos selecionadas \u2014 Fottufy",
        quantity: 1,
        unit_price: parsedAmount,
        currency_id: "BRL"
      }],
      // external_reference permite identificar o projeto no webhook do MP
      external_reference: projectId,
      back_urls: {
        success: `${baseUrl}/project-view/${projectId}?payment=success`,
        failure: `${baseUrl}/project-view/${projectId}?payment=failure`,
        pending: `${baseUrl}/project-view/${projectId}?payment=pending`
      },
      // notification_url garante que o MP notifica nosso webhook mesmo sem config no painel do fotógrafo
      notification_url: "https://fottufy.com/api/mp/webhook",
      // Comissão da plataforma (5%) — vai para a conta MP da Fottufy automaticamente
      marketplace_fee: calcFee(parsedAmount),
      // auto_return exige back_url HTTPS pública — só enviar em produção
      ...isPublicHttps ? { auto_return: "approved" } : {}
    };
    const mpRes = await new Promise((resolve, reject) => {
      const data = JSON.stringify(preferenceBody);
      const options = {
        hostname: "api.mercadopago.com",
        path: "/checkout/preferences",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
          Authorization: `Bearer ${photographer.mpAccessToken}`
        }
      };
      const r = https.request(options, (resp) => {
        let raw = "";
        resp.on("data", (chunk) => raw += chunk);
        resp.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch {
            reject(new Error("parse"));
          }
        });
      });
      r.on("error", reject);
      r.write(data);
      r.end();
    });
    if (!mpRes.id) {
      console.error("[MP create-preference] Resposta sem id:", mpRes);
      return res.status(400).json({ error: mpRes.message || "Erro ao criar prefer\xEAncia." });
    }
    console.log(`[MP create-preference] Prefer\xEAncia criada para projeto ${projectId}: ${mpRes.id}`);
    res.json({ initPoint: mpRes.init_point });
  } catch (e) {
    console.error("[MP create-preference] Erro:", e.message);
    res.status(500).json({ error: e.message });
  }
});
mpRouter.get("/api/mp/project-payment/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: "projectId obrigat\xF3rio." });
    const [payment] = await db.select({
      id: mpPayments.id,
      status: mpPayments.status,
      amount: mpPayments.amount,
      pixCopiaECola: mpPayments.pixCopiaECola,
      qrCodeBase64: mpPayments.qrCodeBase64,
      updatedAt: mpPayments.updatedAt
    }).from(mpPayments).where(eq3(mpPayments.projectId, projectId)).orderBy(desc2(mpPayments.createdAt)).limit(1);
    res.json({ payment: payment ?? null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
mpRouter.get("/api/mp/payment-status/:internalId", async (req, res) => {
  try {
    const { internalId } = req.params;
    if (!isUUID(internalId)) return res.status(400).json({ error: "ID inv\xE1lido." });
    const [payment] = await db.select({ status: mpPayments.status, updatedAt: mpPayments.updatedAt }).from(mpPayments).where(eq3(mpPayments.id, internalId));
    if (!payment) return res.status(404).json({ error: "Pagamento n\xE3o encontrado." });
    res.json({ status: payment.status, updatedAt: payment.updatedAt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// server/routes.ts
import { Readable } from "stream";

// server/utils/passwordReset.ts
init_db();
init_schema();
init_auth();
init_sendEmail();
import { eq as eq4 } from "drizzle-orm";
import { addHours } from "date-fns";
async function generatePasswordResetToken(userId, expiresInMinutes = 60) {
  try {
    const user = await db.select().from(users).where(eq4(users.id, userId)).limit(1);
    if (!user.length) {
      console.error(`Usu\xE1rio ID ${userId} n\xE3o encontrado para gerar token`);
      return null;
    }
    const expiresAt = addHours(/* @__PURE__ */ new Date(), expiresInMinutes / 60);
    const [insertedToken] = await db.insert(passwordResetTokens).values({
      userId,
      expiresAt,
      used: false
    }).returning();
    return insertedToken.token;
  } catch (error) {
    console.error("Erro ao gerar token de redefini\xE7\xE3o de senha:", error);
    return null;
  }
}
async function sendPasswordResetEmail(email, token, isNewUser = false, userName) {
  try {
    const baseUrl = process.env.FRONTEND_URL || "https://fottufy.com";
    const resetLink = isNewUser ? `${baseUrl}/create-password.html?token=${token}` : `${baseUrl}/reset-password.html?token=${token}`;
    const subject = isNewUser ? "\u{1F973} Sua conta foi criada! Crie sua senha para acessar agora" : "Redefini\xE7\xE3o de senha Fottufy";
    const body = isNewUser ? getWelcomeEmailTemplate3(resetLink, userName) : getResetPasswordEmailTemplate(resetLink);
    const result = await sendEmail({
      to: email,
      subject,
      html: body
    });
    return result.success;
  } catch (error) {
    console.error("Erro ao enviar email de redefini\xE7\xE3o de senha:", error);
    return false;
  }
}
async function verifyPasswordResetToken(token) {
  try {
    if (!token.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.error("Token com formato inv\xE1lido:", token.substring(0, 8) + "...");
      return { isValid: false };
    }
    console.log(`Verificando token no banco de dados: ${token.substring(0, 8)}...`);
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq4(passwordResetTokens.token, token)).limit(1);
    if (!resetToken) {
      console.log(`Token n\xE3o encontrado no banco: ${token.substring(0, 8)}...`);
      return { isValid: false };
    }
    if (resetToken.used) {
      console.log(`Token j\xE1 foi usado: ${token.substring(0, 8)}...`);
      return { isValid: false };
    }
    if (/* @__PURE__ */ new Date() > resetToken.expiresAt) {
      console.log(`Token expirado: ${token.substring(0, 8)}..., expirou em ${resetToken.expiresAt}`);
      return { isValid: false };
    }
    console.log(`Token v\xE1lido: ${token.substring(0, 8)}... para usu\xE1rio ID ${resetToken.userId}`);
    return { isValid: true, userId: resetToken.userId };
  } catch (error) {
    console.error("Erro ao verificar token de redefini\xE7\xE3o de senha:", error);
    return { isValid: false };
  }
}
async function resetPasswordWithToken(token, newPassword) {
  try {
    const { isValid, userId } = await verifyPasswordResetToken(token);
    if (!isValid || !userId) {
      return false;
    }
    const hashedPassword = await hashPassword(newPassword);
    await db.update(users).set({ password: hashedPassword }).where(eq4(users.id, userId));
    await db.update(passwordResetTokens).set({ used: true }).where(eq4(passwordResetTokens.token, token));
    return true;
  } catch (error) {
    console.error("Erro ao redefinir senha com token:", error);
    return false;
  }
}
function getWelcomeEmailTemplate3(resetLink, userName) {
  const greeting = userName ? `Bem-vindo(a) ${userName}!` : "Bem-vindo(a) \xE0 Fottufy!";
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cria\xE7\xE3o de senha - Fottufy</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); margin: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://cdn.fottufy.com/assets/logo.png" alt="Fottufy Logo" style="max-width: 150px;">
        </div>
        <h2 style="color: #2a2a2a;">\u{1F389} ${greeting}</h2>
        <p style="font-size: 16px; color: #444;">
          Sua conta foi criada automaticamente ap\xF3s a sua compra. Para ativ\xE1-la e acessar seus projetos, voc\xEA precisa criar sua senha.
        </p>
        <p style="font-size: 16px; color: #444;">Clique no bot\xE3o abaixo para definir sua senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #1d72f3; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
            Criar senha
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">
          Se o bot\xE3o acima n\xE3o funcionar, copie e cole o link abaixo no seu navegador:
        </p>
        <p style="font-size: 14px; color: #666; word-break: break-all;">
          ${resetLink}
        </p>
        <p style="font-size: 14px; color: #888; margin-top: 30px;">
          \u26A0\uFE0F Esse link \xE9 v\xE1lido por 24 horas e pode ser usado apenas uma vez. Se voc\xEA n\xE3o solicitou esse acesso, ignore este e-mail.
        </p>
        <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="font-size: 14px; color: #888; text-align: center;">Equipe Fottufy</p>
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Fottufy. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
  </html>
  `;
}
function getResetPasswordEmailTemplate(resetLink) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefini\xE7\xE3o de Senha Fottufy</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; margin-bottom: 20px; }
      .logo { max-width: 150px; }
      h1 { color: #0056b3; }
      .button { display: inline-block; background-color: #0056b3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
      .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
    </style>
  </head>
  <body>
    <div class="header">
      <img src="https://cdn.fottufy.com/assets/logo.png" alt="Fottufy Logo" class="logo">
    </div>
    
    <h1>Redefini\xE7\xE3o de Senha</h1>
    
    <p>Recebemos uma solicita\xE7\xE3o para redefinir a senha da sua conta Fottufy.</p>
    
    <p>Clique no bot\xE3o abaixo para criar uma nova senha:</p>
    
    <p style="text-align: center;">
      <a href="${resetLink}" class="button">Redefinir minha senha</a>
    </p>
    
    <p>Ou copie e cole este link no seu navegador:</p>
    <p style="word-break: break-all;">${resetLink}</p>
    
    <p><strong>Observa\xE7\xE3o:</strong> Este link \xE9 v\xE1lido por 1 hora. Ap\xF3s esse per\xEDodo, voc\xEA precisar\xE1 solicitar um novo link de redefini\xE7\xE3o de senha.</p>
    
    <p>Se voc\xEA n\xE3o solicitou a redefini\xE7\xE3o de senha, por favor ignore este e-mail.</p>
    
    <div class="footer">
      <p>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Fottufy. Todos os direitos reservados.</p>
      <p>Este \xE9 um e-mail autom\xE1tico, por favor n\xE3o responda.</p>
    </div>
  </body>
  </html>
  `;
}

// server/routes.ts
init_r2();

// server/streamUpload.ts
init_r2();
import * as fs from "fs-extra";
import { createWriteStream, createReadStream } from "fs";
import { stat, unlink, readdir } from "fs/promises";
import * as path from "path";
import { PutObjectCommand as PutObjectCommand2 } from "@aws-sdk/client-s3";
import busboy from "busboy";
import { pipeline } from "stream/promises";
var TMP_DIR = path.join(process.cwd(), "tmp");
fs.ensureDirSync(TMP_DIR);
setInterval(async () => {
  try {
    const now = Date.now();
    const files = await readdir(TMP_DIR);
    for (const file of files) {
      const filePath = path.join(TMP_DIR, file);
      try {
        const { mtimeMs } = await stat(filePath);
        if (now - mtimeMs > 30 * 60 * 1e3) {
          await unlink(filePath);
        }
      } catch {
      }
    }
  } catch (err) {
    console.error("[tmp-cleanup] Erro na limpeza peri\xF3dica:", err);
  }
}, 15 * 60 * 1e3);
async function processAndStreamToR2(filePath, fileName, contentType, _applyWatermark = false) {
  let fileStream = null;
  try {
    fileStream = createReadStream(filePath);
    fileStream.on("error", (err) => {
      console.error(`[R2 stream] Erro ao ler ${fileName}:`, err.message);
      if (fileStream && !fileStream.destroyed) fileStream.destroy();
    });
    await r2Client.send(
      new PutObjectCommand2({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileStream,
        ContentType: contentType
      })
    );
    const cdnBase = process.env.R2_PUBLIC_URL || "https://cdn.fottufy.com";
    return { url: `${cdnBase}/${fileName}`, key: fileName };
  } catch (err) {
    console.error(`[R2 stream] Falha no upload de ${fileName}:`, err instanceof Error ? err.message : err);
    throw err;
  } finally {
    if (fileStream && !fileStream.destroyed) {
      fileStream.destroy();
      fileStream = null;
    }
  }
}
function streamUploadMiddleware(options = {}) {
  const { maxFileSize = 500 * 1024 * 1024 } = options;
  return (req, res, next) => {
    if (!req.is("multipart/form-data")) {
      return next();
    }
    req.files = [];
    let bbError = null;
    const filePromises = [];
    let bb;
    try {
      bb = busboy({
        headers: req.headers,
        limits: { fileSize: maxFileSize }
      });
    } catch (err) {
      return next(err);
    }
    bb.on("field", (fieldname, val) => {
      if (!req.body) req.body = {};
      req.body[fieldname] = val;
    });
    bb.on("file", (fieldname, fileStream, fileInfo) => {
      const { filename, mimeType } = fileInfo;
      fileStream.on("limit", () => {
        console.warn(`[busboy] Arquivo ${filename} excedeu o limite de tamanho e foi truncado`);
        fileStream.resume();
      });
      fileStream.on("error", (err) => {
        console.error(`[busboy] Erro no fileStream de ${filename}:`, err.message);
        if (!fileStream.destroyed) fileStream.destroy();
      });
      const uniqueFilename = generateUniqueFileName(filename);
      const tmpFilePath = path.join(TMP_DIR, uniqueFilename);
      const p = (async () => {
        try {
          const writeStream = createWriteStream(tmpFilePath);
          writeStream.on("error", (err) => {
            console.error(`[busboy] Erro ao gravar ${tmpFilePath}:`, err.message);
          });
          await pipeline(fileStream, writeStream);
          const { size } = await stat(tmpFilePath);
          req.files.push({
            fieldname,
            originalname: filename.normalize("NFC"),
            filename: uniqueFilename,
            mimetype: mimeType,
            path: tmpFilePath,
            size
          });
        } catch (err) {
          console.error(`[busboy] Falha ao processar arquivo ${filename}:`, err instanceof Error ? err.message : err);
          try {
            await unlink(tmpFilePath);
          } catch {
          }
        }
      })();
      filePromises.push(p);
    });
    bb.on("finish", () => {
      Promise.allSettled(filePromises).then(() => {
        if (bbError) return next(bbError);
        next();
      }).catch((err) => next(err));
    });
    bb.on("error", (err) => {
      bbError = err instanceof Error ? err : new Error(String(err));
      console.error("[busboy] Erro global:", bbError.message);
    });
    req.pipe(bb);
  };
}
function cleanupTempFiles(req, res, next) {
  const originalEnd = res.end.bind(res);
  res.end = function(...args) {
    const filesToClean = [...req.files ?? []];
    req.files = [];
    setImmediate(() => {
      Promise.allSettled(
        filesToClean.map(
          (f) => unlink(f.path).catch((err) => {
            if (err.code !== "ENOENT") {
              console.error(`[cleanup] Erro ao remover ${f.path}:`, err.message);
            }
          })
        )
      );
    });
    return originalEnd(...args);
  };
  next();
}

// server/thumbnailQueue.ts
init_r2();
init_db();
init_schema();
import sharp2 from "sharp";
import { GetObjectCommand, PutObjectCommand as PutObjectCommand3 } from "@aws-sdk/client-s3";
import { eq as eq5, sql as sql2 } from "drizzle-orm";
var queue = [];
var isProcessing = false;
async function processNext() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;
  const job = queue.shift();
  try {
    console.log(`[Thumb] Iniciando para ${job.filename} (${queue.length} restantes na fila)`);
    await db.update(photos).set({ processingStatus: "processing" }).where(eq5(photos.id, job.photoId));
    const getRes = await r2Client.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: job.filename
    }));
    if (!getRes.Body) throw new Error("R2: body vazio na resposta");
    const chunks = [];
    for await (const chunk of getRes.Body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    const thumbBuffer = await sharp2(buffer, {
      sequentialRead: true,
      limitInputPixels: 1e8
    }).resize(400, 400, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
    const baseName = job.filename.replace(/\.[^.]+$/, "");
    const thumbFilename = `thumb_${baseName}.jpg`;
    await r2Client.send(new PutObjectCommand3({
      Bucket: BUCKET_NAME,
      Key: thumbFilename,
      Body: thumbBuffer,
      ContentType: "image/jpeg"
    }));
    const cdnBase = process.env.R2_PUBLIC_URL || "https://cdn.fottufy.com";
    const thumbnailUrl = `${cdnBase}/${thumbFilename}`;
    await db.update(photos).set({ thumbnailUrl, processingStatus: "ready" }).where(eq5(photos.id, job.photoId));
    console.log(`[Thumb] \u2705 Gerado: ${thumbFilename}`);
  } catch (err) {
    console.error(`[Thumb] \u274C Erro ao processar ${job.filename}:`, err);
    try {
      await db.update(photos).set({ processingStatus: "error" }).where(eq5(photos.id, job.photoId));
    } catch (_) {
    }
  } finally {
    isProcessing = false;
    setImmediate(processNext);
  }
}
function enqueueThumbnail(job) {
  queue.push(job);
  if (!isProcessing) processNext();
}
async function initThumbnailQueue() {
  try {
    const pending = await db.execute(sql2`
      SELECT p.id, p.filename 
      FROM photos p
      INNER JOIN new_projects np ON np.id::text = p.project_id
      WHERE p.processing_status IN ('pending', 'processing')
        AND p.filename IS NOT NULL
        AND p.filename != ''
    `);
    const rows = pending.rows;
    if (rows.length === 0) {
      console.log("[Thumb] Nenhuma foto V2 pendente encontrada na inicializa\xE7\xE3o.");
      return;
    }
    console.log(`[Thumb] Reenfileirando ${rows.length} foto(s) V2 pendente(s)...`);
    for (const p of rows) {
      enqueueThumbnail({ photoId: p.id, filename: p.filename });
    }
  } catch (err) {
    console.error("[Thumb] Erro ao buscar fotos V2 pendentes:", err);
  }
}

// server/routes.ts
init_hotmart();
var nfc = (s) => s.normalize("NFC");
function getExtensionFromMimeType(mimetype) {
  switch (mimetype) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/gif":
      return ".gif";
    case "image/webp":
      return ".webp";
    default:
      return ".jpg";
  }
}
function isUUID2(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
var authenticate = async (req, res, next) => {
  if (process.env.DEBUG_AUTH === "true" && (req.path.includes("/login") || req.path.includes("/logout"))) {
    console.log(`[AUTH] ${req.method} ${req.path}`);
  }
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  if (req.headers.cookie) {
    if (req.headers.cookie.includes("studio.sid") && req.session && req.sessionID) {
      req.session.reload((err) => {
        if (!err && req.isAuthenticated && req.isAuthenticated()) {
          return next();
        }
      });
    }
    const cookieStr = req.headers.cookie;
    if (cookieStr.includes("user_id=")) {
      let userId = null;
      const userIdIndex = cookieStr.indexOf("user_id=");
      if (userIdIndex >= 0) {
        const valueStart = userIdIndex + 8;
        const valueEnd = cookieStr.indexOf(";", valueStart);
        const valueStr = valueEnd >= 0 ? cookieStr.substring(valueStart, valueEnd) : cookieStr.substring(valueStart);
        userId = parseInt(valueStr);
      }
      if (userId && !isNaN(userId)) {
        storage.getUser(userId).then((user) => {
          if (user) {
            req.login(user, (err) => {
              if (!err) {
                storage.updateUser(user.id, { lastLoginAt: /* @__PURE__ */ new Date() }).catch(() => {
                });
                next();
              }
            });
          }
        }).catch(() => {
        });
        return;
      }
    }
  }
  if (process.env.DEBUG_AUTH === "true") {
    console.log("[AUTH] No authentication found, returning 401");
  }
  return res.status(401).json({
    message: "N\xE3o autorizado"
  });
};
var requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
var requireActiveUser = (req, res, next) => {
  if (!req.user || req.user.status !== "active") {
    return res.status(403).json({ message: "Your account is not active" });
  }
  next();
};
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  app2.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", ts: Date.now() });
  });
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("Chave secreta do Stripe n\xE3o encontrada. As funcionalidades de pagamento n\xE3o funcionar\xE3o corretamente.");
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
  app2.get("/api/r2-proxy/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      if (!filename || filename.includes("/") || filename.includes("..") || filename.includes("\0")) {
        return res.status(400).json({ message: "Nome de arquivo inv\xE1lido" });
      }
      const command = new GetObjectCommand2({ Bucket: BUCKET_NAME, Key: filename });
      const r2Response = await r2Client.send(command);
      if (!r2Response.Body) {
        return res.status(404).json({ message: "Foto n\xE3o encontrada no storage" });
      }
      res.setHeader("Content-Type", r2Response.ContentType || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=604800, immutable");
      if (r2Response.ContentLength) {
        res.setHeader("Content-Length", r2Response.ContentLength);
      }
      const stream = r2Response.Body;
      if (typeof stream.pipe === "function") {
        stream.pipe(res);
      } else {
        const readable = Readable.from(stream);
        readable.pipe(res);
      }
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404 || error.name === "NoSuchKey") {
        return res.status(404).json({ message: "Foto n\xE3o encontrada" });
      }
      console.error("[R2-PROXY] Erro ao servir foto:", error.message);
      res.status(500).json({ message: "Erro ao carregar foto" });
    }
  });
  app2.get("/api/r2/test", async (req, res) => {
    try {
      if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME || !process.env.R2_ACCOUNT_ID) {
        return res.status(500).json({
          status: "error",
          message: "Missing required R2 configuration variables",
          config: {
            hasAccessKey: Boolean(process.env.R2_ACCESS_KEY_ID),
            hasSecretKey: Boolean(process.env.R2_SECRET_ACCESS_KEY),
            hasBucketName: Boolean(process.env.R2_BUCKET_NAME),
            hasAccountId: Boolean(process.env.R2_ACCOUNT_ID)
          }
        });
      }
      const testFileContent = Buffer.from("R2 connection test file - " + (/* @__PURE__ */ new Date()).toISOString());
      const testFileName = `test-${Date.now()}.txt`;
      const result = await uploadFileToR2(
        testFileContent,
        testFileName,
        "text/plain"
      );
      return res.status(200).json({
        status: "success",
        message: "R2 connection successful",
        endpoint: `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.dev/`,
        testFile: {
          url: result.url,
          key: result.key
        }
      });
    } catch (error) {
      console.error("R2 test connection failed:", error);
      return res.status(500).json({
        status: "error",
        message: "R2 connection failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.post("/api/photos/upload", authenticate, streamUploadMiddleware(), cleanupTempFiles, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files were uploaded" });
      }
      const uploadCount = req.files.length;
      const canUpload = await storage.checkUploadLimit(req.user.id, uploadCount);
      if (!canUpload) {
        const user = await storage.getUser(req.user.id);
        const planName = user?.planType || "gratuito";
        const uploadLimit = user?.uploadLimit || 0;
        const usedUploads = user?.usedUploads || 0;
        return res.status(403).json({
          message: "Limite de uploads atingido",
          error: "UPLOAD_LIMIT_REACHED",
          details: `Sua conta ${planName} atingiu o limite de ${uploadLimit} fotos (${usedUploads} utilizadas). Para continuar fazendo uploads, verifique sua assinatura no painel ou entre em contato com nosso suporte.`,
          uploadLimit,
          usedUploads
        });
      }
      const uploadedFiles = [];
      for (const file of req.files) {
        const filename = generateUniqueFileName(nfc(file.originalname));
        try {
          const result = await processAndStreamToR2(
            file.path,
            filename,
            file.mimetype
          );
          uploadedFiles.push({
            originalName: nfc(file.originalname),
            filename,
            size: file.size,
            mimetype: file.mimetype,
            url: result.url,
            // Usar a URL retornada pelo método de streaming
            key: result.key
          });
        } catch (error) {
          console.error(`Error uploading file ${filename} to R2:`, error);
          continue;
        }
      }
      if (uploadedFiles.length > 0) {
        await storage.updateUploadUsage(req.user.id, uploadedFiles.length);
        if (process.env.DEBUG_MEMORY === "true" && typeof global.gc === "function") {
          console.log("[DEBUG] Upload gen\xE9rico finalizado. Agendando global.gc() para daqui 3 minutos...");
          setTimeout(() => {
            try {
              global.gc();
              console.log("[DEBUG] global.gc() executado com sucesso ap\xF3s 3 minutos");
            } catch (err) {
              console.error("[DEBUG] Erro ao executar global.gc():", err);
            }
          }, 3 * 60 * 1e3);
        }
      }
      return res.status(200).json({
        success: true,
        files: uploadedFiles,
        totalUploaded: uploadedFiles.length,
        newUsedUploads: (req.user.usedUploads || 0) + uploadedFiles.length,
        uploadLimit: req.user.uploadLimit
      });
    } catch (error) {
      console.error("Error uploading photos to R2:", error);
      let errorMessage = "Erro interno do servidor durante o upload";
      let errorDetails = "";
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes("network") || errorMsg.includes("connection")) {
          errorMessage = "Problema de conex\xE3o com o servidor de armazenamento";
          errorDetails = "Verifique sua conex\xE3o com a internet e tente novamente";
        } else if (errorMsg.includes("timeout")) {
          errorMessage = "Tempo limite excedido durante o upload";
          errorDetails = "Arquivos muito grandes ou conex\xE3o lenta. Tente com menos fotos por vez";
        } else if (errorMsg.includes("storage") || errorMsg.includes("bucket")) {
          errorMessage = "Problema no sistema de armazenamento";
          errorDetails = "Nosso sistema de arquivos est\xE1 temporariamente indispon\xEDvel";
        } else if (errorMsg.includes("memory") || errorMsg.includes("heap")) {
          errorMessage = "Sobrecarga do sistema durante processamento";
          errorDetails = "Muitas fotos sendo processadas. Aguarde alguns minutos e tente novamente";
        } else if (errorMsg.includes("quota") || errorMsg.includes("limit")) {
          errorMessage = "Limite de conta atingido";
          errorDetails = "Voc\xEA atingiu o limite de uploads do seu plano. Considere fazer upgrade";
        } else {
          errorDetails = error.message;
        }
      }
      return res.status(500).json({
        message: errorMessage,
        details: errorDetails,
        suggestion: "Se o problema persistir, limpe o cache do navegador ou entre em contato com o suporte"
      });
    }
  });
  app2.get("/api/projects/:id/photos/status", async (req, res) => {
    try {
      const projectId = req.params.id;
      const rows = await db.select({
        id: photos.id,
        thumbnailUrl: photos.thumbnailUrl,
        processingStatus: photos.processingStatus
      }).from(photos).where(eq6(photos.projectId, projectId));
      return res.json(rows);
    } catch (err) {
      console.error("[photos/status]", err);
      return res.status(500).json({ message: "Erro ao buscar status das fotos" });
    }
  });
  app2.post("/api/projects/:id/photos/upload", authenticate, streamUploadMiddleware(), cleanupTempFiles, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const projectId = req.params.id;
      const project = await db.query.newProjects.findFirst({
        where: and2(
          eq6(newProjects.id, projectId),
          eq6(newProjects.userId, req.user.id)
        )
      });
      if (!project) {
        return res.status(404).json({ message: "Project not found or unauthorized" });
      }
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files were uploaded" });
      }
      const uploadCount = req.files.length;
      const canUpload = await storage.checkUploadLimit(req.user.id, uploadCount);
      if (!canUpload) {
        const user = await storage.getUser(req.user.id);
        const planName = user?.planType || "gratuito";
        const uploadLimit = user?.uploadLimit || 0;
        const usedUploads = user?.usedUploads || 0;
        return res.status(403).json({
          message: "Limite de uploads atingido",
          error: "UPLOAD_LIMIT_REACHED",
          details: `Sua conta ${planName} atingiu o limite de ${uploadLimit} fotos (${usedUploads} utilizadas). Para continuar fazendo uploads, verifique sua assinatura no painel ou entre em contato com nosso suporte.`,
          uploadLimit,
          usedUploads
        });
      }
      const uploadedFiles = [];
      const newPhotos = [];
      for (const file of req.files) {
        const filename = generateUniqueFileName(nfc(file.originalname));
        try {
          const originalName = nfc(file.originalname);
          const fileSize = file.size;
          const fileMimetype = file.mimetype;
          const result = await processAndStreamToR2(
            file.path,
            filename,
            fileMimetype
          );
          try {
            const newPhoto = await db.insert(photos).values({
              projectId,
              url: result.url,
              filename,
              originalName,
              selected: false,
              processingStatus: "pending"
            }).returning();
            if (newPhoto && newPhoto[0]) {
              newPhotos.push(newPhoto[0]);
              enqueueThumbnail({ photoId: newPhoto[0].id, filename });
            }
          } catch (dbError) {
            console.error(`Error adding photo to database: ${filename}`);
          }
          uploadedFiles.push({
            originalName,
            filename,
            size: fileSize,
            url: result.url
          });
        } catch (uploadError) {
          console.error(`Error uploading file ${filename} to R2:`, uploadError);
          continue;
        }
      }
      if (uploadedFiles.length > 0) {
        await storage.updateUploadUsage(req.user.id, uploadedFiles.length);
        if (process.env.DEBUG_MEMORY === "true" && typeof global.gc === "function") {
          console.log("[DEBUG] Upload finalizado. Agendando global.gc() para daqui 3 minutos...");
          setTimeout(() => {
            try {
              global.gc();
              console.log("[DEBUG] global.gc() executado com sucesso ap\xF3s 3 minutos");
            } catch (err) {
              console.error("[DEBUG] Erro ao executar global.gc():", err);
            }
          }, 3 * 60 * 1e3);
        }
      }
      return res.status(200).json({
        success: true,
        files: uploadedFiles,
        photos: newPhotos,
        totalUploaded: uploadedFiles.length,
        projectId,
        newUsedUploads: (req.user.usedUploads || 0) + uploadedFiles.length,
        uploadLimit: req.user.uploadLimit
      });
    } catch (error) {
      console.error("Error uploading photos to project:", error);
      let errorMessage = "Erro ao adicionar fotos ao projeto";
      let errorDetails = "";
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes("not found") || errorMsg.includes("unauthorized")) {
          errorMessage = "Projeto n\xE3o encontrado ou sem permiss\xE3o";
          errorDetails = "Verifique se o projeto ainda existe e se voc\xEA tem acesso a ele";
        } else if (errorMsg.includes("network") || errorMsg.includes("connection")) {
          errorMessage = "Problema de conex\xE3o durante o upload";
          errorDetails = "Verifique sua conex\xE3o com a internet e tente novamente";
        } else if (errorMsg.includes("storage") || errorMsg.includes("bucket")) {
          errorMessage = "Erro no sistema de armazenamento";
          errorDetails = "Nosso servidor de arquivos est\xE1 temporariamente indispon\xEDvel";
        } else if (errorMsg.includes("quota") || errorMsg.includes("limit")) {
          errorMessage = "Limite de uploads atingido";
          errorDetails = "Voc\xEA atingiu o limite do seu plano. Considere fazer upgrade para continuar";
        } else if (errorMsg.includes("timeout")) {
          errorMessage = "Tempo limite excedido";
          errorDetails = "Upload muito lento. Tente com menos fotos ou verifique sua conex\xE3o";
        } else {
          errorDetails = error.message;
        }
      }
      return res.status(500).json({
        message: errorMessage,
        details: errorDetails,
        suggestion: "Tente recarregar a p\xE1gina ou limpar o cache do navegador"
      });
    }
  });
  app2.get("/api/v2/projects", authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const projects2 = await db.query.newProjects.findMany({
        where: eq6(newProjects.userId, req.user.id)
      });
      const projectsWithCounts = await Promise.all(
        projects2.map(async (project) => {
          const photoCountResult = await db.select({ count: count2() }).from(photos).where(eq6(photos.projectId, project.id));
          const photoCount = photoCountResult[0]?.count || 0;
          const selectedCountResult = await db.select({ count: count2() }).from(photos).where(and2(
            eq6(photos.projectId, project.id),
            eq6(photos.selected, true)
          ));
          const selectedCount = selectedCountResult[0]?.count || 0;
          return {
            ...project,
            photoCount,
            selectedCount
            // Não incluímos o array 'photos' aqui para economizar memória
          };
        })
      );
      res.json(projectsWithCounts);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects", error: error.message });
    }
  });
  app2.post("/api/v2/projects", authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { title, description, eventDate, contractedPhotos, additionalPhotoPrice } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Project title is required" });
      }
      const newProject = await db.insert(newProjects).values({
        userId: req.user.id,
        title,
        description: description || null,
        eventDate: eventDate || null,
        contractedPhotos: contractedPhotos ? parseInt(contractedPhotos) || 0 : 0,
        additionalPhotoPrice: additionalPhotoPrice ? parseInt(additionalPhotoPrice) || 0 : 0
      }).returning();
      res.status(201).json(newProject[0]);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project", error: error.message });
    }
  });
  app2.get("/api/v2/projects/:id", authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const projectId = req.params.id;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 100;
      const offset = (page - 1) * pageSize;
      const project = await db.query.newProjects.findFirst({
        where: and2(
          eq6(newProjects.id, projectId),
          eq6(newProjects.userId, req.user.id)
        )
      });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const totalPhotosResult = await db.select({ count: count2() }).from(photos).where(eq6(photos.projectId, projectId));
      const totalPhotos = totalPhotosResult[0]?.count || 0;
      const totalPages = Math.ceil(totalPhotos / pageSize);
      const projectPhotos = await db.select().from(photos).where(eq6(photos.projectId, projectId)).limit(pageSize).offset(offset);
      const projectWithPhotos = {
        ...project,
        photos: projectPhotos,
        pagination: {
          page,
          pageSize,
          totalItems: totalPhotos,
          totalPages
        }
      };
      res.json(projectWithPhotos);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project", error: error.message });
    }
  });
  app2.post("/api/v2/photos", authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { projectId, url } = req.body;
      if (!projectId || !url) {
        return res.status(400).json({ message: "Project ID and photo URL are required" });
      }
      const project = await db.query.newProjects.findFirst({
        where: and2(
          eq6(newProjects.id, projectId),
          eq6(newProjects.userId, req.user.id)
        )
      });
      if (!project) {
        return res.status(404).json({ message: "Project not found or unauthorized" });
      }
      const newPhoto = await db.insert(photos).values({
        projectId,
        url,
        selected: false
      }).returning();
      res.status(201).json(newPhoto[0]);
    } catch (error) {
      console.error("Error adding photo:", error);
      res.status(500).json({ message: "Failed to add photo", error: error.message });
    }
  });
  app2.patch("/api/v2/photos/:id/select", authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const photoId = req.params.id;
      const { selected } = req.body;
      const photo = await db.query.photos.findFirst({
        where: eq6(photos.id, photoId),
        with: {
          project: true
        }
      });
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      if (photo.project.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this photo" });
      }
      const updatedPhoto = await db.update(photos).set({ selected: selected === void 0 ? !photo.selected : !!selected }).where(eq6(photos.id, photoId)).returning();
      res.json(updatedPhoto[0]);
    } catch (error) {
      console.error("Error updating photo selection:", error);
      res.status(500).json({ message: "Failed to update photo selection", error: error.message });
    }
  });
  app2.delete("/api/v2/photos/:id", authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const photoId = req.params.id;
      const userId = req.user.id;
      const photo = await db.query.photos.findFirst({
        where: eq6(photos.id, photoId),
        with: {
          project: true
        }
      });
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      if (photo.project.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to this photo" });
      }
      await db.delete(photos).where(eq6(photos.id, photoId));
      await storage.updateUploadUsage(userId, -1);
      if (process.env.DEBUG_UPLOAD === "true") {
        console.log(`Updated upload usage for user ${userId} after deleting photo ${photoId}`);
      }
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Failed to delete photo", error: error.message });
    }
  });
  app2.patch("/api/v2/photos/select", authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { projectId, photoIds } = req.body;
      if (!projectId || !Array.isArray(photoIds)) {
        return res.status(400).json({ message: "Project ID and array of photo IDs are required" });
      }
      if (process.env.DEBUG_SELECTION === "true") {
        console.log(`Salvando sele\xE7\xE3o para projeto ${projectId} com ${photoIds.length} fotos`);
      }
      if (isUUID2(projectId)) {
        const newProject = await db.query.newProjects.findFirst({
          where: eq6(newProjects.id, projectId)
        });
        if (!newProject) {
          return res.status(404).json({ message: "Project not found" });
        }
        if (newProject.userId !== req.user.id && req.user.role !== "admin") {
          return res.status(403).json({ message: "You don't have permission to access this project" });
        }
        if (photoIds.length === 0) {
          return res.status(200).json({ message: "No selections to update", selectedCount: 0 });
        }
        await db.update(photos).set({ selected: true }).where(and2(eq6(photos.projectId, projectId), inArray3(photos.id, photoIds)));
        await db.update(photos).set({ selected: false }).where(and2(eq6(photos.projectId, projectId), not2(inArray3(photos.id, photoIds))));
        return res.status(200).json({ message: "Selections saved successfully", selectedCount: photoIds.length });
      }
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (project.photographerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to access this project" });
      }
      try {
        await storage.updateProjectSelections(projectId, photoIds);
        console.log(`Sele\xE7\xF5es atualizadas com sucesso para o projeto ${projectId}`);
        res.status(200).json({
          message: "Selections saved successfully",
          selectedCount: photoIds.length
        });
      } catch (error) {
        console.error("Erro ao atualizar sele\xE7\xF5es:", error);
        res.status(500).json({
          message: "Failed to update selections",
          error: error.message
        });
      }
    } catch (error) {
      console.error("Error saving selections:", error);
      res.status(500).json({
        message: "Failed to save selections",
        error: error.message
      });
    }
  });
  app2.post("/api/projects/:projectId/add-photos", r2Upload.array("photos", 1e4), async (req, res) => {
    try {
      const projectId = req.params.projectId;
      console.log(`[Batch Upload] Adicionando fotos ao projeto ${projectId}`);
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const uploadedFiles = req.files;
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ message: "No photos provided" });
      }
      console.log(`[Batch Upload] Processando ${uploadedFiles.length} fotos para o projeto ${projectId}`);
      let successCount = 0;
      const newPhotos = [];
      for (const file of uploadedFiles) {
        try {
          const filename = generateUniqueFileName(nfc(file.originalname));
          const result = await processAndStreamToR2(
            file.path,
            filename,
            file.mimetype
          );
          const newPhoto = await db.insert(photos).values({
            projectId,
            url: result.url,
            filename,
            selected: false
          }).returning();
          if (newPhoto && newPhoto[0]) {
            newPhotos.push(newPhoto[0].id);
            successCount++;
          }
        } catch (uploadError) {
          console.error(`[Batch Upload] Erro ao processar arquivo ${nfc(file.originalname)}:`, uploadError);
        }
      }
      if (successCount > 0) {
        await storage.updateUploadUsage(project.photographerId, successCount);
        console.log(`[Batch Upload] Atualizou contagem de uploads do usu\xE1rio ${project.photographerId}: +${successCount}`);
      }
      if (uploadedFiles && uploadedFiles.length > 0) {
        await cleanupTempFiles(uploadedFiles);
      }
      console.log(`[Batch Upload] Conclu\xEDdo: ${successCount}/${uploadedFiles.length} fotos adicionadas ao projeto ${projectId}`);
      res.status(200).json({
        message: "Photos added successfully",
        count: successCount,
        totalRequested: uploadedFiles.length,
        projectId
      });
    } catch (error) {
      console.error("[Batch Upload] Erro ao adicionar fotos:", error);
      let errorMessage = "Erro durante upload em lote";
      let errorDetails = "";
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes("not found") || errorMsg.includes("project")) {
          errorMessage = "Projeto n\xE3o encontrado";
          errorDetails = "O projeto foi removido ou voc\xEA n\xE3o tem mais acesso a ele";
        } else if (errorMsg.includes("authentication") || errorMsg.includes("unauthorized")) {
          errorMessage = "Sess\xE3o expirada";
          errorDetails = "Fa\xE7a login novamente para continuar o upload";
        } else if (errorMsg.includes("storage") || errorMsg.includes("bucket") || errorMsg.includes("r2")) {
          errorMessage = "Problema no servidor de arquivos";
          errorDetails = "Sistema de armazenamento temporariamente indispon\xEDvel";
        } else if (errorMsg.includes("memory") || errorMsg.includes("heap")) {
          errorMessage = "Sobrecarga do sistema";
          errorDetails = "Muitas fotos sendo processadas. Aguarde e tente com menos fotos";
        } else if (errorMsg.includes("quota") || errorMsg.includes("limit")) {
          errorMessage = "Limite de uploads excedido";
          errorDetails = "Voc\xEA atingiu o limite do seu plano atual";
        } else if (errorMsg.includes("timeout")) {
          errorMessage = "Tempo limite excedido";
          errorDetails = "Upload muito lento. Tente com menos fotos por vez";
        } else {
          errorDetails = error.message;
        }
      }
      res.status(500).json({
        message: errorMessage,
        details: errorDetails,
        suggestion: "Recarregue a p\xE1gina e tente novamente com menos fotos"
      });
    }
  });
  app2.get("/api/admin/users", authenticate, requireAdmin, async (req, res) => {
    try {
      const planType = req.query.planType;
      const status = req.query.status;
      const isDelinquent = req.query.isDelinquent === "true";
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      let users2 = await storage.getUsers();
      if (planType) {
        users2 = users2.filter((user) => user.planType === planType);
      }
      if (status) {
        users2 = users2.filter((user) => user.status === status);
      }
      if (isDelinquent) {
        users2 = users2.filter(
          (user) => user.subscriptionStatus === "inactive" || user.subscriptionStatus === "canceled"
        );
      }
      if (startDate) {
        const start = new Date(startDate);
        users2 = users2.filter((user) => new Date(user.createdAt) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        users2 = users2.filter((user) => new Date(user.createdAt) <= end);
      }
      const sanitizedUsers = users2.map((user) => ({
        ...user,
        password: void 0
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error retrieving users:", error);
      res.status(500).json({ message: "Failed to retrieve users" });
    }
  });
  app2.get("/api/admin/users/counts-by-plan", authenticate, requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getUsers();
      const planCounts = {};
      users2.forEach((user) => {
        const planType = user.planType || "unknown";
        if (planCounts[planType]) {
          planCounts[planType]++;
        } else {
          planCounts[planType] = 1;
        }
      });
      res.json(planCounts);
    } catch (error) {
      console.error("Error retrieving plan counts:", error);
      res.status(500).json({ message: "Failed to retrieve plan counts" });
    }
  });
  app2.get("/api/admin/projects", authenticate, requireAdmin, async (req, res) => {
    try {
      const result = await db.execute(`
        SELECT 
          p.id,
          p.public_id,
          p.name,
          p.client_name,
          p.photographer_id,
          p.status,
          p.created_at,
          COALESCE((SELECT COUNT(*) FROM photos ph WHERE ph.project_id = p.public_id), 0) as photo_count,
          EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400 as days_old,
          u.email,
          u.status as user_status,
          u.plan_type
        FROM projects p
        LEFT JOIN users u ON p.photographer_id = u.id
        ORDER BY photo_count DESC, p.created_at DESC
      `);
      const projectsWithStats = result.rows.map((row) => ({
        id: row.id,
        publicId: row.public_id,
        projectViewId: `project-view/${row.id}`,
        name: row.name,
        clientName: row.client_name,
        photographerId: row.photographer_id,
        status: row.status,
        createdAt: row.created_at,
        photoCount: parseInt(row.photo_count),
        daysOld: Math.ceil(parseFloat(row.days_old)),
        userEmail: row.email,
        userStatus: row.user_status,
        userPlanType: row.plan_type
      }));
      res.json(projectsWithStats);
    } catch (error) {
      console.error("Error retrieving projects:", error);
      res.status(500).json({ message: "Failed to retrieve projects" });
    }
  });
  app2.get("/api/users", authenticate, requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getUsers();
      const sanitizedUsers = users2.map((user) => ({
        ...user,
        password: void 0
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve users" });
    }
  });
  app2.post("/api/admin/set-plan", authenticate, requireAdmin, async (req, res) => {
    try {
      const { email, planType } = req.body;
      if (!email || !planType) {
        return res.status(400).json({ message: "Email and plan type are required" });
      }
      const validPlans = Object.values(SUBSCRIPTION_PLANS).map((plan) => plan.type);
      if (!validPlans.includes(planType)) {
        return res.status(400).json({ message: "Invalid plan type" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const planConfig = Object.values(SUBSCRIPTION_PLANS).find((plan) => plan.type === planType);
      const uploadLimit = planConfig ? planConfig.uploadLimit : 0;
      const updatedUser = await storage.updateUser(user.id, {
        planType,
        uploadLimit,
        subscriptionStatus: "active",
        subscriptionStartDate: /* @__PURE__ */ new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
        // 30 days from now
      });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      res.json({
        success: true,
        user: {
          ...updatedUser,
          password: void 0
        }
      });
    } catch (error) {
      console.error("Error setting plan:", error);
      res.status(500).json({ message: "Failed to set plan for user" });
    }
  });
  app2.post("/api/admin/set-access-time", authenticate, requireAdmin, async (req, res) => {
    try {
      const { email, days } = req.body;
      if (!email || !days) {
        return res.status(400).json({ message: "Email and days are required" });
      }
      const daysNumber = parseInt(days);
      if (isNaN(daysNumber) || daysNumber <= 0) {
        return res.status(400).json({ message: "Days must be a positive number" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const expirationDate = new Date(Date.now() + daysNumber * 24 * 60 * 60 * 1e3);
      const updatedUser = await storage.updateUser(user.id, {
        subscriptionEndDate: expirationDate,
        subscriptionStatus: "active",
        subscriptionStartDate: /* @__PURE__ */ new Date()
      });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      res.json({
        success: true,
        user: {
          ...updatedUser,
          password: void 0
        },
        expiresAt: expirationDate,
        daysGranted: daysNumber
      });
    } catch (error) {
      console.error("Error setting access time:", error);
      res.status(500).json({ message: "Failed to set access time for user" });
    }
  });
  app2.post("/api/admin/set-billing-period", authenticate, requireAdmin, async (req, res) => {
    try {
      const { email, billingPeriod } = req.body;
      if (!email || !billingPeriod) {
        return res.status(400).json({ message: "Email and billingPeriod are required" });
      }
      if (!["monthly", "yearly"].includes(billingPeriod)) {
        return res.status(400).json({ message: "billingPeriod must be 'monthly' or 'yearly'" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUser(user.id, {
        billingPeriod
      });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      console.log(`[ADMIN] Billing period updated for ${email}: ${billingPeriod}`);
      res.json({
        success: true,
        user: {
          ...updatedUser,
          password: void 0
        },
        billingPeriod,
        hasPortfolioAccess: billingPeriod === "yearly"
      });
    } catch (error) {
      console.error("Error setting billing period:", error);
      res.status(500).json({ message: "Failed to set billing period for user" });
    }
  });
  app2.post("/api/admin/activate-manual-plan", authenticate, requireAdmin, async (req, res) => {
    try {
      const { email, planType } = req.body;
      const adminEmail = req.user?.email;
      if (!email || !planType) {
        return res.status(400).json({ message: "Email and plan type are required" });
      }
      if (!adminEmail) {
        return res.status(401).json({ message: "Admin email not found" });
      }
      const validPlans = ["basic_v2", "photographer_v2", "studio_v2"];
      if (!validPlans.includes(planType)) {
        return res.status(400).json({ message: "Invalid plan type. Valid plans: basic_v2, photographer_v2, studio_v2" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.activateManualPlan(user.id, planType, adminEmail);
      res.json({
        success: true,
        message: `Plan ${planType} manually activated for user ${email}`,
        expirationNote: "This plan will expire in 34 days unless payment is made via Hotmart",
        activatedBy: adminEmail,
        activationDate: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error activating manual plan:", error);
      res.status(500).json({ message: "Failed to activate manual plan" });
    }
  });
  app2.post("/api/admin/reset-user-password", authenticate, requireAdmin, async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      const adminEmail = req.user?.email;
      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }
      if (!adminEmail) {
        return res.status(401).json({ message: "Admin email not found" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.resetUserPasswordByAdmin(user.id, newPassword, adminEmail);
      res.json({
        success: true,
        message: `Password successfully reset for user ${email}`,
        resetBy: adminEmail,
        resetDate: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error resetting user password:", error);
      res.status(500).json({ message: "Failed to reset user password" });
    }
  });
  app2.post("/api/admin/impersonate/:userId", authenticate, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      req.session.adminOriginalId = req.user.id;
      req.login(targetUser, (err) => {
        if (err) {
          console.error("[IMPERSONATE] Error logging in as user:", err);
          return res.status(500).json({ message: "Failed to impersonate user" });
        }
        console.log(`[IMPERSONATE] Admin impersonated user ${targetUser.email} (id=${targetUser.id})`);
        res.json({ success: true, user: { id: targetUser.id, name: targetUser.name, email: targetUser.email } });
      });
    } catch (error) {
      console.error("[IMPERSONATE] Error:", error);
      res.status(500).json({ message: "Failed to impersonate user" });
    }
  });
  app2.post("/api/admin/toggle-user", authenticate, requireAdmin, async (req, res) => {
    try {
      const { email, status } = req.body;
      if (!email || !status) {
        return res.status(400).json({ message: "Email and status are required" });
      }
      if (!["active", "suspended", "canceled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUser(user.id, { status });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user status" });
      }
      res.json({
        success: true,
        user: {
          ...updatedUser,
          password: void 0
        }
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      res.status(500).json({ message: "Failed to toggle user status" });
    }
  });
  app2.post("/api/admin/add-user", authenticate, requireAdmin, async (req, res) => {
    try {
      const { name, email, password, role, planType } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const userRole = role === "admin" ? "admin" : "photographer";
      let uploadLimit = 0;
      let userPlanType = planType || "free";
      const planConfig = Object.values(SUBSCRIPTION_PLANS).find((plan) => plan.type === userPlanType);
      if (planConfig) {
        uploadLimit = planConfig.uploadLimit;
      } else {
        userPlanType = "free";
        const freePlan = Object.values(SUBSCRIPTION_PLANS).find((plan) => plan.type === "free");
        uploadLimit = freePlan ? freePlan.uploadLimit : 10;
      }
      const newUser = await storage.createUser({
        name,
        email,
        password,
        phone: "",
        // Campo obrigatório, usar string vazia como padrão
        role: userRole,
        status: "active",
        planType: userPlanType,
        subscriptionStatus: userPlanType === "free" ? "inactive" : "active"
      });
      const updatedUser = await storage.updateUser(newUser.id, {
        uploadLimit,
        subscriptionStartDate: userPlanType === "free" ? void 0 : /* @__PURE__ */ new Date(),
        subscriptionEndDate: userPlanType === "free" ? void 0 : new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
      });
      res.status(201).json({
        success: true,
        user: {
          ...updatedUser || newUser,
          password: void 0
        }
      });
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({ message: "Failed to add user" });
    }
  });
  app2.post("/api/admin/process-expired-subscriptions", authenticate, requireAdmin, async (req, res) => {
    try {
      console.log(`[EXPIRED-ADMIN] Verifica\xE7\xE3o de assinaturas vencidas iniciada por admin: ${req.user?.email}`);
      const expiredUsers = await storage.getUsersWithExpiredSubscriptionsNeedsDowngrade();
      if (expiredUsers.length === 0) {
        return res.json({
          success: true,
          message: "Nenhum usu\xE1rio com assinatura vencida encontrado",
          usersProcessed: 0,
          details: []
        });
      }
      const details = expiredUsers.map((user) => {
        const daysSinceExpiry = Math.floor(
          ((/* @__PURE__ */ new Date()).getTime() - new Date(user.subscriptionEndDate).getTime()) / (1e3 * 60 * 60 * 24)
        );
        return {
          email: user.email,
          planType: user.planType,
          subscriptionEndDate: user.subscriptionEndDate,
          daysSinceExpiry,
          subscriptionStatus: user.subscriptionStatus,
          lastEvent: user.lastEvent
        };
      });
      const processedCount = await storage.processExpiredSubscriptionsWithoutPayment();
      res.json({
        success: true,
        message: `Processamento conclu\xEDdo: ${processedCount} usu\xE1rios convertidos para plano gratuito`,
        usersFound: expiredUsers.length,
        usersProcessed: processedCount,
        details
      });
    } catch (error) {
      console.error("Erro ao processar assinaturas vencidas:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao processar assinaturas vencidas"
      });
    }
  });
  app2.get("/api/admin/expired-subscriptions-preview", authenticate, requireAdmin, async (req, res) => {
    try {
      console.log(`[EXPIRED-PREVIEW] Visualiza\xE7\xE3o de assinaturas vencidas solicitada por admin: ${req.user?.email}`);
      const expiredUsers = await storage.getUsersWithExpiredSubscriptionsNeedsDowngrade();
      const preview = expiredUsers.map((user) => {
        const daysSinceExpiry = Math.floor(
          ((/* @__PURE__ */ new Date()).getTime() - new Date(user.subscriptionEndDate).getTime()) / (1e3 * 60 * 60 * 24)
        );
        return {
          email: user.email,
          name: user.name,
          planType: user.planType,
          subscriptionEndDate: user.subscriptionEndDate,
          daysSinceExpiry,
          subscriptionStatus: user.subscriptionStatus,
          isManualActivation: user.isManualActivation,
          lastEvent: user.lastEvent ? {
            type: user.lastEvent.type,
            timestamp: user.lastEvent.timestamp
          } : null
        };
      });
      res.json({
        success: true,
        count: expiredUsers.length,
        users: preview
      });
    } catch (error) {
      console.error("Erro ao buscar preview de assinaturas vencidas:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao buscar assinaturas vencidas"
      });
    }
  });
  app2.post("/api/admin/stripe-sync/:userId", authenticate, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ success: false, message: "userId inv\xE1lido" });
      }
      if (!stripe) {
        return res.status(500).json({ success: false, message: "Stripe n\xE3o configurado" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (!user.stripeCustomerId) {
        return res.status(400).json({
          success: false,
          message: "Usu\xE1rio n\xE3o tem stripeCustomerId \u2014 nunca comprou via Stripe",
          userId,
          email: user.email
        });
      }
      const activeSubscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 10
      });
      const planLimits = {
        "basico": 6e3,
        "fotografo": 17e3,
        "estudio": 4e4
      };
      if (activeSubscriptions.data.length > 0) {
        const activeSub = activeSubscriptions.data[0];
        const planType = activeSub.metadata?.planType || user.planType || "basico";
        const billingCycle = activeSub.metadata?.billingCycle || "monthly";
        const uploadLimit = planLimits[planType] || 6e3;
        console.log(`[Stripe-Sync] current_period_start raw: ${activeSub.current_period_start} (type: ${typeof activeSub.current_period_start})`);
        console.log(`[Stripe-Sync] current_period_end raw: ${activeSub.current_period_end} (type: ${typeof activeSub.current_period_end})`);
        const startTs = activeSub.current_period_start;
        const endTs = activeSub.current_period_end;
        const startDate = typeof startTs === "number" && isFinite(startTs) && startTs > 0 ? new Date(startTs * 1e3) : null;
        const endDate = typeof endTs === "number" && isFinite(endTs) && endTs > 0 ? new Date(endTs * 1e3) : null;
        console.log(`[Stripe-Sync] startDate: ${startDate} | endDate: ${endDate}`);
        console.log(`[Stripe-Sync] planType: ${planType} | billingCycle: ${billingCycle} | uploadLimit: ${uploadLimit}`);
        const updatePayload = {
          planType,
          uploadLimit,
          subscriptionStatus: "active",
          billingPeriod: billingCycle,
          stripeSubscriptionId: activeSub.id
        };
        if (startDate) updatePayload.subscriptionStartDate = startDate;
        if (endDate) updatePayload.subscriptionEndDate = endDate;
        const updatedUser = await storage.updateUser(userId, updatePayload);
        if (!updatedUser) {
          console.error(`[Stripe-Sync] \u274C updateUser retornou undefined para userId ${userId}`);
          return res.status(500).json({ success: false, message: "Falha ao atualizar usu\xE1rio no banco" });
        }
        console.log(`[Stripe-Sync] Admin ${req.user?.email} sincronizou usu\xE1rio ${userId} (${user.email}) \u2192 plano ${planType} ativo`);
        return res.json({
          success: true,
          action: "activated",
          message: `Plano ${planType} ativado com sucesso`,
          userId,
          email: user.email,
          planType,
          subscriptionId: activeSub.id,
          subscriptionEndDate: endDate,
          totalActiveSubscriptions: activeSubscriptions.data.length
        });
      } else {
        const recentInvoices = await stripe.invoices.list({
          customer: user.stripeCustomerId,
          limit: 5
        });
        const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1e3) / 1e3);
        const recentPaidInvoice = recentInvoices.data.find(
          (inv) => inv.status === "paid" && inv.created > thirtyDaysAgo
        );
        if (recentPaidInvoice) {
          return res.json({
            success: false,
            action: "manual_required",
            message: "Usu\xE1rio pagou nos \xFAltimos 30 dias mas n\xE3o tem assinatura ativa. Verifique no painel do Stripe e ative manualmente se necess\xE1rio.",
            userId,
            email: user.email,
            currentPlan: user.planType,
            currentStatus: user.subscriptionStatus,
            lastPaidInvoice: {
              id: recentPaidInvoice.id,
              amount: recentPaidInvoice.amount_paid / 100,
              date: new Date(recentPaidInvoice.created * 1e3)
            }
          });
        }
        if (user.subscriptionStatus === "active" && user.planType !== "free") {
          await storage.updateUser(userId, {
            planType: "free",
            uploadLimit: 10,
            subscriptionStatus: "inactive",
            stripeSubscriptionId: null,
            subscriptionEndDate: null
          });
          console.log(`[Stripe-Sync] Admin ${req.user?.email} sincronizou usu\xE1rio ${userId} (${user.email}) \u2192 rebaixado para gratuito (sem assinatura ativa no Stripe)`);
          return res.json({
            success: true,
            action: "deactivated",
            message: "Sem assinatura ativa no Stripe. Plano rebaixado para gratuito.",
            userId,
            email: user.email
          });
        }
        return res.json({
          success: true,
          action: "no_change",
          message: "Nenhuma mudan\xE7a necess\xE1ria \u2014 usu\xE1rio j\xE1 est\xE1 sem plano ativo e sem assinatura no Stripe",
          userId,
          email: user.email,
          currentPlan: user.planType,
          currentStatus: user.subscriptionStatus
        });
      }
    } catch (error) {
      console.error("[Stripe-Sync] Erro ao sincronizar usu\xE1rio:", error);
      res.status(500).json({ success: false, message: "Erro ao sincronizar com Stripe", error: error.message });
    }
  });
  app2.get("/api/users/:id", authenticate, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (req.user && req.user.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to access this user" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve user" });
    }
  });
  app2.get("/api/user/stats", authenticate, async (req, res) => {
    let responseSent = false;
    try {
      if (!req.user) {
        if (!responseSent) {
          responseSent = true;
          return res.status(401).json({ message: "Authentication required" });
        }
        return;
      }
      const userId = req.user.id;
      const userProjects = await storage.getProjects(userId);
      const activeProjects = userProjects.filter(
        (project) => project.status !== "arquivado"
      ).length;
      const currentDate = /* @__PURE__ */ new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      let photosThisMonth = 0;
      userProjects.forEach((project) => {
        const projectDate = new Date(project.createdAt);
        if (projectDate >= firstDayOfMonth) {
          const photoCount = project.photos ? project.photos.length : 0;
          photosThisMonth += photoCount;
        }
      });
      const averagePhotoSizeMB = 2;
      const totalUploadUsageMB = userProjects.reduce((total, project) => {
        const photoCount = project.photos ? project.photos.length : 0;
        return total + photoCount * averagePhotoSizeMB;
      }, 0);
      const user = await storage.getUser(userId);
      if (!user) {
        if (!responseSent) {
          responseSent = true;
          return res.status(404).json({ message: "User not found" });
        }
        return;
      }
      const activeUserProjects = userProjects.filter((project) => project.status !== "arquivado");
      const v1PhotoCount = activeUserProjects.reduce((total, project) => {
        return total + (project.photos ? project.photos.length : 0);
      }, 0);
      let v2PhotoCount = 0;
      try {
        const v2CountResult = await db.select({ total: count2() }).from(photos).innerJoin(newProjects, sql3`${newProjects.id}::text = ${photos.projectId}`).where(eq6(newProjects.userId, userId));
        v2PhotoCount = Number(v2CountResult[0]?.total ?? 0);
      } catch (v2Err) {
        console.error("[stats] Erro ao contar fotos V2:", v2Err);
      }
      const realCurrentPhotoCount = v1PhotoCount + v2PhotoCount;
      const stats = {
        activeProjects,
        photosThisMonth,
        totalUploadUsageMB,
        planInfo: {
          name: user.planType || "basic",
          uploadLimit: (user.uploadLimit || 1e3) + (user.bonusPhotos || 0),
          // Include referral bonus
          usedUploads: realCurrentPhotoCount
          // Use real current count instead of stored value
        }
      };
      if (!responseSent) {
        responseSent = true;
        res.json(stats);
      }
    } catch (error) {
      console.error("Error retrieving user stats:", error);
      if (!responseSent) {
        responseSent = true;
        res.status(500).json({ message: "Error retrieving user statistics" });
      }
    }
  });
  app2.post("/api/users", authenticate, requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      const user = await storage.createUser(userData);
      const { password, ...sanitizedUser } = user;
      res.status(201).json(sanitizedUser);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.patch("/api/users/:id", authenticate, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const isAdmin = req.user?.role === "admin";
      const isSelf = req.user?.id === userId;
      if (!isAdmin && !isSelf) {
        return res.status(403).json({ message: "Not authorized to update this user" });
      }
      const userData = req.body;
      if (!isAdmin) {
        const allowedFields = ["name", "password"];
        Object.keys(userData).forEach((key) => {
          if (!allowedFields.includes(key)) {
            delete userData[key];
          }
        });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUser(userId, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/users/:id", authenticate, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (req.user && user.id === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.post("/api/users/:id/resend-welcome-email", authenticate, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const standardPassword = "123456";
      await storage.resetUserPasswordByAdmin(userId, standardPassword, req.user?.email || "admin");
      const emailResult = await sendWelcomeEmail2(user.email, user.name, standardPassword);
      if (!emailResult.success) {
        return res.status(500).json({
          message: "Failed to send welcome email",
          error: emailResult.message
        });
      }
      res.json({
        message: "Welcome email resent successfully and password reset to 123456",
        email: user.email
      });
    } catch (error) {
      console.error("Error resending welcome email:", error);
      res.status(500).json({ message: "Failed to resend welcome email" });
    }
  });
  app2.get("/api/projects", authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "N\xE3o autorizado" });
      }
      const v1Projects = req.user.role === "admin" ? await storage.getProjects() : await storage.getProjects(req.user.id);
      const v2Raw = await db.query.newProjects.findMany({
        where: req.user.role === "admin" ? void 0 : eq6(newProjects.userId, req.user.id),
        orderBy: (np, { desc: d }) => [d(np.createdAt)]
      });
      let v2Projects = [];
      if (v2Raw.length > 0) {
        const v2Ids = v2Raw.map((p) => p.id);
        const countRows = await db.select({
          projectId: photos.projectId,
          total: count2(),
          selected: sql3`count(case when ${photos.selected} = true then 1 end)`
        }).from(photos).where(inArray3(photos.projectId, v2Ids)).groupBy(photos.projectId);
        const countMap = new Map(countRows.map((r) => [r.projectId, r]));
        v2Projects = v2Raw.map((p) => {
          const counts = countMap.get(p.id);
          return {
            id: p.id,
            name: p.title,
            clientName: p.description || "Cliente",
            clientEmail: "",
            data: p.eventDate || p.createdAt.toISOString(),
            eventDate: p.eventDate || null,
            contractedPhotos: p.contractedPhotos ?? 0,
            includedPhotos: p.contractedPhotos ?? 0,
            additionalPhotoPrice: p.additionalPhotoPrice ?? 0,
            status: p.status || "pendente",
            finalizado: p.status === "finalizado",
            showWatermark: p.showWatermark ?? true,
            photos: [],
            fotos: Number(counts?.total ?? 0),
            selectedPhotos: [],
            selecionadas: Number(counts?.selected ?? 0),
            isV2: true
          };
        });
      }
      const merged = [...v2Projects, ...v1Projects];
      console.log(`Retornando ${merged.length} projetos (${v1Projects.length} V1 + ${v2Projects.length} V2) para o usu\xE1rio ID=${req.user.id}`);
      res.json(merged);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to retrieve projects" });
    }
  });
  app2.get("/api/projects/:id", async (req, res) => {
    try {
      const idParam = req.params.id;
      console.log(`Buscando projeto com ID ou publicId: ${idParam}`);
      if (isUUID2(idParam)) {
        const newProject = await db.query.newProjects.findFirst({
          where: eq6(newProjects.id, idParam)
        });
        if (!newProject) {
          return res.status(404).json({ message: "Project not found" });
        }
        if (req.user && req.user.role !== "admin" && newProject.userId !== req.user.id) {
          return res.status(403).json({ message: "You don't have permission to access this project" });
        }
        const projectPhotos = await db.select().from(photos).where(eq6(photos.projectId, idParam)).orderBy(photos.createdAt);
        const cdnBase = process.env.R2_PUBLIC_URL || `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.dev`;
        return res.json({
          id: newProject.id,
          publicId: newProject.id,
          name: newProject.title,
          clientName: newProject.description || "Cliente",
          clientEmail: "",
          photographerId: newProject.userId,
          status: newProject.status || "pendente",
          finalizado: newProject.status === "finalizado",
          showWatermark: newProject.showWatermark ?? true,
          eventDate: newProject.eventDate || null,
          contractedPhotos: newProject.contractedPhotos ?? 0,
          includedPhotos: newProject.contractedPhotos ?? 0,
          additionalPhotoPrice: newProject.additionalPhotoPrice ?? 0,
          createdAt: newProject.createdAt,
          photos: projectPhotos.map((p) => ({
            id: p.id,
            url: p.url || (p.filename ? `${cdnBase}/${p.filename}` : ""),
            filename: p.filename || "",
            originalName: p.originalName || p.filename || "",
            selected: p.selected ?? false,
            thumbnailUrl: p.thumbnailUrl || null,
            processingStatus: p.processingStatus || "pending"
          })),
          selectedPhotos: projectPhotos.filter((p) => p.selected).map((p) => p.id),
          isV2: true
        });
      }
      const project = await storage.getProject(idParam);
      if (!project) {
        console.log(`Projeto com ID/publicId ${idParam} n\xE3o encontrado`);
        return res.status(404).json({ message: "Project not found" });
      }
      console.log(`Projeto encontrado: ID=${project.id}, Nome=${project.name}, PublicId=${project.publicId}`);
      console.log(`Status do projeto: ${project.status}`);
      console.log(`Total de fotos: ${project.photos?.length || 0}`);
      if (req.user && req.user.role !== "admin") {
        if (project.photographerId !== req.user.id) {
          console.log(`Acesso negado: o usu\xE1rio ${req.user.id} tentou acessar projeto ${project.id} do fot\xF3grafo ${project.photographerId}`);
          return res.status(403).json({ message: "You don't have permission to access this project" });
        }
        console.log(`Acesso autorizado: o fot\xF3grafo ${req.user.id} est\xE1 acessando seu pr\xF3prio projeto ${project.id}`);
      }
      if (project.photos && Array.isArray(project.photos)) {
        project.photos = project.photos.map((p) => {
          if (p.url && p.url.includes("cdn.fottufy.com/")) {
            const filename = p.url.split("cdn.fottufy.com/")[1];
            if (filename) return { ...p, url: `/api/r2-proxy/${filename}` };
          }
          return p;
        });
      }
      res.json(project);
    } catch (error) {
      console.error(`Erro ao buscar projeto: ${error}`);
      res.status(500).json({ message: "Failed to retrieve project" });
    }
  });
  app2.post("/api/projects", r2Upload.array("photos", 1e4), async (req, res) => {
    try {
      console.log("Receiving request to create project", req.body);
      const { projectName, clientName, clientEmail, photographerId, photos: photos2, photosData, applyWatermark } = req.body;
      const name = projectName || req.body.nome || req.body.name;
      const shouldApplyWatermark = false;
      console.log("Project data (raw):", { projectName, clientName, clientEmail, photographerId });
      console.log("Project data (processed):", { name, clientName, clientEmail, photographerId });
      console.log("[Server Debug] req.files existe:", !!req.files);
      console.log("[Server Debug] req.files \xE9 array:", Array.isArray(req.files));
      console.log("[Server Debug] req.files length:", req.files ? req.files.length : 0);
      console.log("[Server Debug] req.body.photos:", typeof photos2, Array.isArray(photos2) ? `array(${photos2.length})` : photos2);
      console.log("[Server Debug] req.body.photosData:", !!photosData);
      const currentUserId = req.user?.id || parseInt(photographerId || "1");
      let uniquePublicId;
      let attempts = 0;
      const maxAttempts = 5;
      do {
        uniquePublicId = nanoid2(12);
        attempts++;
        const existingProject = await db.select().from(projects).where(eq6(projects.publicId, uniquePublicId)).limit(1);
        if (existingProject.length === 0) {
          break;
        }
        if (attempts >= maxAttempts) {
          console.error(`Failed to generate unique public_id after ${maxAttempts} attempts`);
          throw new Error("Failed to generate unique project identifier");
        }
      } while (attempts < maxAttempts);
      const includedPhotos = parseInt(req.body.includedPhotos || "0") || 0;
      const additionalPhotoPrice = parseInt(req.body.additionalPhotoPrice || "0") || 0;
      console.log(`[Server Debug] Creating project with limits: includedPhotos=${includedPhotos}, additionalPhotoPrice=${additionalPhotoPrice}`);
      const projectData = insertProjectSchema.parse({
        name,
        clientName,
        clientEmail,
        photographerId: currentUserId,
        publicId: uniquePublicId,
        includedPhotos,
        additionalPhotoPrice
      });
      if (req.user && (projectData.photographerId !== req.user.id && req.user.role !== "admin")) {
        return res.status(403).json({ message: "Cannot create projects for other photographers" });
      }
      let processedPhotos = [];
      if (Array.isArray(photos2)) {
        console.log(`Processing ${photos2.length} photos sent as JSON array`);
        processedPhotos = [];
        for (const photo of photos2) {
          let url = photo.url;
          let id = nanoid2();
          try {
            if (url.startsWith("http")) {
              console.log(`External photo URL: ${url} with ID: ${id}`);
              try {
                const uniqueFilename = generateUniqueFileName(photo.filename || "photo.jpg");
                const result = await downloadAndUploadToR2(url, uniqueFilename);
                url = result.url;
                console.log(`Successfully downloaded external image and uploaded to R2: ${url}`);
              } catch (err) {
                console.error(`Failed to download and upload external image from ${url}: ${err.message}`);
              }
            }
            console.log(`JSON photo: ${photo.filename}, URL: ${url}, ID: ${id}`);
            processedPhotos.push({
              id,
              url,
              filename: photo.filename,
              originalName: photo.originalName || photo.filename || "external-image.jpg"
            });
          } catch (error) {
            console.error(`Error processing photo ${photo.filename}: ${error.message}`);
          }
        }
      } else if (photosData) {
        try {
          const parsedPhotosData = JSON.parse(photosData);
          console.log(`Processing ${parsedPhotosData.length} photos from photosData JSON`);
          processedPhotos = [];
          for (const photo of parsedPhotosData) {
            let url = photo.url;
            let id = nanoid2();
            try {
              if (url.startsWith("http")) {
                console.log(`External photo URL: ${url} with ID: ${id}`);
                try {
                  const uniqueFilename = generateUniqueFileName(photo.filename || "photo.jpg");
                  const result = await downloadAndUploadToR2(url, uniqueFilename);
                  url = result.url;
                  console.log(`Successfully downloaded external image and uploaded to R2: ${url}`);
                } catch (err) {
                  console.error(`Failed to download and upload external image from ${url}: ${err.message}`);
                }
              }
              console.log(`JSON photosData: ${photo.filename}, URL: ${url}, ID: ${id}`);
              processedPhotos.push({
                id,
                url,
                filename: photo.filename,
                originalName: photo.originalName || photo.filename || "external-image.jpg"
              });
            } catch (error) {
              console.error(`Error processing photosData ${photo.filename}: ${error.message}`);
            }
          }
        } catch (error) {
          console.error("Error parsing photosData JSON:", error);
        }
      } else if (req.files && Array.isArray(req.files)) {
        console.log(`Processing ${req.files.length} photos from multipart form-data`);
        const uploadedFiles = req.files;
        processedPhotos = [];
        for (const file of uploadedFiles) {
          const filename = generateUniqueFileName(nfc(file.originalname));
          try {
            const result = await uploadFileToR2(
              file.buffer,
              filename,
              file.mimetype,
              shouldApplyWatermark
            );
            processedPhotos.push({
              id: nanoid2(),
              url: result.url,
              filename,
              // Nome único usado pelo R2
              originalName: nfc(file.originalname)
              // Nome original do arquivo
            });
            console.log(`File uploaded to R2: ${nfc(file.originalname)}, R2 URL: ${result.url}`);
          } catch (error) {
            console.error(`Error uploading file to R2: ${error}`);
          }
        }
      }
      if (processedPhotos.length === 0) {
        console.log("No photos found in request, using a placeholder");
        processedPhotos = [
          {
            id: nanoid2(),
            url: "https://via.placeholder.com/800x600?text=No+Photo+Uploaded",
            filename: "placeholder.jpg",
            originalName: "No Photo Uploaded.jpg"
          }
        ];
      }
      console.log(`Fotos processadas: ${processedPhotos.length}`);
      if (processedPhotos.length >= 5) {
        try {
          if (global.gc) {
            global.gc();
            console.log(`[GC] Garbage collection executado ap\xF3s processamento de ${processedPhotos.length} fotos`);
          }
        } catch (gcError) {
          console.warn("[GC] Erro ao executar garbage collection:", gcError);
        }
      }
      const photoCount = processedPhotos.length;
      if (req.user) {
        const hasUploadLimit = await storage.checkUploadLimit(req.user.id, photoCount);
        if (!hasUploadLimit) {
          const user = await storage.getUser(req.user.id);
          const planName = user?.planType || "gratuito";
          const uploadLimit = user?.uploadLimit || 0;
          const usedUploads = user?.usedUploads || 0;
          return res.status(403).json({
            message: "Limite de uploads atingido",
            error: "UPLOAD_LIMIT_REACHED",
            details: `Sua conta ${planName} atingiu o limite de ${uploadLimit} fotos (${usedUploads} utilizadas). Para continuar fazendo uploads, verifique sua assinatura no painel ou entre em contato com nosso suporte.`
          });
        }
      }
      const project = await storage.createProject(projectData, processedPhotos);
      console.log(`Projeto criado com ID: ${project.id}`);
      if (req.user) {
        await storage.updateUploadUsage(req.user.id, photoCount);
      }
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack available");
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Invalid project data",
          errors: error.errors,
          details: error.message
        });
      }
      if (error instanceof Error) {
        if (error.message.includes("duplicate key value")) {
          return res.status(409).json({
            message: "Duplicate key error - this should not happen after sequence fix",
            error: error.message
          });
        }
        return res.status(500).json({
          message: "Failed to create project",
          error: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : void 0
        });
      }
      res.status(500).json({ message: "Failed to create project - unknown error" });
    }
  });
  app2.patch("/api/projects/:id/finalize", async (req, res) => {
    try {
      const idParam = req.params.id;
      const { selectedPhotos } = req.body;
      if (!Array.isArray(selectedPhotos)) {
        return res.status(400).json({ message: "Selected photos must be an array" });
      }
      console.log(`Finalizando sele\xE7\xE3o de fotos para projeto ${idParam}. Fotos selecionadas: ${selectedPhotos.length}`);
      if (isUUID2(idParam)) {
        const v2Project = await db.query.newProjects.findFirst({
          where: eq6(newProjects.id, idParam)
        });
        if (!v2Project) {
          return res.status(404).json({ message: "Projeto n\xE3o encontrado" });
        }
        if (selectedPhotos.length > 0) {
          await db.update(photos).set({ selected: true }).where(and2(eq6(photos.projectId, idParam), inArray3(photos.id, selectedPhotos)));
          await db.update(photos).set({ selected: false }).where(and2(eq6(photos.projectId, idParam), not2(inArray3(photos.id, selectedPhotos))));
        } else {
          await db.update(photos).set({ selected: false }).where(eq6(photos.projectId, idParam));
        }
        await db.update(newProjects).set({ status: "finalizado" }).where(eq6(newProjects.id, idParam));
        console.log(`[FINALIZE V2] Projeto ${idParam} finalizado com ${selectedPhotos.length} fotos`);
        return res.json({ success: true, status: "finalizado", selectedCount: selectedPhotos.length });
      }
      const project = await storage.getProject(idParam);
      let projectId = 0;
      if (project) {
        projectId = project.id;
        console.log(`Projeto encontrado: ID=${project.id}, Nome=${project.name}, PublicId=${project.publicId}`);
      }
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (!project.photos || !Array.isArray(project.photos)) {
        return res.status(400).json({ message: "Projeto n\xE3o cont\xE9m fotos para sele\xE7\xE3o" });
      }
      const validPhotoIds = project.photos.map((photo) => photo.id);
      const invalidPhotoIds = selectedPhotos.filter((id) => !validPhotoIds.includes(id));
      if (invalidPhotoIds.length > 0) {
        return res.status(400).json({
          message: "Algumas fotos selecionadas n\xE3o existem neste projeto",
          invalidIds: invalidPhotoIds
        });
      }
      const updatedProject = await storage.finalizeProjectSelection(projectId, selectedPhotos);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(updatedProject);
    } catch (error) {
      console.error("[FINALIZE] Erro:", error);
      res.status(500).json({ message: "Failed to finalize project selections" });
    }
  });
  app2.patch("/api/projects/:id/archive", authenticate, requireActiveUser, async (req, res) => {
    try {
      const idParam = req.params.id;
      const project = await storage.getProject(idParam);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (req.user && (project.photographerId !== req.user.id && req.user.role !== "admin")) {
        return res.status(403).json({ message: "Cannot archive projects of other photographers" });
      }
      const updatedProject = await storage.archiveProject(project.id);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Failed to archive project" });
    }
  });
  app2.patch("/api/projects/:id", authenticate, requireActiveUser, async (req, res) => {
    try {
      const idParam = req.params.id;
      if (isUUID2(idParam)) {
        const v2Project = await db.query.newProjects.findFirst({
          where: eq6(newProjects.id, idParam)
        });
        if (!v2Project) {
          return res.status(404).json({ message: "Project not found" });
        }
        if (v2Project.userId !== req.user?.id && req.user?.role !== "admin") {
          return res.status(403).json({ message: "Cannot update projects of other photographers" });
        }
        const setData = {};
        if (req.body.name !== void 0) setData.title = req.body.name;
        if (req.body.clientName !== void 0) setData.description = req.body.clientName;
        if (req.body.status !== void 0) setData.status = req.body.status;
        const [updated] = await db.update(newProjects).set(setData).where(eq6(newProjects.id, idParam)).returning();
        return res.json({
          id: updated.id,
          publicId: updated.id,
          name: updated.title,
          clientName: updated.description || "",
          clientEmail: "",
          photographerId: updated.userId,
          status: updated.status || "pendente",
          finalizado: updated.status === "finalizado",
          showWatermark: updated.showWatermark ?? true,
          eventDate: updated.eventDate || null,
          contractedPhotos: updated.contractedPhotos ?? 0,
          isV2: true
        });
      }
      const project = await storage.getProject(idParam);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (project.photographerId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Cannot update projects of other photographers" });
      }
      const updateData = {
        name: req.body.name,
        clientName: req.body.clientName,
        clientEmail: req.body.clientEmail,
        status: req.body.status
      };
      const updatedProject = await storage.updateProject(project.id, updateData);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  app2.patch("/api/projects/:id/reopen", authenticate, requireActiveUser, async (req, res) => {
    try {
      const idParam = req.params.id;
      if (isUUID2(idParam)) {
        const v2Project = await db.query.newProjects.findFirst({
          where: eq6(newProjects.id, idParam)
        });
        if (!v2Project) {
          return res.status(404).json({ message: "Project not found" });
        }
        if (v2Project.userId !== req.user?.id && req.user?.role !== "admin") {
          return res.status(403).json({ message: "Cannot reopen projects of other photographers" });
        }
        const [updated] = await db.update(newProjects).set({ status: "pendente" }).where(eq6(newProjects.id, idParam)).returning();
        console.log(`[REOPEN V2] Projeto ${idParam} reaberto para sele\xE7\xE3o (sele\xE7\xF5es mantidas)`);
        return res.json({
          id: updated.id,
          publicId: updated.id,
          name: updated.title,
          clientName: updated.description || "",
          clientEmail: "",
          photographerId: updated.userId,
          status: updated.status || "pendente",
          finalizado: false,
          showWatermark: updated.showWatermark ?? true,
          isV2: true
        });
      }
      const project = await storage.getProject(idParam);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (project.photographerId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Cannot reopen projects of other photographers" });
      }
      const updatedProject = await storage.reopenProject(project.id);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Failed to reopen project" });
    }
  });
  app2.patch("/api/projects/:id/watermark", authenticate, requireActiveUser, async (req, res) => {
    try {
      const idParam = req.params.id;
      const { showWatermark } = req.body;
      console.log(`[WATERMARK] Atualizando marca d'\xE1gua do projeto ${idParam} para: ${showWatermark}`);
      if (typeof showWatermark !== "boolean") {
        return res.status(400).json({ message: "showWatermark must be a boolean" });
      }
      if (isUUID2(idParam)) {
        const v2Project = await db.query.newProjects.findFirst({
          where: eq6(newProjects.id, idParam)
        });
        if (!v2Project) {
          return res.status(404).json({ message: "Project not found" });
        }
        if (v2Project.userId !== req.user?.id && req.user?.role !== "admin") {
          return res.status(403).json({ message: "Cannot modify projects of other photographers" });
        }
        const [updated] = await db.update(newProjects).set({ showWatermark }).where(eq6(newProjects.id, idParam)).returning();
        return res.json({ ...updated, showWatermark: updated.showWatermark });
      }
      const project = await storage.getProject(idParam);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      console.log(`[WATERMARK] Projeto encontrado: ${project.name}, atual showWatermark: ${project.showWatermark}`);
      if (project.photographerId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Cannot modify projects of other photographers" });
      }
      const updatedProject = await storage.updateProjectWatermark(project.id, showWatermark);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (process.env.DEBUG_WATERMARK === "true") {
        console.log(`[WATERMARK] Projeto atualizado: showWatermark = ${updatedProject.showWatermark}`);
      }
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project watermark:", error);
      res.status(500).json({ message: "Failed to update project watermark" });
    }
  });
  app2.post("/api/projects/:id/photos", authenticate, requireActiveUser, r2Upload.array("photos", 1e4), async (req, res) => {
    try {
      const idParam = req.params.id;
      const { applyWatermark } = req.body;
      const shouldApplyWatermark = false;
      const project = await storage.getProject(idParam);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const projectId = project.id;
      if (req.user && project.photographerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to edit this project" });
      }
      let processedPhotos = [];
      let photoCount = 0;
      if (req.files && Array.isArray(req.files)) {
        const uploadedFiles = req.files;
        photoCount = uploadedFiles.length;
        console.log(`Processing ${photoCount} uploaded photos for project ${projectId}`);
        processedPhotos = [];
        for (const file of uploadedFiles) {
          const filename = generateUniqueFileName(nfc(file.originalname));
          try {
            const result = await uploadFileToR2(
              file.buffer,
              filename,
              file.mimetype,
              shouldApplyWatermark
            );
            processedPhotos.push({
              id: nanoid2(),
              url: result.url,
              filename,
              // Nome único usado pelo R2
              originalName: nfc(file.originalname)
              // Nome original do arquivo
            });
            console.log(`File uploaded to R2 for project ${projectId}: ${nfc(file.originalname)}, R2 URL: ${result.url}`);
          } catch (error) {
            console.error(`Error uploading file to R2: ${error}`);
          }
        }
      } else if (req.body.photos && Array.isArray(req.body.photos)) {
        const { photos: photos2 } = req.body;
        photoCount = photos2.length;
        console.log(`Processing ${photoCount} photos from JSON data`);
        processedPhotos = [];
        for (const photo of photos2) {
          let url = photo.url;
          let id = photo.id || nanoid2();
          try {
            let savedFilename = photo.filename;
            if (url.startsWith("http")) {
              console.log(`External photo URL: ${url} with ID: ${id}`);
              try {
                const uniqueFilename = generateUniqueFileName(photo.filename || "photo.jpg");
                savedFilename = uniqueFilename;
                const result = await downloadAndUploadToR2(url, uniqueFilename);
                url = result.url;
                console.log(`Successfully downloaded external image and uploaded to R2: ${url}`);
              } catch (err) {
                console.error(`Failed to download and upload external image from ${url}: ${err.message}`);
                savedFilename = photo.filename;
              }
            }
            console.log(`JSON photo for existing project: ${photo.filename}, URL: ${url}, ID: ${id}, Saved filename: ${savedFilename}`);
            processedPhotos.push({
              id,
              url,
              filename: savedFilename,
              originalName: photo.originalName || photo.filename || "external-image.jpg"
            });
          } catch (error) {
            console.error(`Error processing photo for existing project ${photo.filename}: ${error.message}`);
          }
        }
      }
      if (processedPhotos.length === 0) {
        return res.status(400).json({ message: "No photos provided" });
      }
      if (req.user && req.user.role !== "admin") {
        const canUpload = await storage.checkUploadLimit(req.user.id, photoCount);
        if (!canUpload) {
          return res.status(403).json({
            message: "Upload limit exceeded",
            error: "UPLOAD_LIMIT_REACHED",
            details: "You have reached the upload limit for your current plan. Please upgrade to continue uploading photos."
          });
        }
        await storage.updateUploadUsage(req.user.id, photoCount);
      }
      const updatedProject = await storage.updateProject(projectId, {
        photos: [...project.photos || [], ...processedPhotos]
      });
      if (!updatedProject) {
        return res.status(400).json({ message: "Failed to add photos to project" });
      }
      res.status(200).json({
        message: "Photos added successfully",
        count: photoCount
      });
    } catch (error) {
      console.error("Erro ao adicionar fotos:", error);
      res.status(500).json({ message: "Failed to add photos to project" });
    }
  });
  app2.delete("/api/projects/:id", authenticate, requireActiveUser, async (req, res) => {
    try {
      const idParam = req.params.id;
      if (isUUID2(idParam)) {
        const v2Project = await db.query.newProjects.findFirst({
          where: eq6(newProjects.id, idParam)
        });
        if (!v2Project) {
          return res.status(404).json({ message: "Projeto n\xE3o encontrado" });
        }
        if (v2Project.userId !== req.user?.id && req.user?.role !== "admin") {
          return res.status(403).json({ message: "Voc\xEA n\xE3o tem permiss\xE3o para excluir este projeto" });
        }
        const projectPhotos = await db.select().from(photos).where(eq6(photos.projectId, idParam));
        for (const photo of projectPhotos) {
          try {
            if (photo.filename) await deleteFileFromR2(photo.filename);
          } catch (e) {
            console.error(`[DELETE V2] Erro ao deletar ${photo.filename} do R2:`, e);
          }
        }
        await db.delete(photos).where(eq6(photos.projectId, idParam));
        await db.delete(newProjects).where(eq6(newProjects.id, idParam));
        console.log(`[DELETE V2] Projeto ${idParam} exclu\xEDdo com ${projectPhotos.length} fotos`);
        return res.json({ success: true, message: "Projeto exclu\xEDdo com sucesso", photosRemoved: projectPhotos.length });
      }
      const project = await storage.getProject(idParam);
      if (!project) {
        return res.status(404).json({ message: "Projeto n\xE3o encontrado" });
      }
      if (project.photographerId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem permiss\xE3o para excluir este projeto" });
      }
      const photoCount = project.photos ? project.photos.length : 0;
      console.log(`Deletando projeto ID=${project.id} com ${photoCount} fotos - removendo do contador de uploads`);
      if (project.photos && Array.isArray(project.photos)) {
        for (const photo of project.photos) {
          try {
            await deleteFileFromR2(photo.filename);
          } catch (error) {
            console.error(`Error deleting ${photo.filename} from R2:`, error);
          }
        }
      }
      const deleted = await storage.deleteProject(project.id);
      if (!deleted) {
        return res.status(500).json({ message: "Falha ao excluir projeto" });
      }
      console.log(`Projeto ID=${project.id} exclu\xEDdo com sucesso - contador de uploads atualizado`);
      res.json({
        success: true,
        message: "Projeto exclu\xEDdo com sucesso",
        photosRemoved: photoCount
      });
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
      res.status(500).json({ message: "Falha ao excluir projeto" });
    }
  });
  app2.post("/api/photo-comments", async (req, res) => {
    try {
      const { photoId, clientName, comment } = req.body;
      console.log("Dados recebidos para coment\xE1rio:", { photoId, clientName, comment });
      if (!photoId || !clientName || !comment) {
        return res.status(400).json({ message: "ID da foto, nome do cliente e coment\xE1rio s\xE3o obrigat\xF3rios" });
      }
      const commentData = insertPhotoCommentSchema.parse({
        photoId,
        clientName: clientName.trim(),
        comment: comment.trim()
      });
      console.log("Dados validados do coment\xE1rio:", commentData);
      const newComment = await storage.createPhotoComment(commentData);
      console.log("Coment\xE1rio criado com sucesso:", newComment);
      res.json(newComment);
    } catch (error) {
      console.error("Erro detalhado ao criar coment\xE1rio:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: "Falha ao criar coment\xE1rio", error: error.message });
      } else {
        res.status(500).json({ message: "Falha ao criar coment\xE1rio" });
      }
    }
  });
  app2.post("/api/photos/:photoId/comments", async (req, res) => {
    try {
      const { photoId } = req.params;
      const { clientName, comment } = req.body;
      if (!clientName || !comment) {
        return res.status(400).json({ message: "Nome do cliente e coment\xE1rio s\xE3o obrigat\xF3rios" });
      }
      const commentData = insertPhotoCommentSchema.parse({
        photoId,
        clientName: clientName.trim(),
        comment: comment.trim()
      });
      const newComment = await storage.createPhotoComment(commentData);
      res.json(newComment);
    } catch (error) {
      console.error("Erro ao criar coment\xE1rio:", error);
      res.status(500).json({ message: "Falha ao criar coment\xE1rio" });
    }
  });
  app2.get("/api/photos/:photoId/comments", async (req, res) => {
    try {
      const { photoId } = req.params;
      const comments = await storage.getPhotoComments(photoId);
      res.json(comments);
    } catch (error) {
      console.error("Erro ao buscar coment\xE1rios:", error);
      res.status(500).json({ message: "Falha ao buscar coment\xE1rios" });
    }
  });
  app2.get("/api/projects/:projectId/comments", authenticate, async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ message: "Projeto n\xE3o encontrado" });
      }
      if (req.user?.role !== "admin" && project.photographerId !== req.user?.id) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const comments = await storage.getProjectPhotoComments(project.id.toString());
      res.json(comments);
    } catch (error) {
      console.error("Erro ao buscar coment\xE1rios do projeto:", error);
      res.status(500).json({ message: "Falha ao buscar coment\xE1rios do projeto" });
    }
  });
  app2.post("/api/comments/mark-viewed", authenticate, async (req, res) => {
    try {
      const { commentIds } = req.body;
      if (!Array.isArray(commentIds)) {
        return res.status(400).json({ message: "IDs dos coment\xE1rios devem ser um array" });
      }
      await storage.markCommentsAsViewed(commentIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao marcar coment\xE1rios como visualizados:", error);
      res.status(500).json({ message: "Falha ao marcar coment\xE1rios como visualizados" });
    }
  });
  app2.get("/api/subscription/plans", authenticate, async (req, res) => {
    try {
      const userPlanType = req.user?.planType || "free";
      const normalizedUserPlan = userPlanType.toLowerCase().trim();
      const allPlans = {
        FREE: { ...SUBSCRIPTION_PLANS.FREE, current: normalizedUserPlan === "free" },
        BASIC: { ...SUBSCRIPTION_PLANS.BASIC, current: normalizedUserPlan === "basic" },
        BASIC_V2: { ...SUBSCRIPTION_PLANS.BASIC_V2, current: normalizedUserPlan === "basic_v2" },
        STANDARD: { ...SUBSCRIPTION_PLANS.STANDARD, current: normalizedUserPlan === "standard" },
        STANDARD_V2: { ...SUBSCRIPTION_PLANS.STANDARD_V2, current: normalizedUserPlan === "standard_v2" },
        PROFESSIONAL: { ...SUBSCRIPTION_PLANS.PROFESSIONAL, current: normalizedUserPlan === "professional" },
        PROFESSIONAL_V2: { ...SUBSCRIPTION_PLANS.PROFESSIONAL_V2, current: normalizedUserPlan === "professional_v2" }
      };
      const plans = Object.fromEntries(
        Object.entries(allPlans).filter(
          ([key, plan]) => SUBSCRIPTION_PLANS[key] !== void 0
        )
      );
      const userStats = {
        uploadLimit: req.user?.uploadLimit || 0,
        usedUploads: req.user?.usedUploads || 0,
        remainingUploads: (req.user?.uploadLimit || 0) - (req.user?.usedUploads || 0),
        planType: userPlanType,
        subscriptionStatus: req.user?.subscriptionStatus || "inactive",
        subscriptionEndDate: req.user?.subscriptionEndDate
      };
      res.json({ plans, userStats });
    } catch (error) {
      console.error("Erro ao buscar planos de assinatura:", error);
      res.status(500).json({ message: "Falha ao buscar planos de assinatura" });
    }
  });
  app2.post("/api/stripe/create-checkout-session", authenticate, async (req, res) => {
    try {
      const { planType, billingCycle } = req.body;
      if (!planType) {
        return res.status(400).json({ message: "planType \xE9 obrigat\xF3rio" });
      }
      const validPlanTypes = ["basico", "fotografo", "estudio"];
      if (!validPlanTypes.includes(planType)) {
        return res.status(400).json({ message: "Tipo de plano inv\xE1lido" });
      }
      const cycle = billingCycle || "monthly";
      const validBillingCycles = ["monthly", "yearly"];
      if (!validBillingCycles.includes(cycle)) {
        return res.status(400).json({ message: "Ciclo de cobran\xE7a inv\xE1lido" });
      }
      const priceMapping = {
        "basico": {
          "monthly": STRIPE_PRICE_IDS.BASICO_MONTHLY,
          "yearly": STRIPE_PRICE_IDS.BASICO_YEARLY
        },
        "fotografo": {
          "monthly": STRIPE_PRICE_IDS.FOTOGRAFO_MONTHLY,
          "yearly": STRIPE_PRICE_IDS.FOTOGRAFO_YEARLY
        },
        "estudio": {
          "monthly": STRIPE_PRICE_IDS.ESTUDIO_MONTHLY,
          "yearly": STRIPE_PRICE_IDS.ESTUDIO_YEARLY
        }
      };
      const derivedPriceId = priceMapping[planType]?.[cycle];
      if (!derivedPriceId) {
        return res.status(400).json({ message: "Combina\xE7\xE3o de plano/ciclo inv\xE1lida" });
      }
      if (!stripe) {
        return res.status(500).json({
          message: "Erro no servi\xE7o de pagamento",
          details: "Stripe n\xE3o est\xE1 configurado corretamente"
        });
      }
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
      }
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName || user.username,
          metadata: {
            userId: user.id.toString(),
            fottufy: "true"
          }
        });
        stripeCustomerId = customer.id;
        try {
          await storage.updateUser(user.id, { stripeCustomerId: customer.id });
        } catch (e) {
          console.error("Falha ao salvar stripeCustomerId no banco:", e.message);
        }
      }
      const baseUrl = process.env.SITE_URL || "https://fottufy.com";
      const session3 = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: derivedPriceId,
            quantity: 1
          }
        ],
        mode: "subscription",
        success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/subscription?canceled=true`,
        metadata: {
          userId: user.id.toString(),
          planType,
          billingCycle: billingCycle || "monthly",
          userEmail: user.email
        },
        subscription_data: {
          metadata: {
            userId: user.id.toString(),
            planType,
            billingCycle: billingCycle || "monthly"
          }
        },
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        locale: "pt-BR"
      });
      console.log(`
[STRIPE-CREATE] ===== SESS\xC3O DE CHECKOUT CRIADA =====`);
      console.log(`[STRIPE-CREATE] sessionId: ${session3.id}`);
      console.log(`[STRIPE-CREATE] userId: ${user.id} (${user.email})`);
      console.log(`[STRIPE-CREATE] planType: ${planType} | billingCycle: ${billingCycle || "monthly"}`);
      console.log(`[STRIPE-CREATE] priceId: ${derivedPriceId}`);
      console.log(`[STRIPE-CREATE] stripeCustomerId: ${stripeCustomerId}`);
      console.log(`[STRIPE-CREATE] metadata.userId salvo na sess\xE3o: ${session3.metadata?.userId}`);
      console.log(`[STRIPE-CREATE] metadata.userId salvo na subscription_data: ${user.id.toString()}`);
      console.log(`[STRIPE-CREATE] success_url: ${session3.success_url}`);
      console.log(`[STRIPE-CREATE] ==========================================
`);
      res.json({
        sessionId: session3.id,
        url: session3.url
      });
    } catch (error) {
      console.error("Erro ao criar sess\xE3o de checkout:", error);
      res.status(500).json({
        message: "Falha ao criar sess\xE3o de pagamento",
        error: error.message
      });
    }
  });
  app2.post("/api/stripe/create-portal-session", authenticate, async (req, res) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
      if (!stripe) return res.status(500).json({ message: "Stripe n\xE3o configurado" });
      if (!user.stripeCustomerId) {
        return res.status(400).json({ message: "Usu\xE1rio n\xE3o possui assinatura ativa no Stripe" });
      }
      const session3 = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${req.headers.origin || "https://" + req.headers.host}/subscription`
      });
      return res.json({ url: session3.url });
    } catch (error) {
      console.error("Erro ao criar sess\xE3o do Billing Portal:", error);
      return res.status(500).json({ message: error.message || "Erro ao abrir portal de gerenciamento" });
    }
  });
  app2.get("/api/stripe/checkout-session/:sessionId", authenticate, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const user = req.user;
      console.log(`
[STRIPE-ACTIVATE] ===== VERIFICANDO SESS\xC3O =====`);
      console.log(`[STRIPE-ACTIVATE] sessionId: ${sessionId}`);
      console.log(`[STRIPE-ACTIVATE] userId no request: ${user?.id} (${user?.email})`);
      if (!user) {
        console.error(`[STRIPE-ACTIVATE] FALHA: Usu\xE1rio n\xE3o autenticado`);
        return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
      }
      if (!stripe) {
        console.error(`[STRIPE-ACTIVATE] FALHA: Stripe n\xE3o configurado (STRIPE_SECRET_KEY ausente?)`);
        return res.status(500).json({ message: "Stripe n\xE3o configurado" });
      }
      console.log(`[STRIPE-ACTIVATE] Buscando sess\xE3o no Stripe...`);
      let session3 = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription", "customer"]
      });
      if (session3.payment_status === "paid" && !session3.subscription) {
        console.warn(`[STRIPE-ACTIVATE] \u26A0\uFE0F Race condition: payment_status=paid mas subscription=null \u2014 aguardando Stripe...`);
        for (let attempt = 1; attempt <= 6; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 2e3));
          session3 = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["subscription", "customer"]
          });
          console.log(`[STRIPE-ACTIVATE] Retry ${attempt}/6: subscription=${session3.subscription ? "ok" : "null"}`);
          if (session3.subscription) break;
        }
      }
      console.log(`[STRIPE-ACTIVATE] Sess\xE3o recuperada:`);
      console.log(`[STRIPE-ACTIVATE]   status: ${session3.status}`);
      console.log(`[STRIPE-ACTIVATE]   payment_status: ${session3.payment_status}`);
      console.log(`[STRIPE-ACTIVATE]   mode: ${session3.mode}`);
      console.log(`[STRIPE-ACTIVATE]   metadata.userId: ${session3.metadata?.userId}`);
      console.log(`[STRIPE-ACTIVATE]   metadata.planType: ${session3.metadata?.planType}`);
      console.log(`[STRIPE-ACTIVATE]   customer: ${typeof session3.customer === "string" ? session3.customer : session3.customer?.id}`);
      console.log(`[STRIPE-ACTIVATE]   subscription: ${typeof session3.subscription === "string" ? session3.subscription : session3.subscription?.id}`);
      const sessionUserId = parseInt(session3.metadata?.userId || "0");
      if (sessionUserId !== user.id) {
        console.warn(`[STRIPE-ACTIVATE] FALHA: userId mismatch \u2014 sess\xE3o \xE9 do user ${sessionUserId}, mas quem acessa \xE9 user ${user.id}`);
        return res.status(403).json({ message: "Acesso negado" });
      }
      console.log(`[STRIPE-ACTIVATE] userId validado: ${sessionUserId} \u2713`);
      const sessionCustomerId = typeof session3.customer === "string" ? session3.customer : session3.customer?.id;
      console.log(`[STRIPE-ACTIVATE] stripeCustomerId no DB: ${user.stripeCustomerId || "(n\xE3o definido)"}`);
      console.log(`[STRIPE-ACTIVATE] stripeCustomerId da sess\xE3o: ${sessionCustomerId || "(n\xE3o definido)"}`);
      if (user.stripeCustomerId && sessionCustomerId && sessionCustomerId !== user.stripeCustomerId) {
        console.warn(`[STRIPE-ACTIVATE] FALHA: customer mismatch \u2014 DB tem ${user.stripeCustomerId} mas sess\xE3o \xE9 do customer ${sessionCustomerId}`);
        return res.status(403).json({ message: "Acesso negado" });
      }
      console.log(`[STRIPE-ACTIVATE] customer validado \u2713`);
      if (session3.payment_status === "paid" && !session3.subscription) {
        const fallbackCustomerId = typeof session3.customer === "string" ? session3.customer : session3.customer?.id;
        if (fallbackCustomerId && stripe) {
          console.warn(`[STRIPE-ACTIVATE] \u26A0\uFE0F Subscription ainda null ap\xF3s retries \u2014 buscando via customer ${fallbackCustomerId}`);
          try {
            const subsFromCustomer = await stripe.subscriptions.list({
              customer: fallbackCustomerId,
              status: "active",
              limit: 1,
              expand: ["data.latest_invoice"]
            });
            if (subsFromCustomer.data.length > 0) {
              console.log(`[STRIPE-ACTIVATE] \u2705 Subscription encontrada via customer: ${subsFromCustomer.data[0].id}`);
              session3.subscription = subsFromCustomer.data[0];
            } else {
              console.warn(`[STRIPE-ACTIVATE] \u26A0\uFE0F Nenhuma subscription ativa encontrada para customer ${fallbackCustomerId}`);
            }
          } catch (fallbackErr) {
            console.error(`[STRIPE-ACTIVATE] Erro no fallback de subscription: ${fallbackErr.message}`);
          }
        }
      }
      if (session3.payment_status === "paid" && session3.subscription) {
        let subscription;
        if (typeof session3.subscription === "string") {
          console.log(`[STRIPE-ACTIVATE] subscription retornou como string \u2014 buscando objeto completo no Stripe...`);
          subscription = await stripe.subscriptions.retrieve(session3.subscription);
        } else {
          subscription = session3.subscription;
          if (!subscription.current_period_start || !subscription.current_period_end) {
            console.log(`[STRIPE-ACTIVATE] subscription sem datas \u2014 buscando objeto completo no Stripe...`);
            subscription = await stripe.subscriptions.retrieve(subscription.id);
          }
        }
        const planType = session3.metadata?.planType || "basico";
        const billingCycle = session3.metadata?.billingCycle || "monthly";
        const validPlanTypes = ["basico", "fotografo", "estudio"];
        if (!validPlanTypes.includes(planType)) {
          return res.status(400).json({ message: "Tipo de plano inv\xE1lido na sess\xE3o" });
        }
        const planLimits = {
          "basico": 6e3,
          "fotografo": 17e3,
          "estudio": 4e4
        };
        const uploadLimit = planLimits[planType] || 6e3;
        const startDate = new Date(subscription.current_period_start * 1e3);
        const endDate = new Date(subscription.current_period_end * 1e3);
        console.log(`[STRIPE-ACTIVATE] planType: ${planType} | billingCycle: ${billingCycle}`);
        console.log(`[STRIPE-ACTIVATE] uploadLimit: ${uploadLimit}`);
        console.log(`[STRIPE-ACTIVATE] subscriptionId: ${subscription.id}`);
        console.log(`[STRIPE-ACTIVATE] per\xEDodo: ${startDate.toISOString()} \u2192 ${endDate.toISOString()}`);
        const currentUser = await storage.getUser(user.id);
        console.log(`[STRIPE-ACTIVATE] Estado atual do usu\xE1rio no DB:`);
        console.log(`[STRIPE-ACTIVATE]   subscriptionStatus: ${currentUser?.subscriptionStatus}`);
        console.log(`[STRIPE-ACTIVATE]   stripeSubscriptionId: ${currentUser?.stripeSubscriptionId || "(n\xE3o definido)"}`);
        console.log(`[STRIPE-ACTIVATE]   planType: ${currentUser?.planType}`);
        if (currentUser?.stripeSubscriptionId === subscription.id && currentUser?.subscriptionStatus === "active") {
          console.log(`[STRIPE-ACTIVATE] \u2705 Sess\xE3o ${sessionId} j\xE1 processada \u2014 plano j\xE1 est\xE1 ativo (webhook ativou antes)`);
          return res.json({
            success: true,
            planType,
            billingCycle,
            subscriptionId: subscription.id,
            currentPeriodEnd: endDate,
            alreadyProcessed: true
          });
        }
        console.log(`[STRIPE-ACTIVATE] Atualizando usu\xE1rio ${user.id} no banco...`);
        const activationData = {
          planType,
          uploadLimit,
          subscriptionStatus: "active",
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
          stripeSubscriptionId: subscription.id,
          billingPeriod: billingCycle
        };
        if (!user.stripeCustomerId && sessionCustomerId) {
          activationData.stripeCustomerId = sessionCustomerId;
        }
        await storage.updateUser(user.id, activationData);
        console.log(`[STRIPE-ACTIVATE] \u2705 Usu\xE1rio ${user.id} atualizado para plano ${planType} (${billingCycle}) via checkout-session endpoint`);
        let referralProcessed = false;
        try {
          const pendingReferral = await storage.getPendingReferralByReferredId(user.id);
          if (pendingReferral && pendingReferral.status === "pending") {
            console.log(`Processando referral: indicador ID=${pendingReferral.referrerId}, indicado ID=${user.id}`);
            const updatedReferral = await storage.markReferralAsConverted(pendingReferral.id);
            if (!updatedReferral) {
              console.log(`Referral ${pendingReferral.id} j\xE1 foi processado por outra request`);
            } else {
              const referrer = await storage.getUser(pendingReferral.referrerId);
              if (referrer) {
                const currentBonus = referrer.bonusPhotos || 0;
                await storage.updateUser(referrer.id, {
                  bonusPhotos: currentBonus + 1e3,
                  isAmbassador: true
                });
                console.log(`Indicador ID=${referrer.id} recebeu +1000 fotos (total b\xF4nus: ${currentBonus + 1e3}) e selo de embaixador`);
                await storage.markReferralDiscountApplied(pendingReferral.id);
                referralProcessed = true;
              } else {
                console.log(`Referral convertido, mas indicador ID=${pendingReferral.referrerId} n\xE3o encontrado`);
              }
            }
          }
        } catch (referralError) {
          console.error("Erro ao processar referral (n\xE3o cr\xEDtico):", referralError.message);
        }
        res.json({
          success: true,
          planType,
          billingCycle,
          subscriptionId: subscription.id,
          currentPeriodEnd: endDate,
          referralProcessed
        });
      } else {
        console.warn(`[STRIPE-ACTIVATE] \u26A0\uFE0F Sess\xE3o n\xE3o est\xE1 paga:`);
        console.warn(`[STRIPE-ACTIVATE]   payment_status: ${session3.payment_status}`);
        console.warn(`[STRIPE-ACTIVATE]   subscription presente: ${!!session3.subscription}`);
        res.json({
          success: false,
          status: session3.payment_status
        });
      }
    } catch (error) {
      console.error(`[STRIPE-ACTIVATE] \u274C Erro ao verificar sess\xE3o: ${error.message}`);
      console.error(`[STRIPE-ACTIVATE] Stack: ${error.stack}`);
      res.status(500).json({ message: "Erro ao verificar pagamento", error: error.message });
    }
  });
  app2.get("/api/referral/code", authenticate, async (req, res) => {
    try {
      const user = req.user;
      let referralCode = user.referralCode;
      if (!referralCode) {
        referralCode = await storage.generateReferralCode(user.id);
      }
      res.json({
        referralCode,
        referralLink: `${req.protocol}://${req.get("host")}/auth?ref=${referralCode}`
      });
    } catch (error) {
      console.error("Erro ao obter c\xF3digo de indica\xE7\xE3o:", error);
      res.status(500).json({ message: "Erro ao obter c\xF3digo de indica\xE7\xE3o" });
    }
  });
  app2.get("/api/referral/stats", authenticate, async (req, res) => {
    try {
      const user = req.user;
      const currentUser = await storage.getUser(user.id);
      const referrals2 = await storage.getUserReferrals(user.id);
      const stats = {
        total: referrals2.length,
        pending: referrals2.filter((r) => r.status === "pending").length,
        converted: referrals2.filter((r) => r.status === "converted").length,
        rewardsEarned: referrals2.filter((r) => r.discountAppliedAt !== null).length,
        bonusPhotos: currentUser?.bonusPhotos || 0,
        isAmbassador: currentUser?.isAmbassador || false
      };
      res.json(stats);
    } catch (error) {
      console.error("Erro ao obter estat\xEDsticas de indica\xE7\xF5es:", error);
      res.status(500).json({ message: "Erro ao obter estat\xEDsticas" });
    }
  });
  app2.get("/api/referral/validate/:code", async (req, res) => {
    try {
      const { code } = req.params;
      if (!code || code.length < 6) {
        return res.json({ valid: false });
      }
      const referrer = await storage.getUserByReferralCode(code.toUpperCase());
      if (referrer) {
        res.json({
          valid: true,
          referrerName: referrer.name.split(" ")[0]
          // Apenas primeiro nome para privacidade
        });
      } else {
        res.json({ valid: false });
      }
    } catch (error) {
      console.error("Erro ao validar c\xF3digo de indica\xE7\xE3o:", error);
      res.json({ valid: false });
    }
  });
  app2.post("/api/create-payment-intent", authenticate, async (req, res) => {
    try {
      const { planType } = req.body;
      if (!planType) {
        return res.status(400).json({ message: "Tipo de plano \xE9 obrigat\xF3rio" });
      }
      let planKey;
      if (planType.includes("_")) {
        planKey = planType.toUpperCase();
      } else if (planType === "free") {
        planKey = "FREE";
      } else {
        planKey = planType.toUpperCase();
      }
      const plan = SUBSCRIPTION_PLANS[planKey];
      if (!plan || plan.price === void 0) {
        const fallbackKey = `${planType.toUpperCase()}_V2`;
        const fallbackPlan = SUBSCRIPTION_PLANS[fallbackKey];
        if (!fallbackPlan) {
          return res.status(400).json({ message: "Plano inv\xE1lido ou n\xE3o encontrado" });
        }
        if (process.env.DEBUG_SUBSCRIPTION === "true") {
          console.log(`Plano ${planKey} n\xE3o encontrado, usando fallback ${fallbackKey}`);
        }
        planKey = fallbackKey;
      }
      const selectedPlan = SUBSCRIPTION_PLANS[planKey];
      if (!selectedPlan) {
        return res.status(400).json({ message: "Plano inv\xE1lido ou n\xE3o encontrado" });
      }
      if (!stripe) {
        return res.status(500).json({
          message: "Erro no servi\xE7o de pagamento",
          details: "Stripe n\xE3o est\xE1 configurado corretamente"
        });
      }
      const amountInCents = Math.round(selectedPlan.price * 100);
      const isV2Plan = planKey.includes("_V2") || planType.includes("_v2");
      const normalizedPlanType = isV2Plan ? planType.toLowerCase() : `${planType.toLowerCase()}_v2`;
      if (process.env.DEBUG_SUBSCRIPTION === "true") {
        console.log(`Criando PaymentIntent para plano: ${normalizedPlanType} (valor: R$${selectedPlan.price.toFixed(2)}, limite: ${selectedPlan.uploadLimit} uploads)`);
      }
      const metadata = {
        userId: req.user?.id.toString() || "",
        planType: normalizedPlanType,
        // Usar a versão normalizada do planType
        userEmail: req.user?.email || ""
      };
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        // Valor em centavos calculado a partir do preço do plano
        currency: "brl",
        metadata: {
          ...metadata,
          planName: selectedPlan.name,
          // Adicionar o nome amigável do plano aos metadados
          planPrice: selectedPlan.price.toString(),
          // Adicionar o preço do plano aos metadados
          uploadLimit: selectedPlan.uploadLimit.toString()
          // Adicionar o limite de uploads aos metadados
        },
        description: `Assinatura do plano ${selectedPlan.name} - R$${selectedPlan.price.toFixed(2)} - ${selectedPlan.uploadLimit} uploads - PhotoSelect`
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        planName: selectedPlan.name,
        planPrice: selectedPlan.price.toString()
      });
    } catch (error) {
      if (process.env.DEBUG_SUBSCRIPTION === "true") {
        console.error(
          "Erro ao criar intent de pagamento:",
          error instanceof Error ? error.message : "Erro desconhecido"
        );
      }
      res.status(500).json({
        message: "Falha ao processar pagamento"
      });
    }
  });
  app2.post("/api/subscription/upgrade", authenticate, async (req, res) => {
    try {
      const { planType } = req.body;
      const userPlanType = req.user?.planType || "free";
      const validPlans = [
        "free",
        "basic_v2",
        "standard_v2",
        "professional_v2",
        userPlanType
        // permitir que o usuário permaneça no seu plano atual, mesmo se for legado
      ];
      if (!planType || !validPlans.includes(planType)) {
        return res.status(400).json({ message: "Tipo de plano inv\xE1lido. Apenas os novos planos V2 est\xE3o dispon\xEDveis para upgrade." });
      }
      const updatedUser = await storage.updateUserSubscription(req.user?.id || 0, planType);
      if (!updatedUser) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      const { password, ...userInfo } = updatedUser;
      res.json({
        message: "Assinatura atualizada com sucesso",
        plan: planType,
        user: userInfo
      });
    } catch (error) {
      console.error("Erro ao atualizar assinatura:", error);
      res.status(500).json({ message: "Falha ao atualizar assinatura" });
    }
  });
  app2.post("/api/webhook", async (req, res) => {
    try {
      const webhookPayloadSchema = z2.object({
        type: z2.string(),
        email: z2.string().email(),
        subscription_id: z2.string(),
        timestamp: z2.string().datetime()
      });
      const payload = webhookPayloadSchema.parse(req.body);
      const updatedUser = await storage.handleWebhookEvent(payload);
      if (!updatedUser) {
        return res.status(404).json({
          message: "User not found",
          event: "processed",
          status: "warning"
        });
      }
      res.json({
        message: "Webhook processed successfully",
        event: payload.type,
        userStatus: updatedUser.status
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid webhook payload", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });
  app2.post("/api/webhook/stripe", async (req, res) => {
    try {
      console.log("========== INICIO WEBHOOK STRIPE ==========");
      if (!stripe) {
        console.error("[Stripe Webhook] Stripe n\xE3o configurado");
        return res.status(500).json({ error: "Stripe n\xE3o configurado" });
      }
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      let event;
      console.log(`[Stripe Webhook] Body type: ${typeof req.body} / isBuffer: ${Buffer.isBuffer(req.body)} / Content-Type: ${req.headers["content-type"]}`);
      if (webhookSecret) {
        const sig = req.headers["stripe-signature"];
        if (!sig) {
          console.error("[Stripe Webhook] Assinatura n\xE3o encontrada no header");
          return res.status(400).json({ error: "Assinatura n\xE3o encontrada" });
        }
        try {
          const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
          console.log(`[Stripe Webhook] rawBody length: ${rawBody.length}`);
          event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
          console.log("[Stripe Webhook] Assinatura validada com sucesso");
        } catch (err) {
          console.error("[Stripe Webhook] Erro na valida\xE7\xE3o da assinatura:", err.message);
          console.error("[Stripe Webhook] DICA: Verifique se STRIPE_WEBHOOK_SECRET no Render est\xE1 correto e corresponde ao endpoint configurado no Stripe Dashboard");
          return res.status(400).json({ error: `Assinatura inv\xE1lida: ${err.message}` });
        }
      } else {
        console.warn("[Stripe Webhook] ATEN\xC7\xC3O: STRIPE_WEBHOOK_SECRET n\xE3o configurado! Configure no Render para seguran\xE7a em produ\xE7\xE3o.");
        event = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
      }
      if (!event || !event.type || !event.data) {
        console.error("[Stripe Webhook] Evento inv\xE1lido recebido");
        return res.status(400).json({ error: "Evento inv\xE1lido" });
      }
      console.log(`[Stripe Webhook] Evento recebido: ${event.type}`);
      if (event.type === "checkout.session.completed") {
        const session3 = event.data.object;
        console.log(`[Stripe Webhook] Checkout session completed: ${session3.id}`);
        console.log(`[Stripe Webhook] Payment status: ${session3.payment_status}`);
        console.log(`[Stripe Webhook] Metadata:`, session3.metadata);
        if (session3.payment_status === "paid" && session3.mode === "subscription") {
          console.log(`[Stripe Webhook] Ativando plano - userId: ${session3.metadata?.userId}, planType: ${session3.metadata?.planType}`);
          const userId = parseInt(session3.metadata?.userId || "0");
          const planType = session3.metadata?.planType || "basico";
          const billingCycle = session3.metadata?.billingCycle || "monthly";
          if (!userId) {
            console.error("[Stripe Webhook] userId n\xE3o encontrado nos metadata");
            return res.status(400).json({ error: "userId n\xE3o encontrado" });
          }
          const user = await storage.getUser(userId);
          if (!user) {
            console.error(`[Stripe Webhook] Usu\xE1rio ${userId} n\xE3o encontrado`);
            return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
          }
          const planLimits = {
            "basico": 6e3,
            "fotografo": 17e3,
            "estudio": 4e4
          };
          const uploadLimit = planLimits[planType] || 6e3;
          const subscriptionId = typeof session3.subscription === "string" ? session3.subscription : session3.subscription?.id || "";
          let startDate = /* @__PURE__ */ new Date();
          let endDate = /* @__PURE__ */ new Date();
          if (billingCycle === "yearly") {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }
          if (subscriptionId && stripe) {
            try {
              const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
              startDate = new Date(stripeSub.current_period_start * 1e3);
              endDate = new Date(stripeSub.current_period_end * 1e3);
              console.log(`[Stripe Webhook] Datas reais: ${startDate.toISOString()} \u2192 ${endDate.toISOString()}`);
            } catch (dateErr) {
              console.warn(`[Stripe Webhook] Usando datas calculadas (falha ao buscar subscription): ${dateErr.message}`);
            }
          }
          if (subscriptionId && user.stripeSubscriptionId === subscriptionId && user.subscriptionStatus === "active") {
            console.log(`[Stripe Webhook] Subscription ${subscriptionId} j\xE1 processada para usu\xE1rio ${userId} - ignorando`);
            return res.json({
              message: "J\xE1 processado anteriormente",
              event: event.type,
              status: "already_processed"
            });
          }
          const sessionCustomerIdForWebhook = typeof session3.customer === "string" ? session3.customer : session3.customer?.id || "";
          const webhookUpdatePayload = {
            planType,
            uploadLimit,
            subscriptionStatus: "active",
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
            billingPeriod: billingCycle,
            stripeSubscriptionId: subscriptionId || session3.subscription
          };
          if (sessionCustomerIdForWebhook && !user.stripeCustomerId) {
            webhookUpdatePayload.stripeCustomerId = sessionCustomerIdForWebhook;
          }
          await storage.updateUser(userId, webhookUpdatePayload);
          console.log(`[Stripe Webhook] Usu\xE1rio ${userId} atualizado para plano ${planType} (${billingCycle})`);
          console.log("========== FIM WEBHOOK STRIPE ==========");
          return res.json({
            message: "Checkout processado com sucesso",
            event: event.type,
            userId,
            planType,
            status: "success"
          });
        } else {
          console.warn(`[Stripe Webhook] checkout.session.completed n\xE3o ativou plano - payment_status: ${event.data.object.payment_status}, mode: ${event.data.object.mode}`);
        }
      }
      if (event.type.startsWith("customer.subscription.")) {
        const subscription = event.data.object;
        const userId = parseInt(subscription.metadata?.userId || "0");
        console.log(`
[STRIPE-WEBHOOK] ===== ${event.type} =====`);
        console.log(`[STRIPE-WEBHOOK] subscriptionId: ${subscription.id}`);
        console.log(`[STRIPE-WEBHOOK] subscription.status: ${subscription.status}`);
        console.log(`[STRIPE-WEBHOOK] metadata.userId: ${subscription.metadata?.userId || "(AUSENTE!)"}`);
        console.log(`[STRIPE-WEBHOOK] metadata.planType: ${subscription.metadata?.planType || "(AUSENTE!)"}`);
        console.log(`[STRIPE-WEBHOOK] metadata.billingCycle: ${subscription.metadata?.billingCycle || "(AUSENTE!)"}`);
        if (!userId) {
          console.warn("[STRIPE-WEBHOOK] \u26A0\uFE0F userId n\xE3o encontrado nos metadata da subscription \u2014 n\xE3o \xE9 poss\xEDvel ativar o plano");
          return res.json({
            message: "Subscription sem userId nos metadata",
            event: event.type,
            status: "warning"
          });
        }
        const user = await storage.getUser(userId);
        if (!user) {
          console.error(`[STRIPE-WEBHOOK] \u274C Usu\xE1rio ${userId} n\xE3o encontrado no banco`);
          return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
        }
        console.log(`[STRIPE-WEBHOOK] Usu\xE1rio encontrado: ${user.email} | subscriptionStatus atual: ${user.subscriptionStatus} | stripeSubscriptionId atual: ${user.stripeSubscriptionId || "(n\xE3o definido)"}`);
        const subPlanLimits = {
          "basico": 6e3,
          "fotografo": 17e3,
          "estudio": 4e4
        };
        if (event.type === "customer.subscription.created") {
          console.log(`[STRIPE-WEBHOOK] Processando subscription.created (status: ${subscription.status})`);
          if (subscription.status === "active" || subscription.status === "trialing") {
            const planType = subscription.metadata?.planType || user.planType || "basico";
            const billingCycle = subscription.metadata?.billingCycle || "monthly";
            const uploadLimit = subPlanLimits[planType] || 6e3;
            const endDate = new Date(subscription.current_period_end * 1e3);
            const startDate = new Date(subscription.current_period_start * 1e3);
            if (user.subscriptionStatus !== "active" || !user.stripeSubscriptionId) {
              await storage.updateUser(userId, {
                planType,
                uploadLimit,
                subscriptionStatus: "active",
                subscriptionStartDate: startDate,
                subscriptionEndDate: endDate,
                billingPeriod: billingCycle,
                stripeSubscriptionId: subscription.id
              });
              console.log(`[STRIPE-WEBHOOK] \u2705 subscription.created \u2192 plano ${planType} ativado para usu\xE1rio ${userId}`);
            } else {
              console.log(`[STRIPE-WEBHOOK] \u2139\uFE0F subscription.created ignorado \u2014 usu\xE1rio ${userId} j\xE1 tem plano ativo (stripeSubscriptionId: ${user.stripeSubscriptionId})`);
            }
          } else {
            console.warn(`[STRIPE-WEBHOOK] \u26A0\uFE0F subscription.created com status n\xE3o-ativo: ${subscription.status} \u2014 aguardando`);
          }
        } else if (event.type === "customer.subscription.deleted") {
          let hasOtherActiveSub = false;
          if (user.stripeCustomerId && stripe) {
            try {
              const otherSubs = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: "active",
                limit: 5
              });
              if (otherSubs.data.length > 0) {
                hasOtherActiveSub = true;
                const activeSub = otherSubs.data[0];
                const activePlanType = activeSub.metadata?.planType || user.planType;
                const activeEndDate = new Date(activeSub.current_period_end * 1e3);
                await storage.updateUser(userId, {
                  stripeSubscriptionId: activeSub.id,
                  subscriptionStatus: "active",
                  subscriptionEndDate: activeEndDate,
                  planType: activePlanType
                });
                console.log(`[Stripe Webhook] Assinatura ${subscription.id} cancelada mas usu\xE1rio ${userId} tem outra ativa (${activeSub.id}) - mantendo plano ${activePlanType}`);
              }
            } catch (checkErr) {
              console.warn(`[Stripe Webhook] N\xE3o foi poss\xEDvel verificar outras assinaturas: ${checkErr.message}`);
            }
          }
          if (!hasOtherActiveSub) {
            await storage.updateUser(userId, {
              planType: "free",
              uploadLimit: 10,
              subscriptionStatus: "inactive",
              stripeSubscriptionId: null,
              subscriptionEndDate: null
            });
            console.log(`[Stripe Webhook] Assinatura cancelada - usu\xE1rio ${userId} rebaixado para plano gratuito`);
          }
        } else if (event.type === "customer.subscription.updated") {
          if (subscription.status === "active") {
            const planType = subscription.metadata?.planType || user.planType;
            const billingCycle = subscription.metadata?.billingCycle || "monthly";
            const uploadLimit = subPlanLimits[planType] || 6e3;
            const endDate = new Date(subscription.current_period_end * 1e3);
            await storage.updateUser(userId, {
              planType,
              uploadLimit,
              subscriptionStatus: "active",
              subscriptionEndDate: endDate,
              billingPeriod: billingCycle,
              stripeSubscriptionId: subscription.id
              // garante que está sempre salvo
            });
            console.log(`[Stripe Webhook] Assinatura atualizada para usu\xE1rio ${userId}: ${planType}`);
          } else if (subscription.status === "past_due" || subscription.status === "unpaid") {
            console.log(`[Stripe Webhook] Assinatura em atraso para usu\xE1rio ${userId}`);
          }
        }
        console.log("========== FIM WEBHOOK STRIPE ==========");
        return res.json({
          message: "Stripe webhook processado com sucesso",
          event: event.type,
          status: "success"
        });
      }
      if (event.type === "invoice.paid") {
        const invoice = event.data.object;
        console.log(`[Stripe Webhook] Invoice paga: ${invoice.id}`);
        if (invoice.subscription) {
          const allUsers = await storage.getUsers();
          let user = allUsers.find((u) => u.stripeSubscriptionId === invoice.subscription);
          if (!user && invoice.customer) {
            user = allUsers.find((u) => u.stripeCustomerId === invoice.customer);
            if (user) {
              console.log(`[Stripe Webhook] invoice.paid \u2014 usu\xE1rio encontrado pelo customerId (primeira fatura)`);
            }
          }
          if (user) {
            const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
            const periodEnd = new Date((invoice.lines?.data?.[0]?.period?.end || Date.now() / 1e3) * 1e3);
            const updatePayload = {
              subscriptionStatus: "active",
              subscriptionEndDate: periodEnd,
              lastPaymentDate: /* @__PURE__ */ new Date()
            };
            if (subscriptionId && !user.stripeSubscriptionId) {
              updatePayload.stripeSubscriptionId = subscriptionId;
              console.log(`[Stripe Webhook] invoice.paid \u2014 salvando stripeSubscriptionId ${subscriptionId} para usu\xE1rio ${user.id}`);
              if (stripe) {
                try {
                  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
                  const subPlanType = stripeSub.metadata?.planType;
                  const subBillingCycle = stripeSub.metadata?.billingCycle || "monthly";
                  const invoicePlanLimits = { "basico": 6e3, "fotografo": 17e3, "estudio": 4e4 };
                  if (subPlanType && invoicePlanLimits[subPlanType]) {
                    updatePayload.planType = subPlanType;
                    updatePayload.uploadLimit = invoicePlanLimits[subPlanType];
                    updatePayload.billingPeriod = subBillingCycle;
                    updatePayload.subscriptionStartDate = new Date(stripeSub.current_period_start * 1e3);
                    console.log(`[Stripe Webhook] invoice.paid \u2014 planType ${subPlanType} obtido da subscription`);
                  }
                } catch (subErr) {
                  console.warn(`[Stripe Webhook] invoice.paid \u2014 falha ao buscar subscription: ${subErr.message}`);
                }
              }
            }
            await storage.updateUser(user.id, updatePayload);
            console.log(`[Stripe Webhook] invoice.paid \u2192 usu\xE1rio ${user.id} confirmado ativo at\xE9 ${periodEnd.toISOString()}`);
          } else {
            console.warn(`[Stripe Webhook] invoice.paid \u2014 usu\xE1rio n\xE3o encontrado (subscription: ${invoice.subscription}, customer: ${invoice.customer})`);
          }
        }
        console.log("========== FIM WEBHOOK STRIPE ==========");
        return res.json({
          message: "Invoice processada",
          event: event.type,
          status: "success"
        });
      }
      if (event.type === "charge.refunded") {
        const charge = event.data.object;
        console.log(`[Stripe Webhook] Reembolso processado: ${charge.id}`);
        const customerId = charge.customer;
        if (customerId) {
          const allUsers = await storage.getUsers();
          const user = allUsers.find((u) => u.stripeCustomerId === customerId);
          if (user) {
            const refundedAmount = charge.amount_refunded || 0;
            const totalAmount = charge.amount || 0;
            const isFullRefund = refundedAmount >= totalAmount;
            if (isFullRefund) {
              await storage.updateUser(user.id, {
                planType: "free",
                uploadLimit: 10,
                subscriptionStatus: "inactive",
                stripeSubscriptionId: null,
                subscriptionEndDate: null
              });
              console.log(`[Stripe Webhook] Reembolso total - usu\xE1rio ${user.id} rebaixado para plano gratuito`);
            } else {
              console.log(`[Stripe Webhook] Reembolso parcial para usu\xE1rio ${user.id} (${refundedAmount}/${totalAmount}) - mantendo plano`);
            }
            console.log("========== FIM WEBHOOK STRIPE ==========");
            return res.json({
              message: "Reembolso processado",
              event: event.type,
              userId: user.id,
              isFullRefund,
              status: "success"
            });
          } else {
            console.log(`[Stripe Webhook] Usu\xE1rio n\xE3o encontrado para customer ${customerId}`);
          }
        }
        console.log("========== FIM WEBHOOK STRIPE ==========");
        return res.json({
          message: "Reembolso processado (usu\xE1rio n\xE3o identificado)",
          event: event.type,
          status: "warning"
        });
      }
      if (event.type === "charge.dispute.created") {
        const dispute = event.data.object;
        console.log(`[Stripe Webhook] Disputa criada: ${dispute.id}`);
        const chargeId = dispute.charge;
        if (chargeId && stripe) {
          try {
            const charge = await stripe.charges.retrieve(chargeId);
            const customerId = charge.customer;
            if (customerId) {
              const allUsers = await storage.getUsers();
              const user = allUsers.find((u) => u.stripeCustomerId === customerId);
              if (user) {
                await storage.updateUser(user.id, {
                  planType: "free",
                  uploadLimit: 10,
                  subscriptionStatus: "inactive",
                  stripeSubscriptionId: null,
                  subscriptionEndDate: null
                });
                console.log(`[Stripe Webhook] Disputa criada - usu\xE1rio ${user.id} rebaixado para plano gratuito`);
                console.log("========== FIM WEBHOOK STRIPE ==========");
                return res.json({
                  message: "Disputa processada",
                  event: event.type,
                  userId: user.id,
                  status: "success"
                });
              }
            }
          } catch (chargeErr) {
            console.error(`[Stripe Webhook] Erro ao buscar charge ${chargeId}:`, chargeErr);
          }
        }
        console.log("========== FIM WEBHOOK STRIPE ==========");
        return res.json({
          message: "Disputa processada (usu\xE1rio n\xE3o identificado)",
          event: event.type,
          status: "warning"
        });
      }
      console.log(`[Stripe Webhook] Evento ignorado: ${event.type}`);
      console.log("========== FIM WEBHOOK STRIPE ==========");
      return res.json({
        message: "Evento n\xE3o processado",
        event: event.type,
        status: "ignored"
      });
    } catch (error) {
      console.error("[Stripe Webhook] Erro:", error);
      console.log("========== FIM WEBHOOK STRIPE (COM ERRO) ==========");
      res.status(500).json({ message: "Falha ao processar webhook do Stripe", error: error.message });
    }
  });
  app2.post("/api/webhook/hotmart", async (req, res) => {
    try {
      console.log("========== INICIO WEBHOOK HOTMART ==========");
      console.log("Recebido evento da Hotmart");
      try {
        const safePayload = JSON.parse(JSON.stringify(req.body));
        if (safePayload.data && safePayload.data.buyer) {
          if (safePayload.data.buyer.phone) safePayload.data.buyer.phone = "[REDACTED]";
          if (safePayload.data.buyer.document) safePayload.data.buyer.document = "[REDACTED]";
        }
        console.log("Estrutura completa do payload Hotmart:");
        console.log(JSON.stringify(safePayload, null, 2));
      } catch (logError) {
        console.error("Erro ao logar payload da Hotmart:", logError);
      }
      const signature = req.headers["x-hotmart-signature"];
      const webhookSecret = process.env.HOTMART_WEBHOOK_SECRET || "";
      if (signature && webhookSecret) {
        const rawBody = JSON.stringify(req.body);
        try {
          const isValid = validateHotmartSignature(rawBody, signature, webhookSecret);
          if (!isValid) {
            console.warn("[SECURITY] Assinatura inv\xE1lida no webhook da Hotmart");
            return res.status(401).json({ message: "Assinatura inv\xE1lida" });
          }
          console.log("[SECURITY] Assinatura validada com sucesso");
        } catch (validationError) {
          console.error("[SECURITY] Erro na valida\xE7\xE3o da assinatura:", validationError.message);
          return res.status(500).json({ message: "Erro na valida\xE7\xE3o de seguran\xE7a" });
        }
      } else {
        if (process.env.NODE_ENV === "production") {
          console.warn("[SECURITY] Webhook Hotmart aceito sem assinatura (comum na Hotmart)");
        } else {
          console.warn("[DEV] Verifica\xE7\xE3o de assinatura desativada - apenas em desenvolvimento");
        }
      }
      const result = await processHotmartWebhook(req.body);
      if (result.success) {
        console.log(`Hotmart webhook processado: ${result.message}`);
      } else {
        console.warn(`Hotmart webhook com erro: ${result.message}`);
      }
      console.log("========== FIM WEBHOOK HOTMART ==========");
      return res.status(200).json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error("Erro ao processar webhook da Hotmart:", error);
      console.log("========== FIM WEBHOOK HOTMART (COM EXCE\xC7\xC3O) ==========");
      return res.status(500).json({
        message: "Falha ao processar webhook da Hotmart",
        error: error.message || "Erro desconhecido"
      });
    }
  });
  app2.get("/api/admin/subscriptions/analytics", authenticate, requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const analytics = {
        totalUsers: allUsers.length,
        activeSubscriptions: 0,
        expiredSubscriptions: 0,
        pendingCancellations: 0,
        freeUsers: 0,
        paidUsersWithoutPayment: 0,
        upcomingExpirations: 0,
        // próximos 30 dias
        criticalExpirations: 0,
        // próximos 7 days
        planDistribution: {},
        monthlyPayments: 0,
        // este mês
        lastMonthPayments: 0,
        // Novas métricas detalhadas
        recentPayments: 0,
        // últimos 7 dias
        usersWithPaymentIssues: 0,
        manualActivations: 0,
        overdueSubscriptions: 0
        // assinaturas vencidas há mais de 7 dias
      };
      const usersByCategory = {
        expired: [],
        pendingCancellation: [],
        paidWithoutPayment: [],
        upcomingExpiration: [],
        criticalExpiration: [],
        // Novas categorias detalhadas
        recentPayments: [],
        paymentIssues: [],
        manualActivations: [],
        overdueSubscriptions: []
      };
      const now = /* @__PURE__ */ new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
      for (const user of allUsers) {
        const planType = user.planType || "free";
        analytics.planDistribution[planType] = (analytics.planDistribution[planType] || 0) + 1;
        if (planType === "free") {
          analytics.freeUsers++;
          continue;
        }
        const subscriptionAnalysis = await storage.verifyUserSubscriptionStatus(user.id);
        const analysis = subscriptionAnalysis.analysis;
        if (analysis.isExpired) {
          analytics.expiredSubscriptions++;
          usersByCategory.expired.push({
            id: user.id,
            name: user.name,
            email: user.email,
            planType: user.planType,
            status: analysis.statusReason,
            recommendations: analysis.recommendations
          });
        } else if (analysis.isPendingCancellation) {
          analytics.pendingCancellations++;
          usersByCategory.pendingCancellation.push({
            id: user.id,
            name: user.name,
            email: user.email,
            planType: user.planType,
            status: analysis.statusReason,
            daysLeft: analysis.daysUntilExpiry,
            recommendations: analysis.recommendations
          });
        } else if (analysis.isActive) {
          analytics.activeSubscriptions++;
          if (analysis.daysUntilExpiry !== null) {
            if (analysis.daysUntilExpiry <= 7) {
              analytics.criticalExpirations++;
              usersByCategory.criticalExpiration.push({
                id: user.id,
                name: user.name,
                email: user.email,
                planType: user.planType,
                daysLeft: analysis.daysUntilExpiry,
                status: analysis.statusReason
              });
            } else if (analysis.daysUntilExpiry <= 30) {
              analytics.upcomingExpirations++;
              usersByCategory.upcomingExpiration.push({
                id: user.id,
                name: user.name,
                email: user.email,
                planType: user.planType,
                daysLeft: analysis.daysUntilExpiry,
                status: analysis.statusReason
              });
            }
          }
        }
        let hasPaymentIssue = false;
        let issueDetails = "";
        if (user.subscriptionStatus === "active" && planType !== "free") {
          if (!user.lastEvent || ![
            "purchase.approved",
            "subscription.charged_successfully",
            "PLANO_ATIVADO"
          ].includes(user.lastEvent.type)) {
            hasPaymentIssue = true;
            issueDetails = "Plano ativo sem hist\xF3rico de pagamento confirmado via webhook";
          }
        }
        if (user.subscriptionStatus !== "active" && planType !== "free") {
          hasPaymentIssue = true;
          issueDetails = "Plano pago mas status da assinatura n\xE3o ativo";
        }
        if (user.lastEvent && [
          "purchase.refunded",
          "purchase.chargeback",
          "purchase.canceled",
          "subscription.canceled",
          "DOWNGRADE_AGENDADO"
        ].includes(user.lastEvent.type) && user.subscriptionStatus === "active") {
          hasPaymentIssue = true;
          issueDetails = `\xDAltimo evento foi ${user.lastEvent.type} mas usu\xE1rio ainda ativo`;
        }
        if (hasPaymentIssue) {
          analytics.paidUsersWithoutPayment++;
          analytics.usersWithPaymentIssues++;
          usersByCategory.paidWithoutPayment.push({
            id: user.id,
            name: user.name,
            email: user.email,
            planType: user.planType,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionStartDate: user.subscriptionStartDate?.toISOString(),
            subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
            lastEvent: user.lastEvent,
            issueDetails,
            isManualActivation: user.isManualActivation || false,
            manualActivationDate: user.manualActivationDate?.toISOString(),
            daysSinceLastEvent: user.lastEvent && user.lastEvent.timestamp ? Math.floor((now.getTime() - new Date(user.lastEvent.timestamp).getTime()) / (24 * 60 * 60 * 1e3)) : null
          });
          usersByCategory.paymentIssues.push({
            id: user.id,
            name: user.name,
            email: user.email,
            planType: user.planType,
            subscriptionStatus: user.subscriptionStatus,
            issueDetails,
            lastEvent: user.lastEvent,
            daysSinceLastEvent: user.lastEvent && user.lastEvent.timestamp ? Math.floor((now.getTime() - new Date(user.lastEvent.timestamp).getTime()) / (24 * 60 * 60 * 1e3)) : null
          });
        }
        if (user.isManualActivation) {
          analytics.manualActivations++;
          usersByCategory.manualActivations.push({
            id: user.id,
            name: user.name,
            email: user.email,
            planType: user.planType,
            manualActivationDate: user.manualActivationDate?.toISOString(),
            manualActivationBy: user.manualActivationBy,
            subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
            daysActive: user.manualActivationDate ? Math.floor((now.getTime() - user.manualActivationDate.getTime()) / (24 * 60 * 60 * 1e3)) : null
          });
        }
        if (user.subscriptionEndDate && user.subscriptionEndDate < now) {
          const daysOverdue = Math.floor((now.getTime() - user.subscriptionEndDate.getTime()) / (24 * 60 * 60 * 1e3));
          if (daysOverdue > 7) {
            analytics.overdueSubscriptions++;
            usersByCategory.overdueSubscriptions.push({
              id: user.id,
              name: user.name,
              email: user.email,
              planType: user.planType,
              subscriptionEndDate: user.subscriptionEndDate.toISOString(),
              daysOverdue,
              lastEvent: user.lastEvent
            });
          }
        }
        if (user.lastEvent && user.lastEvent.timestamp) {
          const eventDate = new Date(user.lastEvent.timestamp);
          const isPaymentEvent = [
            "purchase.approved",
            "subscription.charged_successfully",
            "PLANO_ATIVADO"
          ].includes(user.lastEvent.type);
          if (isPaymentEvent) {
            if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
              analytics.monthlyPayments++;
            }
            if (eventDate.getMonth() === lastMonth && eventDate.getFullYear() === lastMonthYear) {
              analytics.lastMonthPayments++;
            }
            if (eventDate >= sevenDaysAgo) {
              analytics.recentPayments++;
              usersByCategory.recentPayments.push({
                id: user.id,
                name: user.name,
                email: user.email,
                planType: user.planType,
                paymentDate: eventDate.toISOString(),
                eventType: user.lastEvent.type,
                daysAgo: Math.floor((now.getTime() - eventDate.getTime()) / (24 * 60 * 60 * 1e3))
              });
            }
          }
        }
      }
      console.log(`Admin: Analytics de assinaturas geradas - ${analytics.totalUsers} usu\xE1rios analisados`);
      console.log(`Admin: Encontrados ${analytics.usersWithPaymentIssues} usu\xE1rios com problemas de pagamento`);
      console.log(`Admin: ${analytics.recentPayments} pagamentos recentes (7 dias)`);
      console.log(`Admin: ${analytics.overdueSubscriptions} assinaturas vencidas h\xE1 mais de 7 dias`);
      console.log(`Admin: ${analytics.manualActivations} ativa\xE7\xF5es manuais pelo admin`);
      res.json({
        analytics,
        usersByCategory,
        generatedAt: now.toISOString(),
        summary: {
          totalAnalyzed: analytics.totalUsers,
          categoriesCount: {
            expired: usersByCategory.expired.length,
            pendingCancellation: usersByCategory.pendingCancellation.length,
            paymentIssues: usersByCategory.paymentIssues.length,
            recentPayments: usersByCategory.recentPayments.length,
            manualActivations: usersByCategory.manualActivations.length,
            overdueSubscriptions: usersByCategory.overdueSubscriptions.length,
            criticalExpiration: usersByCategory.criticalExpiration.length,
            upcomingExpiration: usersByCategory.upcomingExpiration.length
          },
          healthMetrics: {
            paymentSuccessRate: analytics.totalUsers > 0 ? ((analytics.activeSubscriptions + analytics.recentPayments) / (analytics.totalUsers - analytics.freeUsers) * 100).toFixed(1) + "%" : "0%",
            issueRate: analytics.totalUsers > 0 ? (analytics.usersWithPaymentIssues / analytics.totalUsers * 100).toFixed(1) + "%" : "0%",
            monthlyGrowth: analytics.lastMonthPayments > 0 ? ((analytics.monthlyPayments - analytics.lastMonthPayments) / analytics.lastMonthPayments * 100).toFixed(1) + "%" : "N/A"
          }
        }
      });
    } catch (error) {
      console.error("Erro ao gerar analytics de assinatura:", error);
      res.status(500).json({ message: "Erro interno ao gerar analytics" });
    }
  });
  app2.get("/api/admin/hotmart/offers", authenticate, requireAdmin, async (req, res) => {
    try {
      const offers = await storage.getAllHotmartOffers();
      console.log(`Admin: Listadas ${offers.length} ofertas da Hotmart`);
      res.json(offers);
    } catch (error) {
      console.error("Erro ao listar ofertas da Hotmart:", error);
      res.status(500).json({ message: "Erro ao listar ofertas" });
    }
  });
  app2.post("/api/admin/hotmart/offers", authenticate, requireAdmin, async (req, res) => {
    try {
      const { offerCode, planType, billingPeriod, description, isActive } = req.body;
      if (!offerCode || !planType) {
        return res.status(400).json({ message: "C\xF3digo da oferta e tipo de plano s\xE3o obrigat\xF3rios" });
      }
      const validPlanTypes = ["basic_v2", "standard_v2", "professional_v2"];
      if (!validPlanTypes.includes(planType)) {
        return res.status(400).json({
          message: "Tipo de plano inv\xE1lido. Use: basic_v2, standard_v2 ou professional_v2"
        });
      }
      const existingOffer = await storage.getHotmartOfferByCode(offerCode);
      if (existingOffer) {
        return res.status(409).json({ message: "J\xE1 existe uma oferta com este c\xF3digo" });
      }
      const newOffer = await storage.createHotmartOffer({
        offerCode,
        planType,
        billingPeriod: billingPeriod || "monthly",
        description: description || null,
        isActive: isActive !== void 0 ? isActive : true
      });
      console.log(`Admin: Nova oferta criada - ${newOffer.offerCode} -> ${newOffer.planType}`);
      res.status(201).json(newOffer);
    } catch (error) {
      console.error("Erro ao criar oferta da Hotmart:", error);
      res.status(500).json({ message: "Erro ao criar oferta" });
    }
  });
  app2.put("/api/admin/hotmart/offers/:id", authenticate, requireAdmin, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const { offerCode, planType, billingPeriod, description, isActive } = req.body;
      if (planType) {
        const validPlanTypes = ["basic_v2", "standard_v2", "professional_v2"];
        if (!validPlanTypes.includes(planType)) {
          return res.status(400).json({
            message: "Tipo de plano inv\xE1lido. Use: basic_v2, standard_v2 ou professional_v2"
          });
        }
      }
      const updatedOffer = await storage.updateHotmartOffer(offerId, {
        offerCode,
        planType,
        billingPeriod,
        description,
        isActive
      });
      if (!updatedOffer) {
        return res.status(404).json({ message: "Oferta n\xE3o encontrada" });
      }
      console.log(`Admin: Oferta atualizada - ID ${offerId}`);
      res.json(updatedOffer);
    } catch (error) {
      console.error("Erro ao atualizar oferta da Hotmart:", error);
      res.status(500).json({ message: "Erro ao atualizar oferta" });
    }
  });
  app2.delete("/api/admin/hotmart/offers/:id", authenticate, requireAdmin, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const permanent = req.query.permanent === "true";
      let success;
      if (permanent) {
        success = await storage.hardDeleteHotmartOffer(offerId);
      } else {
        success = await storage.deleteHotmartOffer(offerId);
      }
      if (!success) {
        return res.status(404).json({ message: "Oferta n\xE3o encontrada" });
      }
      const action = permanent ? "exclu\xEDda permanentemente" : "desativada";
      console.log(`Admin: Oferta ${action} - ID ${offerId}`);
      res.json({ message: `Oferta ${action} com sucesso` });
    } catch (error) {
      console.error("Erro ao deletar oferta da Hotmart:", error);
      res.status(500).json({ message: "Erro ao deletar oferta" });
    }
  });
  app2.get("/api/admin/banner", authenticate, requireAdmin, async (req, res) => {
    try {
      const setting = await storage.getSiteSetting("dashboard_banner");
      if (!setting) {
        return res.json({
          imageUrl: "",
          linkUrl: "",
          altText: "Banner do Dashboard",
          isActive: false
        });
      }
      res.json({
        ...setting.value,
        isActive: setting.isActive
      });
    } catch (error) {
      console.error("Erro ao obter configura\xE7\xE3o do banner:", error);
      res.status(500).json({ message: "Erro ao obter configura\xE7\xE3o do banner" });
    }
  });
  app2.get("/api/banner", authenticate, async (req, res) => {
    try {
      const setting = await storage.getSiteSetting("dashboard_banner");
      if (!setting || !setting.isActive) {
        return res.json(null);
      }
      res.json({
        imageUrl: setting.value.imageUrl,
        linkUrl: setting.value.linkUrl,
        altText: setting.value.altText || "Banner"
      });
    } catch (error) {
      console.error("Erro ao obter banner:", error);
      res.status(500).json({ message: "Erro ao obter banner" });
    }
  });
  app2.put("/api/admin/banner", authenticate, requireAdmin, async (req, res) => {
    try {
      const { imageUrl, linkUrl, altText, isActive } = req.body;
      const adminUser = req.user;
      const setting = await storage.upsertSiteSetting(
        "dashboard_banner",
        { imageUrl, linkUrl, altText },
        isActive ?? true,
        adminUser?.id
      );
      console.log(`Admin: Banner atualizado por ${adminUser?.email}`);
      res.json({
        ...setting.value,
        isActive: setting.isActive
      });
    } catch (error) {
      console.error("Erro ao atualizar banner:", error);
      res.status(500).json({ message: "Erro ao atualizar banner" });
    }
  });
  app2.post("/api/admin/banner/upload", authenticate, requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem enviada" });
      }
      const file = req.file;
      const ext = nfc(file.originalname).split(".").pop()?.toLowerCase() || "jpg";
      const filename = `banner_${Date.now()}.${ext}`;
      const key = `banners/${filename}`;
      const fs6 = await import("fs");
      const buffer = fs6.readFileSync(file.path);
      const result = await uploadFileToR2(buffer, key, file.mimetype, false);
      try {
        fs6.unlinkSync(file.path);
      } catch (e) {
        console.log("Aviso: n\xE3o foi poss\xEDvel remover arquivo tempor\xE1rio");
      }
      console.log(`Admin: Banner image uploaded - ${filename}`);
      res.json({ imageUrl: result.url });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem do banner:", error);
      res.status(500).json({ message: "Erro ao fazer upload da imagem" });
    }
  });
  app2.get("/api/admin/subscription-plans", authenticate, requireAdmin, async (req, res) => {
    try {
      const activeOffers = await storage.getActiveHotmartOffers();
      const plansMap = /* @__PURE__ */ new Map();
      for (const offer of activeOffers) {
        if (!plansMap.has(offer.planType)) {
          let uploadLimit = 0;
          let name = "";
          let price = 0;
          switch (offer.planType) {
            case "free":
              uploadLimit = 10;
              name = "Gratuito";
              price = 0;
              break;
            case "basic_v2":
              uploadLimit = 6e3;
              name = "B\xE1sico";
              price = 14.9;
              break;
            case "standard_v2":
              uploadLimit = 17e3;
              name = "Padr\xE3o";
              price = 29.9;
              break;
            case "professional_v2":
              uploadLimit = 4e4;
              name = "Profissional";
              price = 49.9;
              break;
            default:
              uploadLimit = 10;
              name = offer.planType;
              price = 0;
          }
          plansMap.set(offer.planType, {
            type: offer.planType,
            name,
            price,
            uploadLimit,
            description: offer.description
          });
        }
      }
      if (!plansMap.has("free")) {
        plansMap.set("free", {
          type: "free",
          name: "Gratuito",
          price: 0,
          uploadLimit: 10,
          description: "Plano gratuito para testes"
        });
      }
      const plans = Array.from(plansMap.values()).sort((a, b) => a.price - b.price);
      res.json(plans);
    } catch (error) {
      console.error("Erro ao buscar planos de assinatura:", error);
      res.status(500).json({ message: "Erro ao buscar planos de assinatura" });
    }
  });
  app2.get("/api/admin/subscriptions/users/:category", authenticate, requireAdmin, async (req, res) => {
    try {
      const { category } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      const allUsers = await storage.getUsers();
      let filteredUsers = [];
      for (const user of allUsers) {
        if (user.planType === "free" && category !== "free") continue;
        const subscriptionAnalysis = await storage.verifyUserSubscriptionStatus(user.id);
        const analysis = subscriptionAnalysis.analysis;
        let matchesCategory = false;
        let categoryData = {};
        switch (category) {
          case "expired":
            matchesCategory = analysis.isExpired;
            categoryData = { reason: analysis.statusReason, recommendations: analysis.recommendations };
            break;
          case "pending-cancellation":
            matchesCategory = analysis.isPendingCancellation;
            categoryData = {
              reason: analysis.statusReason,
              daysLeft: analysis.daysUntilExpiry,
              recommendations: analysis.recommendations
            };
            break;
          case "upcoming-expiration":
            matchesCategory = analysis.daysUntilExpiry !== null && analysis.daysUntilExpiry <= 30 && analysis.daysUntilExpiry > 7;
            categoryData = {
              daysLeft: analysis.daysUntilExpiry,
              reason: analysis.statusReason
            };
            break;
          case "critical-expiration":
            matchesCategory = analysis.daysUntilExpiry !== null && analysis.daysUntilExpiry <= 7;
            categoryData = {
              daysLeft: analysis.daysUntilExpiry,
              reason: analysis.statusReason
            };
            break;
          case "paid-without-payment":
            matchesCategory = user.planType !== "free" && user.subscriptionStatus !== "active";
            categoryData = {
              subscriptionStatus: user.subscriptionStatus,
              lastEvent: user.lastEvent,
              reason: analysis.statusReason
            };
            break;
          case "free":
            matchesCategory = user.planType === "free";
            break;
          case "active":
            matchesCategory = analysis.isActive && !analysis.isPendingCancellation;
            categoryData = {
              daysLeft: analysis.daysUntilExpiry,
              reason: analysis.statusReason
            };
            break;
        }
        if (matchesCategory) {
          filteredUsers.push({
            id: user.id,
            name: user.name,
            email: user.email,
            planType: user.planType,
            subscriptionStatus: user.subscriptionStatus,
            createdAt: user.createdAt,
            usedUploads: user.usedUploads,
            uploadLimit: user.uploadLimit,
            ...categoryData
          });
        }
      }
      const total = filteredUsers.length;
      const paginatedUsers = filteredUsers.slice(offset, offset + limitNum);
      console.log(`Admin: Lista de usu\xE1rios categoria '${category}' - ${paginatedUsers.length}/${total} usu\xE1rios`);
      res.json({
        users: paginatedUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        },
        category,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error(`Erro ao buscar usu\xE1rios da categoria ${req.params.category}:`, error);
      res.status(500).json({ message: "Erro interno ao buscar usu\xE1rios" });
    }
  });
  app2.post("/api/test-email", async (req, res) => {
    try {
      const { to, subject, html } = req.body;
      if (!to || !subject || !html) {
        return res.status(400).json({
          success: false,
          message: "Os campos 'to', 'subject' e 'html' s\xE3o obrigat\xF3rios"
        });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        return res.status(400).json({
          success: false,
          message: "Endere\xE7o de e-mail inv\xE1lido"
        });
      }
      const result = await sendEmail({ to, subject, html });
      return res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error("Erro ao testar envio de e-mail:", error);
      return res.status(500).json({
        success: false,
        message: `Erro inesperado ao enviar e-mail: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      });
    }
  });
  app2.get("/api/portfolios", authenticate, async (req, res) => {
    try {
      const userPortfolios = await db.select({
        id: portfolios.id,
        name: portfolios.name,
        slug: portfolios.slug,
        description: portfolios.description,
        coverImageUrl: portfolios.coverImageUrl,
        isPublic: portfolios.isPublic,
        createdAt: portfolios.createdAt,
        updatedAt: portfolios.updatedAt,
        // About Me fields
        aboutTitle: portfolios.aboutTitle,
        aboutDescription: portfolios.aboutDescription,
        aboutProfileImageUrl: portfolios.aboutProfileImageUrl,
        aboutContact: portfolios.aboutContact,
        aboutEmail: portfolios.aboutEmail,
        aboutPhone: portfolios.aboutPhone,
        aboutWebsite: portfolios.aboutWebsite,
        aboutInstagram: portfolios.aboutInstagram,
        aboutEnabled: portfolios.aboutEnabled
      }).from(portfolios).where(eq6(portfolios.userId, req.user.id)).orderBy(desc3(portfolios.updatedAt));
      const portfoliosWithPhotos = await Promise.all(
        userPortfolios.map(async (portfolio) => {
          const rawPhotos = await db.select().from(portfolioPhotos).where(eq6(portfolioPhotos.portfolioId, portfolio.id)).orderBy(portfolioPhotos.order);
          const photos2 = rawPhotos.map((photo) => {
            let photoUrl = photo.photoUrl;
            if (photoUrl && !photoUrl.startsWith("http")) {
              photoUrl = `https://cdn.fottufy.com/${photoUrl}`;
              if (!photoUrl.includes(".")) {
                photoUrl += ".jpg";
              }
            }
            return {
              ...photo,
              photoUrl
            };
          });
          return {
            ...portfolio,
            photos: photos2
          };
        })
      );
      res.json(portfoliosWithPhotos);
    } catch (error) {
      console.error("Error fetching user portfolios:", error);
      res.json([]);
    }
  });
  app2.post("/api/portfolios", authenticate, async (req, res) => {
    try {
      const { name, description, isPublic } = req.body;
      if (!name?.trim()) {
        return res.status(400).json({ error: "Portfolio name is required" });
      }
      const canCreatePortfolio = await checkPortfolioLimit(req.user.id);
      if (!canCreatePortfolio) {
        const [user] = await db.select().from(users).where(eq6(users.id, req.user.id)).limit(1);
        const limit = user?.[0]?.portfolioLimit || 4;
        const used = user?.[0]?.usedPortfolios || 0;
        return res.status(400).json({
          error: `Limite de portf\xF3lios atingido. Sua conta permite ${limit} portf\xF3lios (${used} utilizados). Para criar mais portf\xF3lios, entre em contato com o suporte.`
        });
      }
      const baseSlug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").trim();
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await db.select({ id: portfolios.id }).from(portfolios).where(eq6(portfolios.slug, slug)).limit(1);
        if (existing.length === 0) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      const [newPortfolio] = await db.insert(portfolios).values({
        userId: req.user.id,
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        isPublic: isPublic ?? true
      }).returning();
      await updatePortfolioUsage(req.user.id, 1);
      res.status(201).json({
        ...newPortfolio,
        photos: []
      });
    } catch (error) {
      console.error("Error creating portfolio:", error);
      res.status(500).json({ error: "Failed to create portfolio" });
    }
  });
  app2.put("/api/portfolios/:id", authenticate, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const { name, description, isPublic } = req.body;
      if (!name?.trim()) {
        return res.status(400).json({ error: "Portfolio name is required" });
      }
      const [existingPortfolio] = await db.select().from(portfolios).where(and2(eq6(portfolios.id, portfolioId), eq6(portfolios.userId, req.user.id))).limit(1);
      if (!existingPortfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      const [updatedPortfolio] = await db.update(portfolios).set({
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic ?? true,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq6(portfolios.id, portfolioId)).returning();
      const photos2 = await db.select().from(portfolioPhotos).where(eq6(portfolioPhotos.portfolioId, portfolioId)).orderBy(portfolioPhotos.order);
      res.json({
        ...updatedPortfolio,
        photos: photos2
      });
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(500).json({ error: "Failed to update portfolio" });
    }
  });
  app2.delete("/api/portfolios/:id", authenticate, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const [existingPortfolio] = await db.select().from(portfolios).where(and2(eq6(portfolios.id, portfolioId), eq6(portfolios.userId, req.user.id))).limit(1);
      if (!existingPortfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      await db.delete(portfolioPhotos).where(eq6(portfolioPhotos.portfolioId, portfolioId));
      await db.delete(portfolios).where(eq6(portfolios.id, portfolioId));
      await updatePortfolioUsage(req.user.id, -1);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      res.status(500).json({ error: "Failed to delete portfolio" });
    }
  });
  app2.post("/api/portfolios/:id/photos", authenticate, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const { photoUrls } = req.body;
      if (!Array.isArray(photoUrls) || photoUrls.length === 0) {
        return res.status(400).json({ error: "Photo URLs array is required" });
      }
      const [existingPortfolio] = await db.select().from(portfolios).where(and2(eq6(portfolios.id, portfolioId), eq6(portfolios.userId, req.user.id))).limit(1);
      if (!existingPortfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      const photoLimit = await checkPortfolioPhotoLimit(portfolioId);
      const photosToAdd = photoUrls.length;
      if (!photoLimit.allowed || photoLimit.currentCount + photosToAdd > photoLimit.limit) {
        return res.status(400).json({
          error: `Limite de fotos por portf\xF3lio atingido. Este portf\xF3lio permite ${photoLimit.limit} fotos (${photoLimit.currentCount} utilizadas). Tentativa de adicionar ${photosToAdd} fotos excederia o limite.`
        });
      }
      const [maxOrderResult] = await db.select({ maxOrder: portfolioPhotos.order }).from(portfolioPhotos).where(eq6(portfolioPhotos.portfolioId, portfolioId)).orderBy(desc3(portfolioPhotos.order)).limit(1);
      let nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;
      const newPhotos = [];
      for (const photoUrl of photoUrls) {
        let originalName = `foto-${Date.now()}-${nextOrder}.jpg`;
        try {
          const [sourcePhoto] = await db.select({ originalName: photos.originalName }).from(photos).where(eq6(photos.url, photoUrl)).limit(1);
          if (sourcePhoto?.originalName) {
            originalName = sourcePhoto.originalName;
          }
        } catch (findError) {
          console.log(`Could not find source photo for ${photoUrl}, using fallback name`);
        }
        const [newPhoto] = await db.insert(portfolioPhotos).values({
          portfolioId,
          photoUrl,
          // Store the complete URL
          originalName,
          // Use the original name from source
          order: nextOrder
        }).returning();
        newPhotos.push(newPhoto);
        nextOrder++;
      }
      await db.update(portfolios).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq6(portfolios.id, portfolioId));
      res.status(201).json(newPhotos);
    } catch (error) {
      console.error("Error adding photos to portfolio:", error);
      res.status(500).json({ error: "Failed to add photos to portfolio" });
    }
  });
  app2.patch("/api/portfolios/:id/photos/reorder", authenticate, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const { photoOrders } = req.body;
      if (!Array.isArray(photoOrders)) {
        return res.status(400).json({ error: "Photo orders array is required" });
      }
      const [existingPortfolio] = await db.select().from(portfolios).where(and2(eq6(portfolios.id, portfolioId), eq6(portfolios.userId, req.user.id))).limit(1);
      if (!existingPortfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      for (const { photoId, order } of photoOrders) {
        await db.update(portfolioPhotos).set({ order }).where(and2(
          eq6(portfolioPhotos.id, photoId),
          eq6(portfolioPhotos.portfolioId, portfolioId)
        ));
      }
      await db.update(portfolios).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq6(portfolios.id, portfolioId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering portfolio photos:", error);
      res.status(500).json({ error: "Failed to reorder photos" });
    }
  });
  app2.delete("/api/portfolios/:id/photos/:photoId", authenticate, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const photoId = parseInt(req.params.photoId);
      const [existingPortfolio] = await db.select().from(portfolios).where(and2(eq6(portfolios.id, portfolioId), eq6(portfolios.userId, req.user.id))).limit(1);
      if (!existingPortfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      const deletedRows = await db.delete(portfolioPhotos).where(and2(
        eq6(portfolioPhotos.id, photoId),
        eq6(portfolioPhotos.portfolioId, portfolioId)
      ));
      if (deletedRows.length === 0) {
        return res.status(404).json({ error: "Photo not found in portfolio" });
      }
      await db.update(portfolios).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq6(portfolios.id, portfolioId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting portfolio photo:", error);
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });
  app2.delete("/api/portfolios/photos/:photoId", authenticate, async (req, res) => {
    try {
      const photoId = parseInt(req.params.photoId);
      const [existingPhoto] = await db.select({
        id: portfolioPhotos.id,
        portfolioId: portfolioPhotos.portfolioId,
        photoUrl: portfolioPhotos.photoUrl,
        userId: portfolios.userId
      }).from(portfolioPhotos).innerJoin(portfolios, eq6(portfolioPhotos.portfolioId, portfolios.id)).where(eq6(portfolioPhotos.id, photoId)).limit(1);
      if (!existingPhoto) {
        return res.status(404).json({ error: "Photo not found" });
      }
      if (existingPhoto.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      console.log(`[Portfolio] Deleting photo ID ${photoId} for user ${req.user.id}`);
      console.log(`[Portfolio] Photo URL to delete from R2: ${existingPhoto.photoUrl}`);
      let r2Key = null;
      if (existingPhoto.photoUrl) {
        const urlParts = existingPhoto.photoUrl.split("/");
        r2Key = urlParts[urlParts.length - 1];
      }
      await db.delete(portfolioPhotos).where(eq6(portfolioPhotos.id, photoId));
      console.log(`[Portfolio] Photo ${photoId} deleted from database`);
      if (r2Key && r2Key.trim() !== "") {
        try {
          const { deleteFileFromR2: deleteFileFromR22 } = await Promise.resolve().then(() => (init_r2(), r2_exports));
          console.log(`[Portfolio] Attempting to delete R2 object: ${r2Key}`);
          await deleteFileFromR22(r2Key);
          console.log(`[Portfolio] Successfully deleted ${r2Key} from R2 storage`);
        } catch (r2Error) {
          console.error(`[Portfolio] Failed to delete ${r2Key} from R2:`, r2Error);
        }
      } else {
        console.log(`[Portfolio] No valid R2 key extracted from photoUrl: ${existingPhoto.photoUrl}`);
      }
      await db.update(portfolios).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq6(portfolios.id, existingPhoto.portfolioId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting portfolio photo:", error);
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });
  app2.post("/api/portfolios/:id/upload", authenticate, r2Upload.array("photos"), async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const files = req.files;
      console.log(`[Portfolio Upload] Starting upload for portfolio ${portfolioId}`);
      console.log(`[Portfolio Upload] Files received:`, files ? files.length : 0);
      console.log(`[Portfolio Upload] Files array:`, files);
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No photos uploaded" });
      }
      const [existingPortfolio] = await db.select().from(portfolios).where(and2(eq6(portfolios.id, portfolioId), eq6(portfolios.userId, req.user.id))).limit(1);
      if (!existingPortfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      const photoLimit = await checkPortfolioPhotoLimit(portfolioId);
      const photosToUpload = files.length;
      if (!photoLimit.allowed || photoLimit.currentCount + photosToUpload > photoLimit.limit) {
        return res.status(400).json({
          error: `Limite de fotos por portf\xF3lio atingido. Este portf\xF3lio permite ${photoLimit.limit} fotos (${photoLimit.currentCount} utilizadas). Tentativa de adicionar ${photosToUpload} fotos excederia o limite.`
        });
      }
      console.log(`[Portfolio Upload] Processing ${files.length} photos for portfolio ${portfolioId}`);
      console.log(`[Portfolio Upload] Portfolio found:`, existingPortfolio.name, "ID:", existingPortfolio.id);
      const uploadedPhotos = [];
      const maxOrderResult = await db.select({ maxOrder: sql3`COALESCE(MAX(${portfolioPhotos.order}), -1)` }).from(portfolioPhotos).where(eq6(portfolioPhotos.portfolioId, portfolioId));
      let currentOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;
      for (const file of files) {
        try {
          const timestamp2 = Date.now();
          const randomString = Math.random().toString(36).substring(2, 12);
          const extension = getExtensionFromMimeType(file.mimetype);
          const uniqueFilename = `${timestamp2}-${randomString}${extension}`;
          const processedBuffer = await processImage(file.buffer, file.mimetype);
          const r2Response = await uploadFileToR2(
            processedBuffer,
            uniqueFilename,
            file.mimetype
          );
          console.log(`[Portfolio Upload] Creating DB entry for photo: ${uniqueFilename}, URL: ${r2Response.url}`);
          const [portfolioPhoto] = await db.insert(portfolioPhotos).values({
            portfolioId,
            photoUrl: r2Response.url,
            originalName: nfc(file.originalname),
            order: currentOrder++,
            createdAt: /* @__PURE__ */ new Date()
          }).returning();
          console.log(`[Portfolio Upload] DB entry created:`, portfolioPhoto);
          uploadedPhotos.push(portfolioPhoto);
          console.log(`[Portfolio Upload] Photo uploaded successfully: ${uniqueFilename}`);
        } catch (photoError) {
          console.error(`[Portfolio Upload] Error processing photo ${nfc(file.originalname)}:`, photoError);
        }
      }
      await db.update(portfolios).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq6(portfolios.id, portfolioId));
      console.log(`[Portfolio Upload] Successfully uploaded ${uploadedPhotos.length} photos to portfolio ${portfolioId}`);
      res.json({
        success: true,
        photos: uploadedPhotos,
        message: `${uploadedPhotos.length} photos uploaded successfully`
      });
    } catch (error) {
      console.error("Error uploading photos to portfolio:", error);
      res.status(500).json({
        error: "Failed to upload photos",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/portfolios/:id/banner", authenticate, r2Upload.single("banner"), async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const file = req.file;
      console.log(`[Portfolio Banner] Starting banner upload for portfolio ${portfolioId}`);
      console.log(`[Portfolio Banner] File received:`, file ? nfc(file.originalname) : "No file");
      if (!file) {
        return res.status(400).json({ error: "No banner file uploaded" });
      }
      const [existingPortfolio] = await db.select().from(portfolios).where(and2(eq6(portfolios.id, portfolioId), eq6(portfolios.userId, req.user.id))).limit(1);
      if (!existingPortfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      const timestamp2 = Date.now();
      const randomString = Math.random().toString(36).substring(2, 12);
      const extension = getExtensionFromMimeType(file.mimetype);
      const uniqueFilename = `banner-${timestamp2}-${randomString}${extension}`;
      const processedBuffer = await processImage(file.buffer, file.mimetype);
      const r2Response = await uploadFileToR2(
        processedBuffer,
        uniqueFilename,
        file.mimetype
      );
      const [updatedPortfolio] = await db.update(portfolios).set({
        bannerUrl: r2Response.url,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq6(portfolios.id, portfolioId)).returning();
      console.log(`[Portfolio Banner] Banner uploaded successfully: ${uniqueFilename}`);
      res.json({
        success: true,
        bannerUrl: r2Response.url,
        portfolio: updatedPortfolio
      });
    } catch (error) {
      console.error("Error uploading portfolio banner:", error);
      res.status(500).json({
        error: "Failed to upload banner",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/portfolios/photos-source", authenticate, async (req, res) => {
    try {
      const userProjects = await db.select({
        id: projects.id,
        name: projects.name,
        photos: projects.photos
      }).from(projects).where(eq6(projects.photographerId, req.user.id)).orderBy(desc3(projects.createdAt));
      const projectsWithParsedPhotos = userProjects.map((project) => {
        let photos2 = [];
        if (project.photos) {
          try {
            if (typeof project.photos === "string") {
              photos2 = JSON.parse(project.photos);
            } else if (Array.isArray(project.photos)) {
              photos2 = project.photos;
            }
          } catch (error) {
            console.error(`Error parsing photos for project ${project.id}:`, error);
            photos2 = [];
          }
        }
        return {
          id: project.id,
          name: project.name,
          photos: photos2
        };
      });
      res.json(projectsWithParsedPhotos);
    } catch (error) {
      console.error("Error fetching user projects for portfolio:", error);
      res.status(500).json({ error: "Failed to fetch photos source" });
    }
  });
  app2.get("/api/portfolios/public/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const [portfolio] = await db.select({
        id: portfolios.id,
        name: portfolios.name,
        slug: portfolios.slug,
        description: portfolios.description,
        coverImageUrl: portfolios.coverImageUrl,
        bannerUrl: portfolios.bannerUrl,
        isPublic: portfolios.isPublic,
        createdAt: portfolios.createdAt,
        updatedAt: portfolios.updatedAt,
        userName: users.name,
        // About Me fields
        aboutTitle: portfolios.aboutTitle,
        aboutDescription: portfolios.aboutDescription,
        aboutProfileImageUrl: portfolios.aboutProfileImageUrl,
        aboutContact: portfolios.aboutContact,
        aboutEmail: portfolios.aboutEmail,
        aboutPhone: portfolios.aboutPhone,
        aboutWebsite: portfolios.aboutWebsite,
        aboutInstagram: portfolios.aboutInstagram,
        aboutEnabled: portfolios.aboutEnabled
      }).from(portfolios).innerJoin(users, eq6(portfolios.userId, users.id)).where(and2(eq6(portfolios.slug, slug), eq6(portfolios.isPublic, true))).limit(1);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      const rawPhotos = await db.select({
        id: portfolioPhotos.id,
        photoUrl: portfolioPhotos.photoUrl,
        originalName: portfolioPhotos.originalName,
        description: portfolioPhotos.description,
        order: portfolioPhotos.order
      }).from(portfolioPhotos).where(eq6(portfolioPhotos.portfolioId, portfolio.id)).orderBy(portfolioPhotos.order);
      const photos2 = rawPhotos.map((photo) => {
        let photoUrl = photo.photoUrl;
        if (photoUrl && !photoUrl.startsWith("http")) {
          photoUrl = `https://cdn.fottufy.com/${photoUrl}`;
          if (!photoUrl.includes(".")) {
            photoUrl += ".jpg";
          }
        }
        return {
          ...photo,
          photoUrl
        };
      });
      const result = {
        id: portfolio.id,
        name: portfolio.name,
        slug: portfolio.slug,
        description: portfolio.description,
        coverImageUrl: portfolio.coverImageUrl,
        bannerUrl: portfolio.bannerUrl,
        isPublic: portfolio.isPublic,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
        userName: portfolio.userName,
        // About Me fields
        aboutTitle: portfolio.aboutTitle,
        aboutDescription: portfolio.aboutDescription,
        aboutProfileImageUrl: portfolio.aboutProfileImageUrl,
        aboutContact: portfolio.aboutContact,
        aboutEmail: portfolio.aboutEmail,
        aboutPhone: portfolio.aboutPhone,
        aboutWebsite: portfolio.aboutWebsite,
        aboutInstagram: portfolio.aboutInstagram,
        aboutEnabled: portfolio.aboutEnabled,
        photos: photos2
      };
      res.json(result);
    } catch (error) {
      console.error("Error fetching public portfolio:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });
  app2.put("/api/portfolios/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, isPublic } = req.body;
      const portfolio = await storage.getPortfolio(parseInt(id));
      if (!portfolio || portfolio.userId !== req.user.id) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      const updatedPortfolio = await storage.updatePortfolio(parseInt(id), {
        name,
        description,
        isPublic
      });
      res.json(updatedPortfolio);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(500).json({ message: "Failed to update portfolio" });
    }
  });
  app2.delete("/api/portfolios/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const portfolio = await storage.getPortfolio(parseInt(id));
      if (!portfolio || portfolio.userId !== req.user.id) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      await storage.deletePortfolio(parseInt(id));
      res.json({ message: "Portfolio deleted successfully" });
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      res.status(500).json({ message: "Failed to delete portfolio" });
    }
  });
  app2.post("/api/portfolios/:id/photos", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { photoIds } = req.body;
      if (!photoIds || !Array.isArray(photoIds)) {
        return res.status(400).json({ message: "Photo IDs array is required" });
      }
      const portfolio = await storage.getPortfolio(parseInt(id));
      if (!portfolio || portfolio.userId !== req.user.id) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      await storage.addPhotosToPortfolio(parseInt(id), photoIds);
      const updatedPortfolio = await storage.getPortfolio(parseInt(id));
      res.json(updatedPortfolio);
    } catch (error) {
      console.error("Error adding photos to portfolio:", error);
      res.status(500).json({ message: "Failed to add photos to portfolio" });
    }
  });
  app2.delete("/api/portfolios/:id/photos", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { photoIds } = req.body;
      if (!photoIds || !Array.isArray(photoIds)) {
        return res.status(400).json({ message: "Photo IDs array is required" });
      }
      const portfolio = await storage.getPortfolio(parseInt(id));
      if (!portfolio || portfolio.userId !== req.user.id) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      await storage.removePhotosFromPortfolio(parseInt(id), photoIds);
      const updatedPortfolio = await storage.getPortfolio(parseInt(id));
      res.json(updatedPortfolio);
    } catch (error) {
      console.error("Error removing photos from portfolio:", error);
      res.status(500).json({ message: "Failed to remove photos from portfolio" });
    }
  });
  app2.post("/api/password/forgot", async (req, res) => {
    try {
      console.log("[Forgot Password] Requisi\xE7\xE3o recebida:", req.body);
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        console.log("[Forgot Password] Email inv\xE1lido:", email);
        return res.status(400).json({
          success: false,
          message: "Email inv\xE1lido"
        });
      }
      const normalizedEmail = email.toLowerCase().trim();
      console.log("[Forgot Password] Email normalizado:", normalizedEmail);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        console.log("[Forgot Password] Formato de email inv\xE1lido:", normalizedEmail);
        return res.status(400).json({
          success: false,
          message: "Formato de email inv\xE1lido"
        });
      }
      console.log("[Forgot Password] Buscando usu\xE1rio pelo email:", normalizedEmail);
      const user = await storage.getUserByEmail(normalizedEmail);
      if (user) {
        console.log("[Forgot Password] Usu\xE1rio encontrado:", user.id, user.email);
        console.log("[Forgot Password] Gerando token para o usu\xE1rio ID:", user.id);
        const token = await generatePasswordResetToken(user.id, 60);
        if (token) {
          console.log("[Forgot Password] Token gerado com sucesso:", token.substring(0, 8) + "...");
          console.log("[Forgot Password] Enviando email para:", user.email);
          const emailResult = await sendPasswordResetEmail(user.email, token, false, user.name);
          console.log("[Forgot Password] Resultado do envio de email:", emailResult);
          console.log(`Token de redefini\xE7\xE3o de senha gerado para: ${normalizedEmail}`);
        } else {
          console.error(`Falha ao gerar token para: ${normalizedEmail}`);
        }
      } else {
        console.log(`Tentativa de redefini\xE7\xE3o para email n\xE3o cadastrado: ${normalizedEmail}`);
      }
      return res.status(200).json({
        success: true,
        message: "Se este email estiver cadastrado, voc\xEA receber\xE1 instru\xE7\xF5es para redefinir sua senha"
      });
    } catch (error) {
      console.error("Erro ao processar solicita\xE7\xE3o de redefini\xE7\xE3o de senha:", error);
      return res.status(500).json({
        success: false,
        message: "Ocorreu um erro ao processar sua solicita\xE7\xE3o"
      });
    }
  });
  app2.get("/api/password/verify-token", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        console.log("Verifica\xE7\xE3o de token falhou: token n\xE3o fornecido ou em formato incorreto");
        return res.status(400).json({
          isValid: false,
          message: "Token inv\xE1lido ou ausente"
        });
      }
      console.log(`Verificando token: ${token.substring(0, 8)}...`);
      if (!token.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log(`Token com formato inv\xE1lido: ${token.substring(0, 8)}...`);
        return res.status(400).json({
          isValid: false,
          message: "Formato de token inv\xE1lido"
        });
      }
      try {
        const result = await verifyPasswordResetToken(token);
        if (result.isValid) {
          console.log(`Token v\xE1lido: ${token.substring(0, 8)}...`);
          return res.json({ isValid: true });
        } else {
          console.log(`Token expirado ou inv\xE1lido: ${token.substring(0, 8)}...`);
          return res.status(400).json({
            isValid: false,
            message: "Token expirado ou inv\xE1lido"
          });
        }
      } catch (dbError) {
        console.error("Erro de banco de dados ao verificar token:", dbError);
        return res.status(400).json({
          isValid: false,
          message: "Token inv\xE1lido",
          detail: process.env.NODE_ENV === "development" ? dbError.message : void 0
        });
      }
    } catch (error) {
      console.error("Erro ao verificar token de redefini\xE7\xE3o de senha:", error);
      return res.status(500).json({
        isValid: false,
        message: "Erro ao verificar token",
        detail: process.env.NODE_ENV === "development" ? error.message : void 0
      });
    }
  });
  app2.use(mpRouter);
  app2.use((req, res, next) => {
    const path7 = req.path;
    if (path7.endsWith(".html")) {
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
    } else if (path7.endsWith(".js") || path7.endsWith(".mjs")) {
      res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
    } else if (path7.endsWith(".jsx") || path7.endsWith(".tsx")) {
      res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
    } else if (path7.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css; charset=UTF-8");
    } else if (path7.endsWith(".json")) {
      res.setHeader("Content-Type", "application/json; charset=UTF-8");
    }
    next();
  });
  app2.get(["*.tsx", "*.jsx", "*/src/*.tsx", "*/src/*.jsx"], (req, res, next) => {
    res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
    if (process.env.DEBUG_MIME === "true") {
      console.log(`[MIME] Servindo ${req.path} com Content-Type: application/javascript`);
    }
    next();
  });
  app2.get(["*.ts", "*.mjs", "*/src/*.ts", "*/src/*.mjs"], (req, res, next) => {
    res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
    if (process.env.DEBUG_MIME === "true") {
      console.log(`[MIME] Servindo ${req.path} com Content-Type: application/javascript`);
    }
    next();
  });
  app2.get(["*/reset-password.html", "*/create-password.html"], (req, res, next) => {
    console.log(`Servindo arquivo HTML est\xE1tico de redefini\xE7\xE3o de senha: ${req.path}`);
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    console.log(`Headers para ${req.path}:`, {
      contentType: res.getHeader("Content-Type"),
      cacheControl: res.getHeader("Cache-Control")
    });
    next();
  });
  app2.get(["/reset-password", "/create-password"], (req, res, next) => {
    if (res.headersSent) {
      console.log(`Headers j\xE1 enviados para ${req.url}, ignorando handler redundante`);
      return;
    }
    const token = req.query.token;
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(`Ambiente de desenvolvimento: delegando ${req.path} para o React`);
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        return next();
      }
      if (token) {
        console.log(`Token encontrado na URL ${req.path}, servindo p\xE1gina HTML est\xE1tica`);
        const htmlFile = req.path === "/reset-password" ? "reset-password.html" : "create-password.html";
        const htmlPath = path2.resolve(
          import.meta.dirname,
          "..",
          "public",
          htmlFile
        );
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("X-Content-Type-Options", "nosniff");
        console.log(`Servindo arquivo HTML est\xE1tico: ${htmlPath} com Content-Type: ${res.getHeader("Content-Type")}`);
        return res.sendFile(htmlPath);
      }
      return next();
    } catch (error) {
      console.error(`Erro no processamento da rota ${req.path}:`, error);
      if (!res.headersSent) {
        return res.status(500).send("Erro interno do servidor");
      }
    }
  });
  app2.get(["/reset-password", "/reset-password/*", "/create-password", "/create-password/*"], (req, res, next) => {
    if (req.path.endsWith(".html")) {
      console.log(`Redirecionando para arquivo HTML est\xE1tico: ${req.path}`);
      return next();
    }
    if (res.headersSent) {
      console.log(`Headers j\xE1 enviados para ${req.url}, ignorando handler redundante`);
      return;
    }
    const clientHtmlPath = path2.resolve(
      import.meta.dirname,
      "..",
      "client",
      "index.html"
    );
    console.log(`Servindo app React para rota de senha: ${req.url}`);
    try {
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      return res.sendFile(clientHtmlPath);
    } catch (error) {
      if (!res.headersSent) {
        console.error(`Erro ao servir HTML para ${req.url}:`, error);
        return res.status(500).send("Erro interno do servidor");
      }
    }
  });
  app2.post("/api/password/reset", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: "Token e senha s\xE3o obrigat\xF3rios"
        });
      }
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "A senha deve ter pelo menos 6 caracteres"
        });
      }
      const result = await resetPasswordWithToken(token, password);
      if (result) {
        return res.json({
          success: true,
          message: "Senha alterada com sucesso"
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "N\xE3o foi poss\xEDvel redefinir a senha. O token pode estar expirado ou j\xE1 ter sido utilizado."
        });
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao redefinir senha"
      });
    }
  });
  app2.post("/api/password/send-current", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      console.log("[Send Current Password] Requisi\xE7\xE3o recebida");
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email \xE9 obrigat\xF3rio"
        });
      }
      const normalizedEmail = email.toLowerCase().trim();
      console.log("[Send Current Password] Buscando usu\xE1rio pelo email:", normalizedEmail);
      const user = await storage.getUserByEmail(normalizedEmail);
      if (user) {
        console.log("[Send Current Password] Usu\xE1rio encontrado:", user.id);
        const temporaryPassword = Math.random().toString(36).substring(2, 10);
        const hashedPassword = await hashPassword(temporaryPassword);
        await db.update(users).set({ password: hashedPassword }).where(eq6(users.id, user.id));
        console.log("[Send Current Password] Senha tempor\xE1ria gerada para usu\xE1rio ID:", user.id);
        try {
          const emailResult = await sendEmail({
            to: user.email,
            subject: "Sua senha de acesso - Fottufy",
            html: `
              <h1>Recupera\xE7\xE3o de acesso</h1>
              <p>Ol\xE1 ${user.name || ""},</p>
              <p>Conforme solicitado, aqui est\xE1 a sua senha de acesso para a plataforma Fottufy:</p>
              <p style="font-size: 18px; font-weight: bold; padding: 10px; background-color: #f5f5f5; text-align: center; border: 1px solid #ddd; border-radius: 4px;">${temporaryPassword}</p>
              <p>Recomendamos que voc\xEA altere esta senha ap\xF3s fazer login.</p>
              <p>Se voc\xEA n\xE3o solicitou esta recupera\xE7\xE3o, por favor, entre em contato com nosso suporte imediatamente.</p>
              <p>Atenciosamente,<br>Equipe Fottufy</p>
            `
          });
          if (!emailResult.success) {
            console.error("[Send Current Password] Falha ao enviar email:", emailResult.message);
            return res.status(500).json({
              success: false,
              message: "Erro ao enviar email. Por favor, tente novamente mais tarde."
            });
          }
          console.log("[Send Current Password] Email enviado com sucesso para:", user.email);
        } catch (emailError) {
          console.error("Erro ao enviar email com a senha:", emailError);
          return res.status(500).json({
            success: false,
            message: "Erro ao enviar email. Por favor, tente novamente mais tarde."
          });
        }
        return res.status(200).json({
          success: true,
          message: "Se este email estiver cadastrado, voc\xEA receber\xE1 sua senha em instantes."
        });
      } else {
        console.log("[Send Current Password] Usu\xE1rio n\xE3o encontrado:", normalizedEmail);
        return res.status(200).json({
          success: true,
          message: "Se este email estiver cadastrado, voc\xEA receber\xE1 sua senha em instantes."
        });
      }
    } catch (error) {
      console.error("Erro ao processar envio de senha:", error);
      return res.status(500).json({
        success: false,
        message: "Ocorreu um erro ao processar sua solicita\xE7\xE3o"
      });
    }
  });
  async function checkPortfolioLimit(userId) {
    const user = await db.select().from(users).where(eq6(users.id, userId)).limit(1);
    if (!user.length) return false;
    const userRecord = user[0];
    const portfolioLimit = userRecord.portfolioLimit || 4;
    const usedPortfolios = userRecord.usedPortfolios || 0;
    return usedPortfolios < portfolioLimit;
  }
  async function checkPortfolioPhotoLimit(portfolioId) {
    const [portfolio] = await db.select().from(portfolios).where(eq6(portfolios.id, portfolioId)).limit(1);
    if (!portfolio) return { allowed: false, currentCount: 0, limit: 0 };
    const [user] = await db.select().from(users).where(eq6(users.id, portfolio.userId)).limit(1);
    if (!user) return { allowed: false, currentCount: 0, limit: 0 };
    const photoCount = await db.select({ count: count2() }).from(portfolioPhotos).where(eq6(portfolioPhotos.portfolioId, portfolioId));
    const currentCount = photoCount[0]?.count || 0;
    const limit = user.portfolioPhotoLimit || 40;
    return {
      allowed: currentCount < limit,
      currentCount,
      limit
    };
  }
  async function updatePortfolioUsage(userId, increment = 1) {
    await db.update(users).set({
      usedPortfolios: sql3`${users.usedPortfolios} + ${increment}`
    }).where(eq6(users.id, userId));
  }
  app2.put("/api/portfolios/:id/about", authenticate, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      console.log(`[Portfolio About] Updating portfolio ${portfolioId} with data:`, req.body);
      const {
        aboutTitle,
        aboutDescription,
        aboutProfileImageUrl,
        aboutContact,
        aboutEmail,
        aboutPhone,
        aboutWebsite,
        aboutInstagram,
        aboutEnabled
      } = req.body;
      const [existingPortfolio] = await db.select().from(portfolios).where(and2(eq6(portfolios.id, portfolioId), eq6(portfolios.userId, req.user.id))).limit(1);
      if (!existingPortfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      const [updatedPortfolio] = await db.update(portfolios).set({
        aboutTitle,
        aboutDescription,
        aboutProfileImageUrl,
        aboutContact,
        aboutEmail,
        aboutPhone,
        aboutWebsite,
        aboutInstagram,
        aboutEnabled: !!aboutEnabled,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq6(portfolios.id, portfolioId)).returning();
      console.log(`[Portfolio About] Successfully updated portfolio ${portfolioId}:`, updatedPortfolio);
      res.json(updatedPortfolio);
    } catch (error) {
      console.error("Error updating portfolio about section:", error);
      res.status(500).json({ error: "Failed to update about section" });
    }
  });
  app2.post("/api/portfolios/:id/about/profile-image", authenticate, r2Upload.single("profileImage"), async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No profile image uploaded" });
      }
      const [existingPortfolio] = await db.select().from(portfolios).where(and2(eq6(portfolios.id, portfolioId), eq6(portfolios.userId, req.user.id))).limit(1);
      if (!existingPortfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      const timestamp2 = Date.now();
      const randomString = Math.random().toString(36).substring(2, 12);
      const extension = getExtensionFromMimeType(file.mimetype);
      const uniqueFilename = `profile-${timestamp2}-${randomString}${extension}`;
      const processedBuffer = await processImage(file.buffer, file.mimetype);
      const r2Response = await uploadFileToR2(
        processedBuffer,
        uniqueFilename,
        file.mimetype
      );
      const [updatedPortfolio] = await db.update(portfolios).set({
        aboutProfileImageUrl: r2Response.url,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq6(portfolios.id, portfolioId)).returning();
      res.json({
        success: true,
        profileImageUrl: r2Response.url,
        portfolio: updatedPortfolio
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ error: "Failed to upload profile image" });
    }
  });
  app2.post("/api/hotmart/webhook", async (req, res) => {
    try {
      console.log("========== INICIO WEBHOOK HOTMART (rota alternativa) ==========");
      console.log("Payload recebido:", JSON.stringify(req.body));
      const result = await processHotmartWebhook(req.body);
      if (result.success) {
        console.log(`Hotmart webhook processado: ${result.message}`);
      } else {
        console.warn(`Hotmart webhook com erro: ${result.message}`);
      }
      console.log("========== FIM WEBHOOK HOTMART ==========");
      return res.status(200).json({ success: result.success, message: result.message });
    } catch (error) {
      console.error("Hotmart webhook error:", error);
      return res.status(200).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/cron/nurturing-emails", async (req, res) => {
    try {
      const cronSecret = req.headers["x-cron-secret"];
      if (process.env.CRON_SECRET) {
        if (cronSecret !== process.env.CRON_SECRET) {
          return res.status(401).json({ success: false, message: "Unauthorized" });
        }
      } else {
        if (!req.headers["x-cron-secret"] && !req.headers["authorization"]) {
          console.warn("[Nurturing] CRON_SECRET n\xE3o configurado. Configure para seguran\xE7a em produ\xE7\xE3o.");
        }
      }
      console.log("[Nurturing] Iniciando processamento de emails de nurturing...");
      const tenDaysAgo = /* @__PURE__ */ new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const oneDayAgo = /* @__PURE__ */ new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const freeUsers = await db.select().from(users).where(
        and2(
          eq6(users.planType, "free"),
          sql3`${users.createdAt} >= ${tenDaysAgo}`,
          sql3`${users.createdAt} <= ${oneDayAgo}`
        )
      );
      console.log(`[Nurturing] Encontrados ${freeUsers.length} usu\xE1rios free eleg\xEDveis`);
      let emailsSent = 0;
      let errors = 0;
      for (const user of freeUsers) {
        try {
          const signupDate = new Date(user.createdAt);
          const today = /* @__PURE__ */ new Date();
          const daysSinceSignup = Math.floor((today.getTime() - signupDate.getTime()) / (1e3 * 60 * 60 * 24));
          const emailNumber = getEmailNumberForDay(daysSinceSignup);
          if (!emailNumber) {
            continue;
          }
          const alreadySent = await db.select().from(nurturingEmails).where(
            and2(
              eq6(nurturingEmails.userId, user.id),
              eq6(nurturingEmails.emailNumber, emailNumber)
            )
          );
          if (alreadySent.length > 0) {
            continue;
          }
          const template = nurturingEmailTemplates[emailNumber];
          if (!template) {
            console.error(`[Nurturing] Template n\xE3o encontrado para email ${emailNumber}`);
            continue;
          }
          await new Promise((resolve) => setTimeout(resolve, 600));
          const result = await sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.getHtml(user.name.split(" ")[0])
          });
          if (result.success) {
            await db.insert(nurturingEmails).values({
              userId: user.id,
              emailNumber,
              emailId: result.data?.id || null
            });
            emailsSent++;
            console.log(`[Nurturing] Email ${emailNumber} enviado para ${user.email}`);
          } else {
            errors++;
            console.error(`[Nurturing] Falha ao enviar email para ${user.email}: ${result.message}`);
          }
        } catch (userError) {
          errors++;
          console.error(`[Nurturing] Erro ao processar usu\xE1rio ${user.email}:`, userError);
        }
      }
      console.log(`[Nurturing] Processamento finalizado. Enviados: ${emailsSent}, Erros: ${errors}`);
      return res.status(200).json({
        success: true,
        message: `Nurturing emails processados`,
        stats: {
          usersChecked: freeUsers.length,
          emailsSent,
          errors
        }
      });
    } catch (error) {
      console.error("[Nurturing] Erro no cron job:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/nurturing-stats", authenticate, requireAdmin, async (req, res) => {
    try {
      const stats = await db.select({
        emailNumber: nurturingEmails.emailNumber,
        count: count2()
      }).from(nurturingEmails).groupBy(nurturingEmails.emailNumber).orderBy(nurturingEmails.emailNumber);
      const freeUsersCount = await db.select({ count: count2() }).from(users).where(eq6(users.planType, "free"));
      const yesterday = /* @__PURE__ */ new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recentEmails = await db.select({ count: count2() }).from(nurturingEmails).where(sql3`${nurturingEmails.sentAt} >= ${yesterday}`);
      return res.json({
        success: true,
        data: {
          emailsByNumber: stats,
          totalFreeUsers: freeUsersCount[0]?.count || 0,
          emailsLast24h: recentEmails[0]?.count || 0
        }
      });
    } catch (error) {
      console.error("Erro ao buscar stats de nurturing:", error);
      return res.status(500).json({ success: false, message: "Erro interno" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { fileURLToPath } from "url";
import { nanoid as nanoid3 } from "nanoid";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteLogger = createLogger();
  const vite = await createViteServer({
    configFile: path3.resolve(process.cwd(), "vite.config.ts"),
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        process.cwd(),
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid3()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// server/index.ts
init_db();
init_storage();
import multer2 from "multer";
import path6 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import fs5 from "fs";
import { nanoid as nanoid4 } from "nanoid";

// server/backup/backup-scheduler.ts
import cron from "node-cron";

// server/backup/local-backup-system.ts
import { exec } from "child_process";
import { promisify } from "util";
import fs3 from "fs-extra";
import path4 from "path";
import archiver from "archiver";
var execAsync = promisify(exec);
var LocalBackupSystem = class {
  config;
  constructor() {
    this.config = {
      backupDir: process.env.BACKUP_DIR || path4.join(process.cwd(), "backups"),
      maxBackups: 7,
      // Mantém últimos 7 backups
      compressionLevel: 9
      // Máxima compressão
    };
  }
  /**
   * Cria backup completo do banco de dados
   */
  async createBackup() {
    try {
      console.log("\u{1F504} Iniciando backup local autom\xE1tico...");
      await fs3.ensureDir(this.config.backupDir);
      const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const backupFileName = `backup-local-${timestamp2}`;
      const sqlFilePath = path4.join(this.config.backupDir, `${backupFileName}.sql`);
      const zipFilePath = path4.join(this.config.backupDir, `${backupFileName}.zip`);
      console.log("\u{1F4CA} Gerando dump do PostgreSQL...");
      const dumpCommand = `pg_dump "${process.env.DATABASE_URL}" > "${sqlFilePath}"`;
      await execAsync(dumpCommand);
      const sqlStats = await fs3.stat(sqlFilePath);
      console.log(`\u2705 Dump SQL criado: ${(sqlStats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log("\u{1F5DC}\uFE0F Comprimindo backup...");
      await this.createZipArchive(sqlFilePath, zipFilePath);
      await fs3.remove(sqlFilePath);
      const zipStats = await fs3.stat(zipFilePath);
      const sizeFormatted = `${(zipStats.size / 1024 / 1024).toFixed(2)} MB`;
      await this.cleanOldBackups();
      console.log(`\u2705 Backup local criado: ${path4.basename(zipFilePath)} (${sizeFormatted})`);
      return {
        success: true,
        filePath: zipFilePath,
        size: sizeFormatted
      };
    } catch (error) {
      console.error("\u274C Erro no backup local:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  /**
   * Cria arquivo ZIP comprimido
   */
  async createZipArchive(sqlFilePath, zipFilePath) {
    return new Promise((resolve, reject) => {
      const output = fs3.createWriteStream(zipFilePath);
      const archive = archiver("zip", { zlib: { level: this.config.compressionLevel } });
      output.on("close", () => resolve());
      archive.on("error", reject);
      archive.pipe(output);
      archive.file(sqlFilePath, { name: path4.basename(sqlFilePath) });
      archive.finalize();
    });
  }
  /**
   * Remove backups antigos mantendo apenas os mais recentes
   */
  async cleanOldBackups() {
    try {
      const files = await fs3.readdir(this.config.backupDir);
      const backupFiles = files.filter((file) => file.startsWith("backup-local-") && file.endsWith(".zip")).map((file) => ({
        name: file,
        path: path4.join(this.config.backupDir, file),
        mtime: fs3.statSync(path4.join(this.config.backupDir, file)).mtime
      })).sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      if (backupFiles.length > this.config.maxBackups) {
        const filesToRemove = backupFiles.slice(this.config.maxBackups);
        for (const file of filesToRemove) {
          await fs3.remove(file.path);
          console.log(`\u{1F5D1}\uFE0F Backup antigo removido: ${file.name}`);
        }
      }
      console.log(`\u{1F4C1} Mantendo ${Math.min(backupFiles.length, this.config.maxBackups)} backups locais`);
    } catch (error) {
      console.warn("\u26A0\uFE0F Erro ao limpar backups antigos:", error);
    }
  }
  /**
   * Lista backups disponíveis
   */
  async listBackups() {
    try {
      const files = await fs3.readdir(this.config.backupDir);
      const backupFiles = files.filter((file) => file.startsWith("backup-local-") && file.endsWith(".zip")).map((file) => {
        const filePath = path4.join(this.config.backupDir, file);
        const stats = fs3.statSync(filePath);
        return {
          name: file,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          date: stats.mtime
        };
      }).sort((a, b) => b.date.getTime() - a.date.getTime());
      return backupFiles;
    } catch (error) {
      return [];
    }
  }
  /**
   * Obter estatísticas do sistema de backup
   */
  async getBackupStats() {
    const backups = await this.listBackups();
    if (backups.length === 0) {
      return { totalBackups: 0, totalSize: "0 MB" };
    }
    const totalBytes = backups.reduce((acc, backup) => {
      return acc + parseFloat(backup.size) * 1024 * 1024;
    }, 0);
    return {
      totalBackups: backups.length,
      totalSize: `${(totalBytes / 1024 / 1024).toFixed(2)} MB`,
      oldestBackup: backups[backups.length - 1]?.date,
      newestBackup: backups[0]?.date
    };
  }
};

// server/backup/email-backup-system.ts
import { exec as exec2 } from "child_process";
import { promisify as promisify2 } from "util";
import fs4 from "fs-extra";
import path5 from "path";
import archiver2 from "archiver";
import { Resend as Resend2 } from "resend";
var execAsync2 = promisify2(exec2);
var EmailBackupSystem = class {
  resend;
  config;
  constructor() {
    this.resend = new Resend2(process.env.RESEND_API_KEY);
    this.config = {
      fromEmail: "backup@fottufy.com",
      toEmail: "areanatan1@gmail.com",
      // Email do admin
      maxAttachmentSize: 25,
      // Limite do email (25MB)
      tempDir: "/tmp/backup-email"
    };
  }
  /**
   * Cria backup e envia por email
   */
  async createAndSendBackup() {
    try {
      console.log("\u{1F4E7} Iniciando backup por email...");
      await fs4.ensureDir(this.config.tempDir);
      const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const backupFileName = `fottufy-backup-${timestamp2}`;
      const sqlFilePath = path5.join(this.config.tempDir, `${backupFileName}.sql`);
      const zipFilePath = path5.join(this.config.tempDir, `${backupFileName}.zip`);
      console.log("\u{1F4CA} Gerando dump do PostgreSQL...");
      const dumpCommand = `pg_dump "${process.env.DATABASE_URL}" > "${sqlFilePath}"`;
      await execAsync2(dumpCommand);
      const sqlStats = await fs4.stat(sqlFilePath);
      const sqlSizeMB = sqlStats.size / 1024 / 1024;
      console.log(`\u2705 Dump SQL criado: ${sqlSizeMB.toFixed(2)} MB`);
      console.log("\u{1F5DC}\uFE0F Comprimindo backup...");
      await this.createZipArchive(sqlFilePath, zipFilePath);
      const zipStats = await fs4.stat(zipFilePath);
      const zipSizeMB = zipStats.size / 1024 / 1024;
      const sizeFormatted = `${zipSizeMB.toFixed(2)} MB`;
      if (zipSizeMB > this.config.maxAttachmentSize) {
        console.warn(`\u26A0\uFE0F Backup muito grande (${sizeFormatted}), enviando notifica\xE7\xE3o sem anexo`);
        await this.sendBackupNotification(sizeFormatted, true);
      } else {
        await this.sendBackupByEmail(zipFilePath, sizeFormatted);
      }
      await this.cleanupTempFiles();
      console.log(`\u2705 Backup por email processado: ${sizeFormatted}`);
      return {
        success: true,
        size: sizeFormatted
      };
    } catch (error) {
      console.error("\u274C Erro no backup por email:", error.message);
      try {
        await this.sendErrorNotification(error.message);
      } catch (emailError) {
        console.error("\u274C Erro ao enviar notifica\xE7\xE3o de erro:", emailError);
      }
      return {
        success: false,
        error: error.message
      };
    }
  }
  /**
   * Cria arquivo ZIP comprimido
   */
  async createZipArchive(sqlFilePath, zipFilePath) {
    return new Promise((resolve, reject) => {
      const output = fs4.createWriteStream(zipFilePath);
      const archive = archiver2("zip", { zlib: { level: 9 } });
      output.on("close", () => resolve());
      archive.on("error", reject);
      archive.pipe(output);
      archive.file(sqlFilePath, { name: path5.basename(sqlFilePath) });
      archive.finalize();
    });
  }
  /**
   * Envia backup por email com anexo
   */
  async sendBackupByEmail(zipFilePath, size) {
    const fileName = path5.basename(zipFilePath);
    const fileContent = await fs4.readFile(zipFilePath);
    const base64Content = fileContent.toString("base64");
    const currentDate = (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    await this.resend.emails.send({
      from: this.config.fromEmail,
      to: this.config.toEmail,
      subject: `\u{1F4E7} Backup Autom\xE1tico Fottufy - ${(/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">\u{1F4E7} Backup Autom\xE1tico</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Fottufy - Sistema de Backup</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #28a745; margin: 0 0 15px 0;">\u2705 Backup Criado com Sucesso</h2>
              <p style="margin: 5px 0; color: #6c757d;"><strong>Data:</strong> ${currentDate}</p>
              <p style="margin: 5px 0; color: #6c757d;"><strong>Tamanho:</strong> ${size}</p>
              <p style="margin: 5px 0; color: #6c757d;"><strong>Arquivo:</strong> ${fileName}</p>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
              <p style="margin: 0; color: #1976d2;">
                <strong>\u{1F512} Backup em Anexo</strong><br>
                O arquivo de backup completo est\xE1 anexado neste email. 
                Guarde em local seguro para restaura\xE7\xE3o se necess\xE1rio.
              </p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px;">
              <p>Sistema de Backup Autom\xE1tico Fottufy</p>
              <p>Este backup foi gerado automaticamente \xE0s 3:00 AM</p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: base64Content
        }
      ]
    });
    console.log(`\u{1F4E7} Backup enviado por email: ${fileName} (${size})`);
  }
  /**
   * Envia notificação quando backup é muito grande
   */
  async sendBackupNotification(size, tooLarge = false) {
    const currentDate = (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    await this.resend.emails.send({
      from: this.config.fromEmail,
      to: this.config.toEmail,
      subject: `\u26A0\uFE0F Backup Fottufy - Arquivo Muito Grande (${size})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">\u26A0\uFE0F Backup Grande Detectado</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Fottufy - Sistema de Backup</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
              <h2 style="color: #856404; margin: 0 0 15px 0;">\u{1F4CA} Backup Criado (Arquivo Grande)</h2>
              <p style="margin: 5px 0; color: #856404;"><strong>Data:</strong> ${currentDate}</p>
              <p style="margin: 5px 0; color: #856404;"><strong>Tamanho:</strong> ${size}</p>
              <p style="margin: 5px 0; color: #856404;"><strong>Status:</strong> Arquivo muito grande para email</p>
            </div>
            
            <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <p style="margin: 0; color: #721c24;">
                <strong>\u{1F4C1} Backup Salvo Localmente</strong><br>
                O backup foi criado com sucesso, mas \xE9 muito grande (>${this.config.maxAttachmentSize}MB) para ser enviado por email.
                O arquivo est\xE1 salvo no servidor.
              </p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px;">
              <p>Sistema de Backup Autom\xE1tico Fottufy</p>
              <p>Considere configurar Google Drive para backups grandes</p>
            </div>
          </div>
        </div>
      `
    });
    console.log(`\u26A0\uFE0F Notifica\xE7\xE3o de backup grande enviada: ${size}`);
  }
  /**
   * Envia notificação de erro
   */
  async sendErrorNotification(error) {
    const currentDate = (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    await this.resend.emails.send({
      from: this.config.fromEmail,
      to: this.config.toEmail,
      subject: `\u274C Erro no Backup Autom\xE1tico Fottufy`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">\u274C Erro no Backup</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Fottufy - Sistema de Backup</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
              <h2 style="color: #721c24; margin: 0 0 15px 0;">\u{1F6A8} Falha no Backup Autom\xE1tico</h2>
              <p style="margin: 5px 0; color: #721c24;"><strong>Data:</strong> ${currentDate}</p>
              <p style="margin: 5px 0; color: #721c24;"><strong>Erro:</strong> ${error}</p>
            </div>
            
            <div style="background: #e2e3e5; padding: 15px; border-radius: 8px;">
              <p style="margin: 0; color: #383d41;">
                <strong>\u{1F527} A\xE7\xE3o Necess\xE1ria</strong><br>
                Verifique o sistema de backup e corrija o problema.
                O pr\xF3ximo backup ser\xE1 tentado no hor\xE1rio programado.
              </p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px;">
              <p>Sistema de Backup Autom\xE1tico Fottufy</p>
              <p>Monitore regularmente o status dos backups</p>
            </div>
          </div>
        </div>
      `
    });
    console.log(`\u274C Notifica\xE7\xE3o de erro enviada: ${error}`);
  }
  /**
   * Limpa arquivos temporários
   */
  async cleanupTempFiles() {
    try {
      const files = await fs4.readdir(this.config.tempDir);
      for (const file of files) {
        await fs4.remove(path5.join(this.config.tempDir, file));
      }
      console.log("\u{1F9F9} Arquivos tempor\xE1rios limpos");
    } catch (error) {
      console.warn("\u26A0\uFE0F Erro ao limpar arquivos tempor\xE1rios:", error);
    }
  }
};

// server/backup/automatic-backup-system.ts
var AutomaticBackupSystem = class {
  localSystem;
  emailSystem;
  constructor() {
    this.localSystem = new LocalBackupSystem();
    this.emailSystem = new EmailBackupSystem();
  }
  /**
   * Executa backup completo (local + email)
   */
  async executeFullBackup() {
    const startTime = Date.now();
    const result = { success: false };
    console.log("\u{1F680} INICIANDO BACKUP AUTOM\xC1TICO COMPLETO");
    console.log("=".repeat(50));
    try {
      console.log("\n1\uFE0F\u20E3 BACKUP LOCAL:");
      const localResult = await this.localSystem.createBackup();
      result.localBackup = localResult;
      if (localResult.success) {
        console.log(`\u2705 Backup local: ${localResult.size}`);
      } else {
        console.log(`\u274C Erro backup local: ${localResult.error}`);
      }
      console.log("\n2\uFE0F\u20E3 BACKUP POR EMAIL:");
      const emailResult = await this.emailSystem.createAndSendBackup();
      result.emailBackup = emailResult;
      if (emailResult.success) {
        console.log(`\u2705 Backup por email: ${emailResult.size}`);
      } else {
        console.log(`\u274C Erro backup email: ${emailResult.error}`);
      }
      result.success = localResult.success || emailResult.success;
      result.totalTime = Date.now() - startTime;
      console.log("\n\u{1F4CA} RESUMO DO BACKUP:");
      console.log(`\u23F1\uFE0F  Tempo total: ${(result.totalTime / 1e3).toFixed(2)}s`);
      console.log(`\u{1F4C1} Backup local: ${localResult.success ? "\u2705" : "\u274C"}`);
      console.log(`\u{1F4E7} Backup email: ${emailResult.success ? "\u2705" : "\u274C"}`);
      console.log(`\u{1F3AF} Status geral: ${result.success ? "\u2705 SUCESSO" : "\u274C FALHA"}`);
      return result;
    } catch (error) {
      result.success = false;
      result.totalTime = Date.now() - startTime;
      console.error("\u274C Erro cr\xEDtico no backup autom\xE1tico:", error.message);
      return result;
    }
  }
  /**
   * Executa apenas backup local
   */
  async executeLocalBackup() {
    const startTime = Date.now();
    console.log("\u{1F680} INICIANDO BACKUP LOCAL");
    const localResult = await this.localSystem.createBackup();
    return {
      success: localResult.success,
      localBackup: localResult,
      totalTime: Date.now() - startTime
    };
  }
  /**
   * Executa apenas backup por email
   */
  async executeEmailBackup() {
    const startTime = Date.now();
    console.log("\u{1F680} INICIANDO BACKUP POR EMAIL");
    const emailResult = await this.emailSystem.createAndSendBackup();
    return {
      success: emailResult.success,
      emailBackup: emailResult,
      totalTime: Date.now() - startTime
    };
  }
  /**
   * Obtém estatísticas dos backups
   */
  async getBackupStatistics() {
    const localStats = await this.localSystem.getBackupStats();
    let systemStatus = "healthy";
    if (localStats.totalBackups === 0) {
      systemStatus = "error";
    } else if (localStats.newestBackup && Date.now() - localStats.newestBackup.getTime() > 2 * 24 * 60 * 60 * 1e3) {
      systemStatus = "warning";
    }
    return {
      localStats,
      lastBackup: localStats.newestBackup,
      systemStatus
    };
  }
  /**
   * Testa conectividade dos sistemas
   */
  async testSystems() {
    console.log("\u{1F50D} TESTANDO SISTEMAS DE BACKUP...");
    const results = {
      local: false,
      email: false,
      database: false
    };
    try {
      const localBackups = await this.localSystem.listBackups();
      results.local = true;
      console.log(`\u2705 Sistema local OK (${localBackups.length} backups)`);
    } catch (error) {
      console.log(`\u274C Sistema local FALHOU: ${error}`);
    }
    try {
      if (process.env.RESEND_API_KEY) {
        results.email = true;
        console.log("\u2705 Sistema email OK (Resend configurado)");
      } else {
        console.log("\u26A0\uFE0F Sistema email: Resend n\xE3o configurado");
      }
    } catch (error) {
      console.log(`\u274C Sistema email FALHOU: ${error}`);
    }
    try {
      if (process.env.DATABASE_URL) {
        results.database = true;
        console.log("\u2705 Banco de dados OK");
      } else {
        console.log("\u274C DATABASE_URL n\xE3o configurado");
      }
    } catch (error) {
      console.log(`\u274C Banco de dados FALHOU: ${error}`);
    }
    return results;
  }
};

// server/backup/backup-scheduler.ts
var BackupScheduler = class {
  backupSystem;
  scheduledTask = null;
  isRunning = false;
  constructor() {
    this.backupSystem = new AutomaticBackupSystem();
  }
  /**
   * Inicia o agendamento de backup diário (3:00 AM)
   */
  start() {
    if (this.isRunning) {
      console.log("[BACKUP-SCHEDULER] \u26A0\uFE0F Agendamento j\xE1 est\xE1 rodando");
      return;
    }
    const cronSchedule = process.env.BACKUP_CRON_SCHEDULE || "0 3 * * *";
    console.log(`[BACKUP-SCHEDULER] \u{1F4C5} AGENDANDO BACKUP AUTOM\xC1TICO: ${cronSchedule}`);
    console.log("[BACKUP-SCHEDULER] \u{1F3AF} Sistema: Local + Email (100% autom\xE1tico)");
    this.scheduledTask = cron.schedule(cronSchedule, async () => {
      console.log("\n[BACKUP-SCHEDULER] \u{1F680} EXECUTANDO BACKUP AUTOM\xC1TICO AGENDADO");
      console.log("[BACKUP-SCHEDULER] " + "=".repeat(60));
      try {
        const result = await this.backupSystem.executeFullBackup();
        if (result.success) {
          console.log("\n[BACKUP-SCHEDULER] \u2705 BACKUP AUTOM\xC1TICO CONCLU\xCDDO COM SUCESSO");
          if (result.localBackup?.success) {
            console.log(`[BACKUP-SCHEDULER] \u{1F4C1} Local: ${result.localBackup.size}`);
          }
          if (result.emailBackup?.success) {
            console.log(`[BACKUP-SCHEDULER] \u{1F4E7} Email: ${result.emailBackup.size}`);
          }
          console.log(`[BACKUP-SCHEDULER] \u23F1\uFE0F Tempo: ${((result.totalTime || 0) / 1e3).toFixed(2)}s`);
          this.logBackupSuccess(result);
        } else {
          console.error("\n[BACKUP-SCHEDULER] \u274C FALHA NO BACKUP AUTOM\xC1TICO");
          if (result.localBackup?.error) {
            console.error(`[BACKUP-SCHEDULER] \u{1F4C1} Local: ${result.localBackup.error}`);
          }
          if (result.emailBackup?.error) {
            console.error(`[BACKUP-SCHEDULER] \u{1F4E7} Email: ${result.emailBackup.error}`);
          }
          this.logBackupFailure(`Local: ${result.localBackup?.error || "OK"}, Email: ${result.emailBackup?.error || "OK"}`);
        }
        const nextRun = this.getNextRunTime();
        console.log(`[BACKUP-SCHEDULER] \u23F0 Pr\xF3ximo backup: ${nextRun}`);
      } catch (error) {
        console.error("\n[BACKUP-SCHEDULER] \u274C ERRO CR\xCDTICO NO BACKUP AUTOM\xC1TICO:", error.message);
        this.logBackupFailure(error.message);
      }
      console.log("[BACKUP-SCHEDULER] " + "=".repeat(60));
    }, {
      scheduled: false,
      timezone: "America/Sao_Paulo"
    });
    this.scheduledTask.start();
    this.isRunning = true;
    console.log("[BACKUP-SCHEDULER] \u2705 Scheduler de backup iniciado com sucesso");
    console.log("[BACKUP-SCHEDULER] \u{1F4CB} Funcionalidades ativas:");
    console.log("[BACKUP-SCHEDULER]    \u2022 Backup local com rota\xE7\xE3o (7 dias)");
    console.log("[BACKUP-SCHEDULER]    \u2022 Backup por email autom\xE1tico");
    console.log("[BACKUP-SCHEDULER]    \u2022 Limpeza autom\xE1tica de arquivos tempor\xE1rios");
  }
  /**
   * Para o agendamento
   */
  stop() {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      this.isRunning = false;
      console.log("[BACKUP-SCHEDULER] \u23F9\uFE0F Scheduler de backup interrompido");
    }
  }
  /**
   * Executa backup manual completo para teste
   */
  async executeManualBackup() {
    console.log("\n[BACKUP-SCHEDULER] \u{1F527} EXECUTANDO BACKUP MANUAL...");
    try {
      const result = await this.backupSystem.executeFullBackup();
      const message = result.success ? `Backup conclu\xEDdo em ${((result.totalTime || 0) / 1e3).toFixed(2)}s` : "Falha no backup";
      return {
        success: result.success,
        message,
        details: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro cr\xEDtico: ${error.message}`
      };
    }
  }
  /**
   * Executa apenas backup local para teste
   */
  async executeLocalBackupOnly() {
    console.log("\n[BACKUP-SCHEDULER] \u{1F4C1} EXECUTANDO BACKUP LOCAL...");
    try {
      const result = await this.backupSystem.executeLocalBackup();
      return {
        success: result.success,
        message: result.success ? `Backup local: ${result.localBackup?.size}` : `Erro: ${result.localBackup?.error}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro: ${error.message}`
      };
    }
  }
  /**
   * Executa apenas backup por email para teste
   */
  async executeEmailBackupOnly() {
    console.log("\n[BACKUP-SCHEDULER] \u{1F4E7} EXECUTANDO BACKUP POR EMAIL...");
    try {
      const result = await this.backupSystem.executeEmailBackup();
      return {
        success: result.success,
        message: result.success ? `Backup por email: ${result.emailBackup?.size}` : `Erro: ${result.emailBackup?.error}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro: ${error.message}`
      };
    }
  }
  /**
   * Testa todos os sistemas
   */
  async testBackupSystems() {
    console.log("\n[BACKUP-SCHEDULER] \u{1F50D} TESTANDO SISTEMAS DE BACKUP...");
    try {
      const systems = await this.backupSystem.testSystems();
      const statistics = await this.backupSystem.getBackupStatistics();
      return {
        success: Object.values(systems).some(Boolean),
        systems,
        statistics
      };
    } catch (error) {
      return {
        success: false,
        systems: { local: false, email: false, database: false }
      };
    }
  }
  /**
   * Calcula próxima execução do cron
   */
  getNextRunTime(schedule) {
    const cronSchedule = schedule || process.env.BACKUP_CRON_SCHEDULE || "0 3 * * *";
    const parts = cronSchedule.split(" ");
    if (parts.length >= 5) {
      const minute = parts[0];
      const hour = parts[1];
      const now = /* @__PURE__ */ new Date();
      const next = /* @__PURE__ */ new Date();
      next.setMinutes(minute === "*" ? now.getMinutes() : parseInt(minute));
      next.setHours(hour === "*" ? now.getHours() : parseInt(hour));
      next.setSeconds(0);
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      return next.toLocaleString("pt-BR");
    }
    return "Hor\xE1rio n\xE3o calculado";
  }
  /**
   * Log de backup bem-sucedido
   */
  logBackupSuccess(result) {
    const logEntry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      status: "SUCCESS",
      localBackup: result.localBackup?.success || false,
      emailBackup: result.emailBackup?.success || false,
      totalTime: result.totalTime,
      localSize: result.localBackup?.size,
      emailSize: result.emailBackup?.size
    };
    console.log("[BACKUP-LOG]", JSON.stringify(logEntry));
  }
  /**
   * Log de backup com falha
   */
  logBackupFailure(message) {
    const logEntry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      status: "FAILURE",
      message
    };
    console.error("[BACKUP-LOG]", JSON.stringify(logEntry));
  }
  /**
   * Verifica status do scheduler
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      schedule: process.env.BACKUP_CRON_SCHEDULE || "0 3 * * *",
      nextRun: this.isRunning ? this.getNextRunTime() : "Agendamento parado",
      systemType: "Local + Email",
      features: [
        "Backup local com rota\xE7\xE3o autom\xE1tica",
        "Backup por email autom\xE1tico",
        "Limpeza de arquivos tempor\xE1rios",
        "100% sem credenciais externas"
      ],
      timezone: "America/Sao_Paulo"
    };
  }
};
var backupScheduler = null;
function initializeBackupScheduler() {
  if (!backupScheduler) {
    backupScheduler = new BackupScheduler();
  }
  return backupScheduler;
}

// server/cleanup-scheduler.ts
init_db();
init_r2();
import { DeleteObjectsCommand as DeleteObjectsCommand2 } from "@aws-sdk/client-s3";
var PROTECTED_USER_ID = 5;
var INACTIVE_DAYS_THRESHOLD = 7;
var PROJECT_AGE_DAYS = 30;
var R2_BATCH_SIZE = 500;
var DELAY_BETWEEN_ACCOUNTS_MS = 2e3;
var DELAY_BETWEEN_BATCHES_MS = 1e3;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function extractR2Key(photo) {
  const url = photo.url || photo.filename || "";
  if (url.startsWith("/uploads/")) return url.replace("/uploads/", "");
  if (url.includes("cdn.fottufy.com/")) return url.split("cdn.fottufy.com/")[1];
  if (url.includes("r2.cloudflarestorage.com/")) {
    const parts = url.split("/");
    return parts[parts.length - 1];
  }
  if (photo.filename && !photo.filename.includes("/")) return photo.filename;
  return null;
}
async function deleteBatchFromR2(keys) {
  if (keys.length === 0) return 0;
  try {
    await r2Client.send(new DeleteObjectsCommand2({
      Bucket: BUCKET_NAME,
      Delete: { Objects: keys.map((k) => ({ Key: k })), Quiet: true }
    }));
    return keys.length;
  } catch (err) {
    console.error(`[R2-CLEANUP] Erro no batch R2: ${err.message}`);
    return 0;
  }
}
async function runCleanup() {
  const startTime = Date.now();
  console.log(`[R2-CLEANUP] === Iniciando varredura diaria ===`);
  console.log(`[R2-CLEANUP] Data: ${(/* @__PURE__ */ new Date()).toISOString()}`);
  console.log(`[R2-CLEANUP] Regra: contas sem assinatura ativa ha ${INACTIVE_DAYS_THRESHOLD}+ dias, projetos com ${PROJECT_AGE_DAYS}+ dias`);
  console.log(`[R2-CLEANUP] Conta protegida: user_id=${PROTECTED_USER_ID}`);
  try {
    const { rows: accounts } = await pool.query(`
      SELECT u.id as user_id, u.email, u.subscription_status, u.subscription_end_date
      FROM users u
      WHERE u.subscription_status NOT IN ('active', 'pending_cancellation')
        AND u.id != $1
        AND (
          u.subscription_end_date IS NOT NULL 
          AND u.subscription_end_date < NOW() - INTERVAL '${INACTIVE_DAYS_THRESHOLD} days'
        )
        AND EXISTS (
          SELECT 1 FROM projects p
          WHERE p.photographer_id = u.id
            AND p.created_at < NOW() - INTERVAL '${PROJECT_AGE_DAYS} days'
            AND jsonb_array_length(COALESCE(p.photos, '[]'::jsonb)) > 0
        )
    `, [PROTECTED_USER_ID]);
    if (accounts.length === 0) {
      console.log(`[R2-CLEANUP] Nenhuma conta elegivel para limpeza`);
      console.log(`[R2-CLEANUP] === Varredura concluida em ${Date.now() - startTime}ms ===`);
      return;
    }
    console.log(`[R2-CLEANUP] ${accounts.length} contas encontradas para limpeza`);
    let totalPhotosDeleted = 0;
    let totalProjectsCleaned = 0;
    let accountsProcessed = 0;
    for (const account of accounts) {
      const freshCheck = await pool.query(
        `SELECT subscription_status, subscription_end_date FROM users WHERE id = $1`,
        [account.user_id]
      );
      if (freshCheck.rows.length > 0) {
        const status = freshCheck.rows[0].subscription_status;
        const endDate = freshCheck.rows[0].subscription_end_date;
        if (["active", "pending_cancellation"].includes(status)) {
          console.log(`[R2-CLEANUP] Pulando user_id=${account.user_id} (${account.email}) - assinatura reativada`);
          continue;
        }
        if (endDate && new Date(endDate) > new Date(Date.now() - INACTIVE_DAYS_THRESHOLD * 24 * 60 * 60 * 1e3)) {
          console.log(`[R2-CLEANUP] Pulando user_id=${account.user_id} (${account.email}) - inativo ha menos de ${INACTIVE_DAYS_THRESHOLD} dias`);
          continue;
        }
      }
      const { rows: projects2 } = await pool.query(`
        SELECT id, photos
        FROM projects
        WHERE photographer_id = $1
          AND created_at < NOW() - INTERVAL '${PROJECT_AGE_DAYS} days'
          AND jsonb_array_length(COALESCE(photos, '[]'::jsonb)) > 0
      `, [account.user_id]);
      if (projects2.length === 0) continue;
      let accountKeys = [];
      let projectIds = [];
      for (const project of projects2) {
        const photos2 = project.photos || [];
        projectIds.push(project.id);
        for (const photo of photos2) {
          const key = extractR2Key(photo);
          if (key) accountKeys.push(key);
        }
      }
      if (accountKeys.length === 0) continue;
      console.log(`[R2-CLEANUP] Processando user_id=${account.user_id} (${account.email}): ${accountKeys.length} fotos em ${projects2.length} projetos`);
      let accountDeleted = 0;
      for (let i = 0; i < accountKeys.length; i += R2_BATCH_SIZE) {
        const batch = accountKeys.slice(i, i + R2_BATCH_SIZE);
        const deleted = await deleteBatchFromR2(batch);
        accountDeleted += deleted;
        if (i + R2_BATCH_SIZE < accountKeys.length) {
          await sleep(DELAY_BETWEEN_BATCHES_MS);
        }
      }
      if (accountDeleted > 0) {
        await pool.query(
          `UPDATE projects SET photos = '[]'::jsonb, selected_photos = '[]'::jsonb WHERE id = ANY($1)`,
          [projectIds]
        );
      }
      totalPhotosDeleted += accountDeleted;
      totalProjectsCleaned += projectIds.length;
      accountsProcessed++;
      console.log(`[R2-CLEANUP] user_id=${account.user_id}: ${accountDeleted} fotos deletadas, ${projectIds.length} projetos limpos`);
      if (accountsProcessed < accounts.length) {
        await sleep(DELAY_BETWEEN_ACCOUNTS_MS);
      }
    }
    const duration = ((Date.now() - startTime) / 1e3).toFixed(1);
    console.log(`[R2-CLEANUP] === Resultado Final ===`);
    console.log(`[R2-CLEANUP] Contas processadas: ${accountsProcessed}`);
    console.log(`[R2-CLEANUP] Fotos deletadas do R2: ${totalPhotosDeleted}`);
    console.log(`[R2-CLEANUP] Projetos limpos: ${totalProjectsCleaned}`);
    console.log(`[R2-CLEANUP] Duracao: ${duration}s`);
    console.log(`[R2-CLEANUP] =====================`);
  } catch (error) {
    console.error(`[R2-CLEANUP] Erro na varredura:`, error.message);
  }
}
function startCleanupScheduler() {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1e3;
  const INITIAL_DELAY = 5 * 60 * 1e3;
  console.log(`[R2-CLEANUP] Sistema de limpeza automatica iniciado`);
  console.log(`[R2-CLEANUP] Primeira execucao em ${INITIAL_DELAY / 6e4} minutos`);
  console.log(`[R2-CLEANUP] Proximas execucoes a cada 24 horas`);
  setTimeout(() => {
    runCleanup();
    setInterval(runCleanup, TWENTY_FOUR_HOURS);
  }, INITIAL_DELAY);
}

// server/security.ts
import helmet from "helmet";
import rateLimit from "express-rate-limit";
var securityHeaders = helmet({
  // Headers básicos de segurança com suporte para Stripe
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
      // Stripe support
      connectSrc: ["'self'", "https:", "wss:", "ws:", "https://api.stripe.com"],
      // Stripe API
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      // Stripe frames
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:", "blob:"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"]
    }
  },
  // Previne clickjacking
  frameguard: { action: "deny" },
  // Remove cabeçalho X-Powered-By
  hidePoweredBy: true,
  // HSTS para HTTPS (só ativa em produção)
  hsts: process.env.NODE_ENV === "production" ? {
    maxAge: 31536e3,
    // 1 ano
    includeSubDomains: true,
    preload: false
  } : false,
  // Previne MIME sniffing
  noSniff: true,
  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: false,
  // Desabilitado para compatibilidade
  // Referrer Policy
  referrerPolicy: { policy: "same-origin" }
});
var generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutos
  max: 1e3,
  // máximo 1000 requisições por IP por janela (muito conservador)
  message: {
    error: "Muitas requisi\xE7\xF5es. Tente novamente em alguns minutos.",
    details: "Rate limit atingido"
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Não aplicar rate limit para admins, requisições locais e webhooks
  skip: (req) => {
    const isLocalhost = req.ip === "127.0.0.1" || req.ip === "::1" || req.ip?.includes("localhost");
    const isAdmin = req.user && req.user.role === "admin";
    const isWebhook = req.path.includes("/webhook/");
    return isLocalhost || isAdmin || isWebhook;
  }
});
var authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutos
  max: 10,
  // máximo 10 tentativas de login por IP por janela
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
    details: "Limite de tentativas de autentica\xE7\xE3o atingido"
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Aplicar apenas em rotas de autenticação
  skipSuccessfulRequests: true
  // Não contar requisições bem-sucedidas
});
var uploadRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 minuto
  max: 30,
  // máximo 30 uploads por minuto por IP
  message: {
    error: "Muitos uploads em pouco tempo. Aguarde um minuto.",
    details: "Limite de upload atingido"
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Aplicar apenas para usuários autenticados
  skip: (req) => {
    return !req.isAuthenticated || !req.isAuthenticated();
  }
});
var advancedUploadValidation = (req, res, next) => {
  if (req.method === "POST" && req.path.includes("upload")) {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        error: "Tipo de conte\xFAdo inv\xE1lido para upload",
        expected: "multipart/form-data"
      });
    }
    const contentLength = parseInt(req.headers["content-length"] || "0");
    const maxSize = 500 * 1024 * 1024;
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: "Arquivo muito grande",
        maxSize: "500MB",
        receivedSize: `${Math.round(contentLength / 1024 / 1024)}MB`
      });
    }
  }
  next();
};
var securityLogger = (req, res, next) => {
  const isSecuritySensitive = req.path.includes("/auth") || req.path.includes("/login") || req.path.includes("/reset-password") || req.path.includes("/admin") || req.method === "DELETE";
  if (isSecuritySensitive && process.env.NODE_ENV === "production") {
    console.log(`[SECURITY] ${req.method} ${req.path} - IP: ${req.ip?.substring(0, 10)}*** - User: ${req.user ? "authenticated" : "anonymous"}`);
  }
  next();
};
var corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5000",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5000",
      "https://fottufy.com",
      "https://www.fottufy.com",
      process.env.FRONTEND_URL,
      process.env.ALLOWED_ORIGIN,
      // Railway public domain injected automatically as env var
      process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : void 0,
      process.env.RAILWAY_STATIC_URL
    ].filter(Boolean);
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    if (!origin) {
      return callback(null, true);
    }
    if (origin.endsWith(".railway.app") || origin.endsWith(".up.railway.app")) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[SECURITY] CORS blocked request from origin: ${origin}`);
      callback(new Error("Origem n\xE3o permitida pelo CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  maxAge: 86400
  // Cache preflight por 24 horas
};
var generateSecureSessionSecret = () => {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET !== "studio-foto-session-secret-key-2023") {
    return process.env.SESSION_SECRET;
  }
  const crypto3 = __require("crypto");
  const base = process.env.DATABASE_URL || process.env.PORT || Date.now().toString();
  const hash = crypto3.createHash("sha256").update(base + "fottufy-secret-salt").digest("hex");
  return `fottufy-${hash.substring(0, 32)}`;
};
var inputSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    const fieldsToSanitize = ["name", "client_name", "comment", "email"];
    fieldsToSanitize.forEach((field) => {
      if (req.body[field] && typeof req.body[field] === "string") {
        req.body[field] = req.body[field].replace(/<script[^>]*>.*?<\/script>/gi, "").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "").trim();
      }
    });
  }
  next();
};

// server/index.ts
init_auth();
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path6.dirname(__filename2);
if (!global.gc) {
  try {
    __require("v8").setFlagsFromString("--expose_gc");
    global.gc = __require("vm").runInNewContext("gc");
    console.log("[GC] Garbage collection manual habilitado");
  } catch (e) {
    console.warn("[GC] N\xE3o foi poss\xEDvel habilitar garbage collection manual");
  }
}
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === "studio-foto-session-secret-key-2023") {
  process.env.SESSION_SECRET = generateSecureSessionSecret();
  console.log("[SECURITY] SESSION_SECRET definido com valor seguro");
}
var uploadsDir = path6.join(process.cwd(), "uploads");
if (!fs5.existsSync(uploadsDir)) {
  fs5.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory: ${uploadsDir}`);
}
console.log(`Upload directory path: ${uploadsDir}`);
var multerStorage = multer2.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const id = nanoid4();
    const ext = path6.extname(file.originalname) || getExtensionFromMimeType2(file.mimetype);
    cb(null, `${id}${ext}`);
    console.log(`File upload: ${file.originalname} \u2192 ${id}${ext}`);
  }
});
function getExtensionFromMimeType2(mimetype) {
  switch (mimetype) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/gif":
      return ".gif";
    case "image/webp":
      return ".webp";
    default:
      return ".jpg";
  }
}
var fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
var upload = multer2({
  storage: multerStorage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024
    // 500MB limit - mais seguro que 1GB
  }
});
var app = express2();
app.set("trust proxy", 1);
app.use(securityHeaders);
app.use(generalRateLimit);
app.use(inputSanitizer);
app.use(securityLogger);
app.use(advancedUploadValidation);
app.use("/api/webhook/stripe", express2.raw({ type: "application/json" }));
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: true, limit: "10mb" }));
app.use(express2.static(path6.join(process.cwd(), "public"), {
  setHeaders: (res, filepath) => {
    const isHTML = filepath.endsWith(".html");
    const isJavaScript = filepath.endsWith(".js") || filepath.endsWith(".mjs") || filepath.endsWith(".jsx") || filepath.endsWith(".tsx");
    const isCSS = filepath.endsWith(".css");
    const isJSON = filepath.endsWith(".json");
    if (isHTML) {
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
    } else if (isJavaScript) {
      res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
    } else if (isCSS) {
      res.setHeader("Content-Type", "text/css; charset=UTF-8");
    } else if (isJSON) {
      res.setHeader("Content-Type", "application/json; charset=UTF-8");
    }
    if (filepath.includes("reset-password.html") || filepath.includes("create-password.html")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      console.log(`Servindo p\xE1gina cr\xEDtica de senha: ${filepath} com Content-Type: ${res.getHeader("Content-Type")}`);
    }
  }
}));
app.use(cors(corsConfig));
setupAuth(app);
app.use("/api/auth", authRateLimit);
app.use("/api/login", authRateLimit);
app.use("/api/reset-password", authRateLimit);
app.use("/api/upload", uploadRateLimit);
app.use("/api/projects/*/upload", uploadRateLimit);
app.use("/api/projects/*/add-photos", uploadRateLimit);
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "development" && process.env.DEBUG_REQUESTS === "true") {
    if (req.path.includes("/auth") || req.path.includes("/login") || req.path.includes("/logout")) {
      console.log(`[DEBUG-REQ] ${req.method} ${req.path} | Auth: ${req.isAuthenticated ? req.isAuthenticated() : "N/A"} | User: ${req.user ? req.user.id : "none"}`);
    }
  }
  next();
});
app.use("/uploads", express2.static(uploadsDir));
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as time, current_database() as db_name");
    const userCount = await pool.query("SELECT COUNT(*) as count FROM users");
    const projectCount = await pool.query("SELECT COUNT(*) as count FROM projects");
    res.json({
      status: "connected",
      timestamp: result.rows[0].time,
      database: result.rows[0].db_name,
      tables: {
        users: parseInt(userCount.rows[0].count),
        projects: parseInt(projectCount.rows[0].count)
      },
      environment: process.env.NODE_ENV,
      host: process.env.PGHOST || process.env.DB_HOST || "localhost"
    });
  } catch (error) {
    console.error("Erro na rota de teste:", error);
    res.status(500).json({
      error: "Database connection error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : void 0
    });
  }
});
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "development" || process.env.DEBUG_API === "true") {
    const start = Date.now();
    const path7 = req.path;
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path7.startsWith("/api") && (res.statusCode >= 400 || process.env.NODE_ENV === "development")) {
        log(`${req.method} ${path7} ${res.statusCode} in ${duration}ms`);
      }
    });
  }
  next();
});
(async () => {
  console.log("===== CONFIGURA\xC7\xD5ES DO AMBIENTE =====");
  console.log(`[ENV] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[ENV] PORT: ${process.env.PORT || "5000 (padr\xE3o)"}`);
  console.log(`[ENV] DEBUG_MEMORY: ${process.env.DEBUG_MEMORY === "true" ? "ATIVADO" : "DESATIVADO"}`);
  console.log(`[ENV] DATABASE_URL: ${process.env.DATABASE_URL ? "CONFIGURADO" : "N\xC3O CONFIGURADO"}`);
  console.log("====================================");
  console.log("Using Cloudflare R2 for storage - bucket must be created manually in Cloudflare dashboard");
  const server = await registerRoutes(app);
  setTimeout(() => initThumbnailQueue().catch(console.error), 5e3);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (!res.headersSent) {
      res.status(status).json({ message });
    } else {
      console.warn("Headers j\xE1 enviados, n\xE3o foi poss\xEDvel enviar resposta de erro para:", message);
    }
    console.error("Erro capturado pelo middleware global:", err);
  });
  app.use((req, res, next) => {
    const knownSPARoutes = [
      "/reset-password",
      "/create-password",
      "/forgot-password",
      "/dashboard",
      "/auth",
      "/pricing",
      "/upload"
    ];
    const isKnownSPARoute = knownSPARoutes.some(
      (route) => req.path === route || req.path.startsWith(`${route}/`)
    );
    if (isKnownSPARoute) {
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
    } else if (req.path.includes(".")) {
      const ext = path6.extname(req.path).toLowerCase();
      if (ext === ".js" || ext === ".mjs") {
        res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
      } else if (ext === ".css") {
        res.setHeader("Content-Type", "text/css; charset=UTF-8");
      } else if (ext === ".json") {
        res.setHeader("Content-Type", "application/json; charset=UTF-8");
      } else if (ext === ".html") {
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
      } else if (ext === ".png") {
        res.setHeader("Content-Type", "image/png");
      } else if (ext === ".jpg" || ext === ".jpeg") {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (ext === ".svg") {
        res.setHeader("Content-Type", "image/svg+xml");
      }
    }
    next();
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    const staticMiddleware = express2.static(path6.resolve(__dirname2, "public"), {
      index: false,
      // Não servir index.html automaticamente
      setHeaders: (res, filepath) => {
        const ext = path6.extname(filepath).toLowerCase();
        if (ext === ".js" || ext === ".mjs") {
          res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
        } else if (ext === ".css") {
          res.setHeader("Content-Type", "text/css; charset=UTF-8");
        } else if (ext === ".html") {
          res.setHeader("Content-Type", "text/html; charset=UTF-8");
        }
      }
    });
    app.use(staticMiddleware);
    app.get(["*/reset-password.html", "*/create-password.html"], (req, res, next) => {
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      next();
    });
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        return next();
      }
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.sendFile(path6.resolve(__dirname2, "public", "index.html"));
    });
  }
  const port = Number(process.env.PORT) || 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port} (NODE_ENV: ${process.env.NODE_ENV})`);
    setupMemoryMonitor();
  });
  function setupMemoryMonitor() {
    const dbHealthCheckInterval2 = startDbHealthCheck(12e4);
    const cleanupExpiredSessions = async () => {
      try {
        console.log("[SESSION-CLEANUP] Iniciando limpeza de sess\xF5es expiradas...");
        const result = await pool.query("DELETE FROM session WHERE expire < NOW()");
        const deletedCount = result.rowCount || 0;
        if (deletedCount > 0) {
          console.log(`[SESSION-CLEANUP] ${deletedCount} sess\xF5es expiradas removidas`);
        } else {
          console.log("[SESSION-CLEANUP] Nenhuma sess\xE3o expirada encontrada");
        }
      } catch (error) {
        console.error("[SESSION-CLEANUP] Erro ao limpar sess\xF5es:", error);
      }
    };
    const processExpiredDowngrades = async () => {
      try {
        console.log("[DOWNGRADE] Verificando downgrades expirados...");
        const processedCount = await storage.processExpiredDowngrades();
        if (processedCount > 0) {
          console.log(`[DOWNGRADE] ${processedCount} usu\xE1rios convertidos para plano gratuito`);
        } else {
          console.log("[DOWNGRADE] Nenhum downgrade expirado encontrado");
        }
      } catch (error) {
        console.error("[DOWNGRADE] Erro ao processar downgrades expirados:", error);
      }
    };
    const processExpiredManualActivations = async () => {
      try {
        console.log("[ADM] Verificando ativa\xE7\xF5es manuais expiradas (34 dias)...");
        const processedCount = await storage.processExpiredManualActivations();
        if (processedCount > 0) {
          console.log(`[ADM] ${processedCount} usu\xE1rios com ativa\xE7\xE3o manual expirada processados`);
        } else {
          console.log("[ADM] Nenhuma ativa\xE7\xE3o manual expirada encontrada");
        }
      } catch (error) {
        console.error("[ADM] Erro ao processar ativa\xE7\xF5es manuais expiradas:", error);
      }
    };
    const processExpiredSubscriptionsAuto = async () => {
      try {
        console.log("[EXPIRED-AUTO] Verificando assinaturas com data de expira\xE7\xE3o vencida...");
        const processedCount = await storage.processExpiredSubscriptionsWithoutPayment();
        if (processedCount > 0) {
          console.log(`[EXPIRED-AUTO] ${processedCount} usu\xE1rios com assinatura vencida convertidos para plano gratuito`);
        } else {
          console.log("[EXPIRED-AUTO] Nenhuma assinatura vencida encontrada para downgrade");
        }
      } catch (error) {
        console.error("[EXPIRED-AUTO] Erro ao processar assinaturas vencidas:", error);
      }
    };
    setTimeout(cleanupExpiredSessions, 6e4);
    setTimeout(processExpiredDowngrades, 3e4);
    setTimeout(processExpiredManualActivations, 45e3);
    setTimeout(processExpiredSubscriptionsAuto, 6e4);
    const sessionCleanupIntervalId = setInterval(cleanupExpiredSessions, 6 * 60 * 60 * 1e3);
    const downgradeIntervalId = setInterval(processExpiredDowngrades, 36e5);
    const manualActivationIntervalId = setInterval(processExpiredManualActivations, 36e5);
    const expiredSubscriptionsIntervalId = setInterval(processExpiredSubscriptionsAuto, 6 * 60 * 60 * 1e3);
    console.log("[SESSION-CLEANUP] Sistema de limpeza autom\xE1tica iniciado - verifica\xE7\xE3o a cada 6 horas");
    console.log("[DOWNGRADE] Sistema autom\xE1tico de downgrade iniciado - verifica\xE7\xE3o a cada hora");
    console.log("[ADM] Sistema de controle manual ADM iniciado - verifica\xE7\xE3o a cada hora (34 dias)");
    console.log("[EXPIRED-AUTO] Sistema autom\xE1tico de expira\xE7\xE3o iniciado - verifica\xE7\xE3o a cada 6 horas");
    try {
      const backupScheduler2 = initializeBackupScheduler();
      backupScheduler2.start();
      console.log("[BACKUP] \u2705 Sistema de backup autom\xE1tico iniciado");
      console.log(`[BACKUP] \u{1F4C1} Backup local: ${process.env.BACKUP_DIR || path6.join(process.cwd(), "backups")} (rota\xE7\xE3o 7 dias)`);
      console.log("[BACKUP] \u{1F4E7} Backup por email: Resend configurado");
      console.log("[BACKUP] \u23F0 Execu\xE7\xE3o di\xE1ria: 3:00 AM (configur\xE1vel)");
      console.log("[BACKUP] \u{1F3AF} Sistema: Local + Email (100% autom\xE1tico)");
    } catch (error) {
      console.error("[BACKUP] \u274C Erro ao inicializar sistema de backup:", error.message);
      console.error("[BACKUP] \u26A0\uFE0F Backups autom\xE1ticos desabilitados");
    }
    try {
      startCleanupScheduler();
    } catch (error) {
      console.error("[R2-CLEANUP] Erro ao inicializar sistema de limpeza:", error.message);
    }
    const bytesToMB = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;
    let lastFullLogTime = 0;
    const logMemoryUsage = () => {
      const memoryData = process.memoryUsage();
      const now = Date.now();
      const isFullInterval = now - lastFullLogTime >= 10 * 60 * 1e3;
      if (process.env.DEBUG_MEMORY === "true" || isFullInterval) {
        if (isFullInterval) {
          lastFullLogTime = now;
        }
        console.log("=== MEMORY USAGE ===");
        console.log(`RSS: ${bytesToMB(memoryData.rss)} MB`);
        console.log(`Heap Total: ${bytesToMB(memoryData.heapTotal)} MB`);
        console.log(`Heap Used: ${bytesToMB(memoryData.heapUsed)} MB`);
        console.log(`External: ${bytesToMB(memoryData.external)} MB`);
        console.log(`Heap Used/Total: ${(memoryData.heapUsed / memoryData.heapTotal * 100).toFixed(2)}%`);
        if (pool) {
          console.log(`DB Pool: Total=${pool.totalCount}, Idle=${pool.idleCount}, Waiting=${pool.waitingCount}`);
        }
        if (process.env.DEBUG_MEMORY === "true" && storage && "users" in storage && "projects" in storage) {
          const usersObj = storage.users;
          const projectsObj = storage.projects;
          if (usersObj && typeof usersObj.getStats === "function" && projectsObj && typeof projectsObj.getStats === "function") {
            try {
              const userCacheStats = usersObj.getStats();
              const projectCacheStats = projectsObj.getStats();
              console.log("=== CACHE STATS ===");
              console.log(`Users cache: ${userCacheStats.size}/${userCacheStats.maxSize} items (${Math.round(userCacheStats.hitRatio * 100)}% hit ratio)`);
              console.log(`Projects cache: ${projectCacheStats.size}/${projectCacheStats.maxSize} items (${Math.round(projectCacheStats.hitRatio * 100)}% hit ratio)`);
              console.log(`Oldest item age: Users ${Math.round(userCacheStats.oldestItemAge / 60)} min, Projects ${Math.round(projectCacheStats.oldestItemAge / 60)} min`);
            } catch (error) {
              if (process.env.DEBUG_MEMORY === "true") {
                console.log("=== CACHE STATS: Not available ===");
              }
            }
          }
        }
        console.log("===================");
      }
    };
    logMemoryUsage();
    const intervalId = setInterval(logMemoryUsage, 6e4);
    const gcIntervalId = setInterval(() => {
      if (global.gc) {
        try {
          global.gc();
          if (process.env.DEBUG_MEMORY === "true") {
            console.log("[MEMORY] Manual garbage collection executed");
          }
        } catch (e) {
          if (process.env.DEBUG_MEMORY === "true") {
            console.error("[MEMORY] Failed to execute garbage collection");
          }
        }
      }
    }, 15 * 60 * 1e3);
    process.on("SIGINT", () => {
      clearInterval(intervalId);
      clearInterval(gcIntervalId);
      clearInterval(dbHealthCheckInterval2);
      clearInterval(downgradeIntervalId);
      pool.end().catch((err) => console.error("Error closing DB pool on SIGINT:", err));
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      clearInterval(intervalId);
      clearInterval(gcIntervalId);
      clearInterval(dbHealthCheckInterval2);
      clearInterval(downgradeIntervalId);
      pool.end().catch((err) => console.error("Error closing DB pool on SIGTERM:", err));
      process.exit(0);
    });
  }
})();
export {
  upload
};
