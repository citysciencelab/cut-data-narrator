# Create container for building mobility-frontend
FROM node:16.13.2-alpine as build

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

COPY . ./masterportal

RUN git clone https://till-hcu:ATBB8uZXuGFtaKkCs9Mt9hhNwZWk74C19AD8@bitbucket.org/geowerkstatt-hamburg/dipas-masterportal-addons.git masterportal/addons/dipasAddons
COPY portal/addonsConf.json ./masterportal/addons/

RUN npm i --prefix masterportal/addons/dipasAddons/storyTellingTool
RUN npm i --prefix masterportal

RUN npm run buildPortal --prefix masterportal

# Create container for running mobility-frontend
FROM nginx

# Copy build files from build container
COPY --from=build /usr/app/masterportal/dist /usr/share/nginx/html

EXPOSE 80
