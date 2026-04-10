# STAGE 1: Build Image
FROM node:20-alpine AS build

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy source code and build it
COPY . .
RUN npm run build

# STAGE 2: Production Proxy
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build assets from stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Export port 80
EXPOSE 80

# Start up Nginx
CMD ["nginx", "-g", "daemon off;"]
