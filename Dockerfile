FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY backend ./backend
COPY public ./public

EXPOSE 10000

CMD ["npm", "start"]
