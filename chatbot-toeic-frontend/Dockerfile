# 🏗️ Build stage
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

# ✅ Cài cả devDependencies để dùng tsc và vite
RUN npm install

COPY . .

RUN npm run build

# 🧊 Serve with Nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist .
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
