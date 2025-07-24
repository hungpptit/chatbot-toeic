FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash curl

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

EXPOSE 8080
ENV NODE_ENV=production

CMD /wait-for-db.sh "$DB_HOST" "$DB_PORT" node src/server.js
