# Stage 1 - build static assets
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=http://localhost:8082
ARG VITE_CONNECTHUB_API_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CONNECTHUB_API_URL=$VITE_CONNECTHUB_API_URL
RUN npm run build

# Stage 2 - serve with nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
