# Base image
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Expose port
EXPOSE 3000

# Start command
CMD ["bun", "run", "src/index.ts"]
