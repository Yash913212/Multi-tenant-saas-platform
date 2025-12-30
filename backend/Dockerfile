FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN cp -r migrations dist/migrations && cp -r seeds dist/seeds
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/scripts/init.js"]
