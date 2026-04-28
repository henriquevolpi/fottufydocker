# Fottufy - PhotoProManager

## Overview

Fottufy is a modern SaaS platform designed for professional photographers. Its primary purpose is to provide tools for organizing, sharing, and selling photo galleries to clients. The platform supports subscription-based plans, secure photo storage on Cloudflare R2, and integrated payment processing with Stripe and Hotmart.

## User Preferences

Preferred communication style: Simple, everyday language.

**CRÍTICO**: NUNCA mexer no banco de dados existente. O sistema de portfólio é completamente independente usando apenas dados mock. Não tocar em tabelas, migrações ou estruturas que já funcionam. Sistema totalmente estável após restauração em 30/06/2025.

**AVISO IMPORTANTE**: Alguns dados foram perdidos durante tentativas anteriores. O backup usado não era completo. NUNCA mais tentar restaurar, migrar ou modificar dados. Sistema deve permanecer exatamente como está funcionando.

## System Architecture

### UI/UX Decisions
- **Frontend Framework**: React with TypeScript
- **UI Components**: Radix UI with shadcn/ui for a modern, accessible interface.
- **Styling**: Tailwind CSS for utility-first styling.

### Technical Implementations
- **Backend**: Node.js with Express.js and TypeScript.
- **Database ORM**: Drizzle ORM for PostgreSQL, handling schema and migrations.
- **Authentication**: Passport.js with local strategy, bcrypt for hashing, and PostgreSQL-backed sessions.
- **Image Processing**: Sharp library for resizing and dynamic watermarking.
- **File Storage**: Cloudflare R2 (S3-compatible) for primary photo storage.
- **Subscription Management**: Supports free, basic, standard, and professional plans with plan-based upload quotas. Hotmart offers are managed dynamically via an admin panel using a `hotmart_offers` table. An automatic downgrade system is in place for expired subscriptions.
- **Email System**: Resend API for transactional emails (welcome, password reset, subscription notifications) using HTML templates.
- **Deployment**: Runs on Replit. Build: `npm run build`, Run: `node ./dist/index.cjs`. Dev: `npm run dev` (port 5000).

### Feature Specifications
- **Authentication**: Secure registration, login, and password reset workflows, with webhook integration to BotConversa for CRM.
- **Photo Upload**: Two upload systems:
  - **V1 (original)**: Browser compresses → 30-photo batches → XHR → busboy streaming → R2 → photos stored as JSONB in `projects` table.
  - **V2 (new)**: No browser compression → XHR multipart in batches of 10 → server busboy streams to R2 → photos stored in normalized `photos` table → `processingStatus='pending'` → Sharp thumbnail queue (concurrency=1, 400px JPEG) → `processingStatus='ready'`. Test page at `/upload-test`.
- **Thumbnail Queue** (`server/thumbnailQueue.ts`): Background Sharp processing with concurrency=1. Downloads original from R2, generates 400px JPEG thumb, uploads back to R2, updates `photos.thumbnailUrl` and `processingStatus`.
- **Project View (V2)**: `GET /api/projects/:id` detects UUID format and queries `newProjects`+`photos` tables. Project-view polls every 3s while photos have `processingStatus=pending/processing`, shows spinner per card. Lightbox always uses original URL.
- **Admin Panel**: Comprehensive dashboard for managing projects, users, and Hotmart offers, including real-time photo counts and filtering options.
- **Portfolio System**: Allows users to create and manage public portfolio pages (`/portfolio/[slug]`) using real R2-hosted photos from their projects.
- **Security**: Centralized security middleware with Helmet for HTTP headers, conservative rate limiting, enhanced session and cookie security, and stricter CORS policies.
- **R2 Auto-Cleanup**: Daily automated cleanup system (`server/cleanup-scheduler.ts`) that deletes R2 photos from accounts inactive for 7+ days (based on `subscription_end_date`) with projects older than 30 days. Processes in rate-limited batches (500 items, 2s between accounts) to avoid server overload. Exempts accounts that reactivate subscriptions and always protects user_id=5 (nata@hotmail.com). Runs 5 minutes after startup, then every 24 hours.

## External Dependencies

- **Stripe**: For credit card processing and subscription management.
- **Hotmart**: Brazilian payment gateway, integrated via webhooks for subscription updates.
- **Cloudflare R2**: Primary object storage for photos.
- **Cloudflare CDN**: For global content delivery.
- **Resend**: Transactional email service.
- **BotConversa**: CRM integration via webhooks for user registration.
- **Drizzle Kit**: Database schema management and migration tool.
- **Sharp**: Image processing library.
- **Multer**: Middleware for handling `multipart/form-data`, primarily for file uploads.