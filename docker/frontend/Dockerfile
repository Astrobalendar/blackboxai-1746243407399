# Dockerfile for AstroBalendar Frontend (React + Vite + Tailwind)
FROM node:20-alpine AS builder
WORKDIR /app
COPY apps/frontend/package*.json ./
RUN npm install
COPY apps/frontend .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
