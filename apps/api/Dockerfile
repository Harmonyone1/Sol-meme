FROM mirror.gcr.io/library/node:20-bullseye-slim AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --include=dev

COPY prisma ./prisma
COPY tsconfig.json ./tsconfig.json
COPY src ./src

RUN npx prisma generate --schema prisma/schema.prisma \
  && npm run build \
  && npm prune --omit=dev

FROM mirror.gcr.io/library/node:20-bullseye-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.js"]
