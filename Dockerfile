# TODO Start: [Student] Complete Dockerfile
FROM node:18 AS build

ENV FRONTEND=/opt/frontend

WORKDIR $FRONTEND

RUN yarn config set registry https://registry.npmmirror.com

COPY . .

RUN yarn install

RUN yarn next build

RUN yarn next export

RUN yarn add antd@^4.24.2

FROM nginx:1.22

ENV HOME=/opt/app

WORKDIR $HOME

COPY --from=build /opt/frontend/out dist

COPY nginx /etc/nginx/conf.d

EXPOSE 80
# TODO End