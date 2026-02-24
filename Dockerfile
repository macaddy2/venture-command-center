# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .

# Accept Railway env vars as Docker build args so Vite can embed them
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GITHUB_TOKEN
ARG VITE_OPENAI_API_KEY
ARG VITE_OPENAI_MODEL

RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve@14
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE $PORT
CMD sh -c "serve dist -s -l \$PORT"
