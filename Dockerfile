# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install FFmpeg and dependencies needed for audio
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++ \
    git

# Create app directory
WORKDIR /usr/src/app

# Copy package files first (better Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S radiobot -u 1001 -G nodejs

# Change ownership of app directory to radiobot user
RUN chown -R radiobot:nodejs /usr/src/app
USER radiobot

# Expose port for health checks (optional)
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Bot is healthy')" || exit 1

# Start the bot
CMD ["npm", "start"]