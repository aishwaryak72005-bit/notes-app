# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Argument for custom backend API URL during build (defaults to /api/ for reverse proxy)
ARG VITE_API_URL=/api/
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production serve stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
