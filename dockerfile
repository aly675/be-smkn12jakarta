# ==========================================
# STAGE 1: BUILDER (Fase Ngerakit Aplikasi)
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

# Enable corepack biar yarn bisa langsung dipake di Alpine
RUN corepack enable

# Copy file dependency & prisma duluan biar kena cache Docker
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install semua dependency (termasuk devDependencies buat nge-build)
RUN yarn install --frozen-lockfile

# Generate Prisma Client (Wajib!)
RUN npx prisma generate

# Copy seluruh source code
COPY . .

# Build NestJS (ngubah TypeScript jadi JavaScript di folder /dist)
RUN yarn build

# ==========================================
# STAGE 2: PRODUCTION (Fase Image Final)
# ==========================================
FROM node:24-alpine AS production

WORKDIR /app

# Enable corepack untuk production
RUN corepack enable

# Hanya copy file yang bener-bener dibutuhin buat jalanin app dari Stage 1
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Set environment ke production
ENV NODE_ENV=production
ENV PORT=3000

# Buka port 3000
EXPOSE 3000

# Perintah utama untuk nyalain server
CMD ["yarn", "start:prod"]