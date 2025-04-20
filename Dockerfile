# Build stage
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Create uploads directory
RUN mkdir -p uploads

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=development

# Expose the port
EXPOSE 8080

# Start the application in production mode
CMD ["npm", "run", "start"]