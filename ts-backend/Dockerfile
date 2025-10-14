FROM node:24-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including tsx for running TypeScript)
RUN pnpm install --frozen-lockfile

# Copy source code and necessary files
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
COPY tsconfig.json ./

# Expose port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Run the application using tsx
CMD ["pnpm", "tsx", "src/index.ts"]
