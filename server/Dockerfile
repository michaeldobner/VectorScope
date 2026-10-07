# One image for the web server and the collector of the own server (docker-compose.yaml).
# Build: npm ci, npm run build (type check, AIR, INTEL, start page). Tests run on GitHub Actions.
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
# git pushes the raw archive to the branch collector-raw (server/raw-git.mjs).
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data
WORKDIR /app
# node_modules keeps tsx, which runs collector/collect.ts in the collector container.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/modules.json ./
COPY --from=build /app/server ./server
COPY --from=build /app/proxy ./proxy
COPY --from=build /app/collector ./collector
COPY --from=build /app/intel/src ./intel/src
COPY --from=build /app/air/src ./air/src
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8080
CMD ["node", "server/web.mjs"]
