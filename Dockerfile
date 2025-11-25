# Use official Playwright image with Node.js
FROM mcr.microsoft.com/playwright:v1.54.1-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all project files
COPY . .

# Create directories for reports and screenshots
RUN mkdir -p screenshots report-summary/summaries test-results playwright-report

# Set environment variable for headed mode (optional, default is headless in CI)
ENV HEADLESS=true

# Run tests
CMD ["npx", "playwright", "test"]
