FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Switch to production environment
ENV NODE_ENV=production

# Expose port 80
EXPOSE 80

# Start the application
CMD ["npm", "run", "preview"]
