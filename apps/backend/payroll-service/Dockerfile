# Use the puppeteer image as base
FROM ghcr.io/puppeteer/puppeteer:24.2.1

# Switch to root for installation
USER root
WORKDIR /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y python3 make g++

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install
RUN npm install typescript --save-dev

# Copy source code (node_modules excluded via .dockerignore)
COPY . .

# Create cache and data directories
RUN mkdir -p /app/.cache /app/.local/share/puppeteer /app/data && \
    chown -R pptruser:pptruser /app

# Install Chrome
RUN apt-get update && apt-get install -y wget gnupg && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# Switch back to pptruser
USER pptruser

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=4096"

EXPOSE 5001

# Start command that first builds the TypeScript then runs the app
CMD npm run build && node dist/index.js 




# # Use the puppeteer image as base
# FROM ghcr.io/puppeteer/puppeteer:24.2.1

# # Switch to root for installation
# USER root
# WORKDIR /app

# # Install dependencies
# RUN apt-get update && \
#     apt-get install -y python3 make g++

# # Copy package files
# COPY package.json ./

# # Install dependencies
# RUN npm install
# RUN npm install typescript --save-dev

# # Copy source code (node_modules excluded via .dockerignore)
# COPY . .

# # Create cache and data directories
# RUN mkdir -p /app/.cache /app/.local/share/puppeteer /app/data && \
#     chown -R pptruser:pptruser /app

# # Install Chrome
# RUN apt-get update && apt-get install -y wget gnupg && \
#     wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
#     echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list && \
#     apt-get update && \
#     apt-get install -y google-chrome-stable && \
#     rm -rf /var/lib/apt/lists/*

# # Switch back to pptruser
# USER pptruser

# # Set environment variables
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
#     PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
#     NODE_ENV=production \
#     NODE_OPTIONS="--max-old-space-size=4096"

# EXPOSE 6000

# # Start command that first builds the TypeScript then runs the app
# CMD npm run build && node dist/index.js