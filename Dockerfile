FROM node:20.18.2-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV NEXT_PUBLIC_API_URL=https://pmcs.site
ENV NEXT_PRIVATE_API_URL=https://pmcs.site/api
ENV API_URL=https://pmcs.site
ENV NEXTAUTH_URL=https://pmcs.site
RUN npm run build

FROM base AS runner
WORKDIR /app
# Security: use non-root user
RUN addgroup --system --gid 1001 nodejs && \
   adduser --system --uid 1001 nextjs
# Copy build files
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
# Runtime configuration
USER nextjs
EXPOSE 3000
ENV PORT 3000 \
   NODE_ENV production \
   HOSTNAME "0.0.0.0"
CMD ["npm", "start"]
