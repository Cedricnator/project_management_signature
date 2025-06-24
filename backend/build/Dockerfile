FROM node:23-alpine AS base

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# ===== ETAPA DE DEPENDENCIAS =====
FROM base AS deps

WORKDIR /app

# Copiar solo archivos de dependencias para aprovechar cache de Docker
COPY package*.json ./

# Instalar dependencias con configuraciones optimizadas
RUN npm ci --only=production --omit=dev --ignore-scripts && \
    npm cache clean --force


# ===== ETAPA DE TESTING =====
FROM base AS testing

WORKDIR /app

# Copiar archivos de dependencias y configuración
COPY package*.json ./
COPY nest-cli.json tsconfig*.json .swcrc ./
COPY jest.config.js ./

# Instalar TODAS las dependencias (incluyendo dev dependencies para testing)
RUN npm ci --ignore-scripts

# Copiar código fuente y tests
COPY src/ ./src/

# Ejecutar tests - si fallan, el build se detiene aquí
RUN npm run test


# ===== ETAPA DE BUILD =====
FROM base AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY nest-cli.json tsconfig*.json .swcrc ./

# Instalar TODAS las dependencias para el build
RUN npm ci --ignore-scripts

# Copiar código fuente
COPY src/ ./src/

# Build optimizado
ENV APP_ENV=production
RUN npm run build && \
    npm prune --production

# ===== ETAPA DE PRODUCCIÓN =====
FROM base AS runner

WORKDIR /app

# Configurar variables de entorno
ENV APP_ENV=production
ENV PORT=3000

# Crear directorio uploads con permisos correctos ANTES de cambiar a usuario nestjs
RUN mkdir -p /app/uploads && \
    chown -R nestjs:nodejs /app/uploads && \
    chmod 755 /app/uploads

# Copiar dependencias de producción
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiar app compilada
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Cambiar a usuario no-root por seguridad
USER nestjs

# Exponer puerto de la app
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node dist/health-check.js || exit 1

# Comando optimizado con dumb-init
CMD ["dumb-init", "node", "dist/main.js"]