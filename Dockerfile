# Build stage
FROM node:18-alpine AS builder
ARG DB_HOST
ARG DB_PORT
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_DATABASE

ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_USERNAME=$DB_USERNAME
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_DATABASE=$DB_DATABASE

ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET

ARG EMAIL_USER
ARG EMAIL_APP_PASSWORD
ARG EMAIL_FROM

ENV EMAIL_USER=$EMAIL_USER
ENV EMAIL_APP_PASSWORD=$EMAIL_APP_PASSWORD
ENV EMAIL_FROM=$EMAIL_FROM


WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build
RUN echo "=== After build ===" && ls -la && echo "=== Dist folder ===" && ls -la dist/



# Development stage
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build
RUN echo "=== Starting database seed ===" && \
    NODE_ENV=development npm run seed || (echo "Seeding failed" && exit 1)
EXPOSE 3000

ARG DB_HOST
ARG DB_PORT
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_DATABASE

ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_USERNAME=$DB_USERNAME
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_DATABASE=$DB_DATABASE

ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET

CMD ["npm", "run", "start:dev"]