#!/bin/bash
# Render deployment script - runs automatically on every deploy

# Install dependencies
npm ci

# Run Prisma migrations
npx prisma migrate deploy

# Build the Next.js app
npm run build
