#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting deployment process..."

# 1. Fetch latest changes from github main branch
echo "📦 Pulling latest code from origin/main..."
git pull origin main

# 2. Rebuild and restart docker compose (in detached mode)
echo "🐳 Rebuilding and starting the Docker container..."
docker compose up -d --build

echo "✅ Deployment complete! The application is running at http://localhost:3000"
