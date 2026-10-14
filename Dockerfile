# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
# Hacia dónde reenvía nginx los requests a /api (el BFF en NestJS). Se puede cambiar al ejecutar.
ENV BFF_URL=http://backend:3000
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/sii-test-frontend/browser /usr/share/nginx/html
EXPOSE 8080
