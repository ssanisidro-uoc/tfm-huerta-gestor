FROM node:20-alpine AS builder

# Frontend build
WORKDIR /app/frontend
COPY APP-Front/app-front/package*.json ./
RUN npm ci
COPY APP-Front/app-front/ ./
RUN npm run build

# Backend build
WORKDIR /app/backend
COPY App-Back/package*.json ./
RUN npm ci --include=dev
COPY App-Back/ ./
RUN npm run build

# Runtime
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache nginx

COPY --from=builder /app/frontend/dist/app-front/browser /app/public
COPY --from=builder /app/backend/build /app/backend
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 8080
CMD ["/app/start.sh"]