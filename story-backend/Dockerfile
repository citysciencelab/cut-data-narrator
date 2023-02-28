# Create container for running mobility-backend
FROM node:12-alpine

RUN mkdir -p /usr/app/story-backend/dist
WORKDIR /usr/app/story-backend

# Copy mobility-backend sources
COPY story-backend/package.json story-backend/index.js ./
COPY story-backend/routes ./routes
COPY story-backend/controllers ./controllers

# Install and run mobility-backend
RUN npm install

EXPOSE 80
EXPOSE 443
CMD npm start