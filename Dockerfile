# Create container for building stt-frontend
FROM node:16.14.0-alpine as build

RUN mkdir -p /usr/app
WORKDIR /usr/app

RUN apk add --no-cache git
RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

COPY . .

RUN npm i --prefix addons/storyTellingTool
RUN npm i --prefix

RUN npm run buildPortal --prefix

# Create container for running stt-frontend
FROM nginx

# Copy build files from build container
COPY --from=build /usr/app/dist /usr/share/nginx/html

EXPOSE 80
