# Base image: Node 14.28.0 (https://www.remotion.dev/docs/lambda/feb-2023-incident#cause)
FROM node:14.28.0-alpine

RUN apt-get install chromium

# Install PNPM
RUN npm install -g pnpm

# Create application directory and move there
WORKDIR /app

# Copy package.json and pnpm-lock.yaml from the host to the container
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the app
RUN pnpm server:build

# Download ffmpeg and ffprobe
RUN pnpm exec remotion install ffmpeg
RUN pnpm exec remotion install ffprobe

# Expose the port
EXPOSE 3050

# Start the server
CMD ["pnpm", "server:start:prod"]