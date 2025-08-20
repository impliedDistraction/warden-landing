FROM node:20-alpine

# Install Python for AI dependencies
RUN apk add --no-cache python3 py3-pip curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Install Ollama for local AI
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S botuser -u 1001
USER botuser

# Expose ports
EXPOSE 3000 11434

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start command
CMD ["npm", "start"]