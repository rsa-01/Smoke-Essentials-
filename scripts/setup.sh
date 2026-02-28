#!/bin/bash
set -e

echo "🚀 Setting up Smoke & Essentials..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Copy env file if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env file from .env.example"
fi

# Start PostgreSQL
echo "🐘 Starting PostgreSQL..."
docker-compose up postgres -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
sleep 5

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Run migrations
echo "🗄️ Running database migrations..."
npm run db:migrate

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

# Start all services
echo "🚀 Starting all services..."
echo "   Web: http://localhost:3000"
echo "   Admin: http://localhost:3001"
echo "   API: http://localhost:4000"
echo ""
npm run dev
