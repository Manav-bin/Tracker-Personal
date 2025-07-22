#!/bin/bash

# Fitness Progress Tracker - Startup Script
echo "🏋️  Starting Fitness Progress Tracker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create uploads directory if it doesn't exist
mkdir -p backend/uploads

# Create .env file from template if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file. You can customize it if needed."
fi

# Build and start the application
echo "🚀 Building and starting the application..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Application started successfully!"
    echo ""
    echo "🌐 Access your Fitness Progress Tracker:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo ""
    echo "📱 The app is mobile-friendly and ready to use!"
    echo ""
    echo "🛑 To stop the application, run:"
    echo "   docker-compose down"
    echo ""
    echo "📋 To view logs:"
    echo "   docker-compose logs -f"
else
    echo "❌ Failed to start application. Check logs with:"
    echo "   docker-compose logs"
fi
