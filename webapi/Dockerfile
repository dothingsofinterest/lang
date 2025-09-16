FROM node:20 AS build_image

WORKDIR /app

COPY . /app

RUN npm install && npm run build

FROM node:20-alpine

WORKDIR /app

COPY . /app

COPY --from=build_image /app/dist ./dist
COPY --from=build_image /app/node_modules ./node_modules

RUN npm install pm2 -g

EXPOSE 9000

CMD ["pm2-docker","process.yaml"]