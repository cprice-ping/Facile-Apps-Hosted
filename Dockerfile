# Use official Node.js 16 LTS image
# Use official Node.js LTS (later) image
FROM node:lts-alpine

# Create and set working directory
WORKDIR /usr/src/app

# Install app dependencies
# Copy package.json and package-lock.json (if available)
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Default environment variable for port
ENV PORT=3000

# Expose application port
EXPOSE ${PORT}

# Start the application
CMD ["npm", "start"]
