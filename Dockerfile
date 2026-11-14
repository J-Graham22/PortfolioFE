FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# The site keeps no data of its own; all content comes from the back end at API_URL.
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
	PORT=3000
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
USER node
EXPOSE 3000
CMD ["node", "build"]
