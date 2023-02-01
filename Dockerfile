# Create container for building stt-frontend
FROM node:16.14.0-alpine as build

RUN apk add --update git openssh

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

RUN mkdir -p addons/dipasAddons
RUN git clone https://till-hcu:GtsKKEPfVqKz,5/@bitbucket.org/geowerkstatt-hamburg/dipas-masterportal-addons.git addons/dipasAddons

COPY portal/mobility-results/addonsConf.json addons/
COPY portal/mobility-results/gfi-addon/results addons/

RUN npm i --prefix addons/dipasAddons/storyTellingTool
RUN npm i --prefix

RUN npm run buildPortal --prefix

# Create container for running stt-frontend
FROM nginx

# Copy build files from build container
COPY --from=build /usr/app/dist /usr/share/nginx/html

EXPOSE 80
