# Multi-stage build para Node.js + React (Vite) no Railway
FROM node:20-alpine AS deps

# Dependências nativas necessárias para sharp e outros pacotes nativos
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app

COPY package*.json ./

# Instalar TODAS as dependências (dev + prod) para o build
RUN npm ci

# ---- Build Stage ----
FROM deps AS build

COPY . .

# Variáveis de build do Vite (precisam estar disponíveis durante o build do frontend)
# Configure esses valores no painel de variáveis do Railway
ARG VITE_STRIPE_PUBLIC_KEY
ARG VITE_R2_ACCOUNT_ID
ARG VITE_R2_BUCKET_NAME

ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY
ENV VITE_R2_ACCOUNT_ID=$VITE_R2_ACCOUNT_ID
ENV VITE_R2_BUCKET_NAME=$VITE_R2_BUCKET_NAME

# Build frontend (Vite → dist/public) e backend (esbuild → dist/index.js)
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

# Dependências nativas para produção (sharp, etc.)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app

COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --omit=dev && npm cache clean --force

# Copiar saída compilada (dist/index.js + dist/public/)
COPY --from=build /app/dist ./dist

# Copiar arquivos estáticos da pasta public/ (reset-password.html, etc.)
COPY --from=build /app/public ./public

# Criar diretório de uploads e backups com permissões corretas
RUN mkdir -p uploads backups && chmod 755 uploads backups

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs && \
    chown -R appuser:nodejs /app

USER appuser

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
