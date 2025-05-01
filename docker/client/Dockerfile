FROM node:alpine as build

WORKDIR /app

COPY client/package*.json ./

RUN npm install

COPY client/ ./

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY docker/client/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
