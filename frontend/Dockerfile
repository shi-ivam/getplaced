# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build args for frontend environment variables during build
ARG VITE_NODE_API_URL=http://localhost:3000
ARG VITE_PY_API_URL=http://localhost:8000
ENV VITE_NODE_API_URL=$VITE_NODE_API_URL
ENV VITE_PY_API_URL=$VITE_PY_API_URL

RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
